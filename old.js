// Gets the list of posts on the page

/*
1. Get array of images within the post, add to object
2. Iterate through each page to create a json file of all the posts
3. Iterate through each post grabbing content and photos
*/

const axios = require('axios');
const cheerio = require('cheerio');
const sanitizeHtml = require('sanitize-html');

// const url = 'https://www.4vultures.org/news/';
const url = 'https://www.4vultures.org/2019/05/23/griffon-vulture-falls-victim-to-severe-lead-poisoning/';

let getList = html => {
  data = [];
  const $ = cheerio.load(html, {
    normalizeWhitespace: true,
    decodeEntities: true
  });
  $('.blogselection .j-blogarticle').each((i, elem) => {
    const header = $(elem).find('h2 a');

    const postDate = {
      day: $(elem).find('.datetime-inner .day').text(),
      month: $(elem).find('.datetime-inner .mon').text(),
      year: $(elem).find('.datetime-inner .yr').text(),
    };

    const formatDate = `${postDate.day} ${postDate.month} ${postDate.year}`;

    data.push({
      title: header.text(),
      date: formatDate,
      link: url.substring(0,url.length - 6) + header.attr('href')
    });
    console.log(data);
  });
}

let getPostContent = html => {
  const $ = cheerio.load(html, {
    normalizeWhitespace: true,
  });

  const tags = [];
  $('.j-blog-post--tags-list .j-blog-post--tag').each((i, elem) => {
    tags.push($(elem).text());
  });

  const data = {
    title: $('#content_area .j-blog-post--headline').text(),
    date: $('#content_area .j-blog-post--date').text().trim(),
    content: sanitizeHtml($('.j-blog-post--header').next().html(), {
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
  console.log(data);
}

axios.get(url)
  .then(response => {
    // getList(response.data);
    getPostContent(response.data);
  })
  .catch(error => {
    console.log(error);
  });