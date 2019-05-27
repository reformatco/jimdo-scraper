const axios = require('axios')
const cheerio = require('cheerio')
const fs = require('fs')
const chalk = require('chalk')

const url = 'http://listverse.com/'
const outputFile = './dist/data.json'
const parsedResults = []
const pageLimit = 10
let pageCounter = 0
let resultCount = 0

console.log(chalk.yellow.bgBlue(`\n  Scraping of ${chalk.underline.bold(url)} initiated...\n`))

const getWebsiteContent = async (url) => {
  try {
    const response = await axios.get(url)
    const $ = cheerio.load(response.data)

    $('.wrapper .main .new article').map((i, el) => {
        const count = resultCount++
        const title = $(el).find('a').attr('href')
        const url = $(el).find('h3').text()
        // const content = $(el).html()
        
        const metadata = {
            count: count,
            title: title,
            url: url
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

    // Pagination Elements Link
    const nextPageLink = $('.pagination').find('.curr').parent().next().find('a').attr('href')
    console.log(chalk.cyan(`  Scraping: ${nextPageLink}`))
    pageCounter++

    if (pageCounter === pageLimit) {
      exportResults(parsedResults)
      return false
    }

    getWebsiteContent(nextPageLink)

  } catch (error) {
    exportResults(parsedResults)
    console.error(error)
  }
}

