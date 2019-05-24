# Jimdo scraper using Node.js

Initial experiment using (cheerio)[https://github.com/cheeriojs/cheerio] and (sanitize-html)[https://github.com/apostrophecms/sanitize-html] to scrape a Jimdo blog enabling you to export content to another CMS.

## To do
- scrape pagination
- scrape each pages within the blog
- save to json file of all blog posts with links, date, title etc
- iterate through each blog post saving data into
  - single json file
  - separate json files
- download source images within the post and change reference in post object