import axios from 'axios'
import cheerio from 'cheerio'
import fs from 'fs'
import sanitizeHtml from 'sanitize-html'
import chalk from 'chalk'

const url = 'https://www.4vultures.org/2019/05/23/griffon-vulture-falls-victim-to-severe-lead-poisoning/'
// const url = 'http://listverse.com/2019/05/26/10-uplifting-stories-to-get-you-through-the-week-5-26-19/'

const selectors = {
  title: '#content_area .j-blog-post--headline',
  tags: '.j-blog-post--tags-list .j-blog-post--tag',
  date: '#content_area .j-blog-post--date',
  content: '.j-blog-post--header'
}

// const selectors = {
//   title: '.the-article h1',
//   tags: '#articlecontentonly h2',
//   date: '.the-article .meta time',
//   content: '#articlecontentonly'
// }

const getPageContent = async (url) => {
  return await axios.get(url)
    .then(response => {
        const $ = cheerio.load(response.data, {
          normalizeWhitespace: true
        });
        // console.log(chalk.cyan(`  Scraping: ${url}`))

        const tags = [];
        $(selectors.tags).each((i, elem) => {
          tags.push($(elem).text());
        });

        const data = {
          title: $(selectors.title).text(),
          date: $(selectors.date).text().trim(),
          content: sanitizeHtml($(selectors.content).next().html(), {
            allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img','figure','figcaption']).filter(element => element !== 'div' ),
            allowedAttributes: {
              a: [ 'href', 'name', 'target' ],
              img: [ 'src' ]
            },
            textFilter: function(text) {
              return text.replace(/\r?\n|\r|  +|/g, ''); // new lines
            },
            exclusiveFilter: function(frame) {
              return frame.tag === 'p' && !frame.text.trim();
            }
          }).replace(/((?:dimension=([\w\-]+)(\S+)?:)?)/gm, ''),
          tags: tags
        };
        return data;
    })
    .catch(err => {
        console.log(err);
    });
}

// getPageContent(url)

module.exports = getPageContent;
