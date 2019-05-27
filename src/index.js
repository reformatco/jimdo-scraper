import cheerio from 'cheerio'
import axios from 'axios'
import fs from 'fs'
import chalk from 'chalk'
import { resolve } from 'url'
import getPageContent from './pagecontent'

const base = 'https://www.4vultures.org/news/'
const outputFile = './dist/data.json'
const parsedResults = []
const pageLimit = 1
let pageCounter = 0
let resultCount = 0

const selectors = {
  article: '.blogselection .j-blogarticle',
  link: 'h2 a'
}

console.log(chalk.yellow.bgBlue(`\n  Scraping of ${chalk.underline.bold(base)} initiated...\n`))

const getWebsiteContent = async (url) => {
  try {
    const response = await axios.get(url)
    const $ = cheerio.load(response.data)
    const isHomePage = url === base;

    const getFullUrl = link => base.substring(0,base.length - 6) + link;

    $(selectors.article).map((i, el) => {
        const url = resolve(base, $(el).find(selectors.link).attr('href'))
        const postData = getPageContent(url)
        // async awaits wtf
        const metadata = {
            title: postData.title,
            date: postData.date,
            url: url,
            content: postData.content,
            tags: postData.tags
        }
        parsedResults.push(metadata)
    })

    const exportResults = (parsedResults) => {
        if (!fs.existsSync('./dist')){
            fs.mkdirSync('./dist');
        }
        fs.writeFile(outputFile, JSON.stringify(parsedResults, null, 4), (err) => {
            if (err) {
            console.log(err)
            }
            console.log(chalk.yellow.bgBlue(`\n ${chalk.underline.bold(parsedResults.length)} Results exported successfully to ${chalk.underline.bold(outputFile)}\n`))
        })
    }

    // if on first page no current link in sidebar
    let nextPageLink;
    if (!isHomePage) {
      nextPageLink = resolve(base, $('#mainNav2').find('.current').parent().next().find('a').attr('href'))
    } else {
      nextPageLink = resolve(base, $('#mainNav2').children().first().find('a').attr('href'))
    }
    pageCounter++

    if (pageCounter === pageLimit) {
      exportResults(parsedResults)
      return false
    } else {
      console.log(chalk.cyan(`  Scraping: ${nextPageLink}`))
    }

    getWebsiteContent(nextPageLink)

  } catch (error) {
    exportResults(parsedResults)
    console.error(error)
  }
}

getWebsiteContent(base);