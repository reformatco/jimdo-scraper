import axios from 'axios'
import cheerio from 'cheerio'
import fs from 'fs'
import sanitizeHtml from 'sanitize-html'
import chalk from 'chalk'
import https from 'https'

const url = 'https://www.4vultures.org/2019/05/23/griffon-vulture-falls-victim-to-severe-lead-poisoning/'
// const url = 'http://listverse.com/2019/05/26/10-uplifting-stories-to-get-you-through-the-week-5-26-19/'

const selectors = {
  title: '#content_area .j-blog-post--headline',
  tags: '.j-blog-post--tags-list .j-blog-post--tag',
  date: '#content_area .j-blog-post--date',
  content: '.j-blog-post--header',
  images: '#content_area .cc-imagewrapper img'
}

function saveImageToDisk(url, localPath) {
  var fullUrl = url;
  var file = fs.createWriteStream(localPath);
  var request = https.get(url, function(response) {
    response.pipe(file);
  });
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
        console.log(chalk.cyan(`  Scraping: ${url}`))

        const n = url.split('/');
        const slug = n[n.length-2];
        const outputFile = `./dist/${slug}.json`;

        const tags = [];
        $(selectors.tags).each((i, elem) => {
          tags.push($(elem).text());
        });

        let images = [];
        $(selectors.images).each((i, elem) => {
          const sourcefile = $(elem).attr('src').replace(/(dimension=(\d+)x(\d+):)/g,'');
          // maybe use image id for filename
          // version\/(\d+)\/image

          // saveImageToDisk(sourcefile, `./dist/${slug}-${i}.jpg`);
          images.push({
            url: sourcefile,
            alt: $(elem).attr('alt')
          });
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
          images: images,
          tags: tags
        };

        // fs.writeFile(outputFile, JSON.stringify(data, null, 4), (err) => {
        //     if (err) {
        //     console.log(err)
        //     }
        //     console.log(chalk.yellow.bgBlue(`\n Result exported successfully to ${chalk.underline.bold(outputFile)}\n`))
        // });
        console.log(data);
        return data;
    })
    .catch(err => {
        console.log(err);
    });
}

getPageContent(url)

module.exports = getPageContent;
