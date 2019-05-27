import rp from 'request-promise'
import cheerio from 'cheerio'
import axios from 'axios'
import fs from 'fs'
import chalk from 'chalk'



const getPageContent = (url) => {
    return rp(url)
        .then((html) => {
            return $('#articlecontentonly', html).html();
        })
        .catch((err) => {
            console.log(err);
        });
}

module.exports = getPageContent;
