import StoreSitemapModel from '../models/store-sitemap.model';

const schedule = require('node-schedule');
const crawlerService = require('../services/crawler.service');
import logger from '../helpers/logger.helper';

const scheduleSitesCrawl = async () => {
    const { crawlSites, sitesConfig } = require('../config/sites.config');
    const unfinishedCrawls = [] as string[];

    for (const siteKey of crawlSites) {
        const siteObj = sitesConfig[siteKey];
        const siteSchedule = siteObj?.productSitemap?.schedule;
        if (siteSchedule) {
            const crawlingLeftUnfinished = await crawlerService.isAlreadyScraping(siteKey);
            console.log('crawlingLeftUnfinished: ' + crawlingLeftUnfinished + ' for site: ' + siteKey);

            if (crawlingLeftUnfinished) {
                unfinishedCrawls.push(siteKey);
            }

            const job = schedule.scheduleJob({rule: siteSchedule, tz: 'Europe/Riga'}, async () => {
                console.log('Starting scheduled crawl for site: ' + siteKey);
                const isScraping = await crawlerService.isAlreadyScraping(siteKey);
                if (!isScraping) {
                    await crawlerService.getProductUrlsFromSite(siteKey);
                    await crawlerService.scrapeProducts([siteKey]);
                } else {
                    logger.warn('Crawling for site ' + siteKey + ' is already in progress. Skipping scheduled crawl.');
                }
            });
            logger.info('Next scheduled crawl for site ' + siteKey + ' is on ' + job.nextInvocation().toString());
        }
    }

    if (unfinishedCrawls.length > 0) {
        logger.info('Continuing unfinished crawling for sites: ' + unfinishedCrawls.join(', '));
        await crawlerService.scrapeProducts(unfinishedCrawls);
    } else {
        const sitemaps = await StoreSitemapModel.find({});
        if (sitemaps.length === 0) {
            // Scrape all sites for the first time
            logger.info('No sitemaps found. Starting to scrape all sites for the first time.');
            const validSites = await crawlerService.getAllProductUrlsFromSites();
            await crawlerService.scrapeProducts(validSites);
        }
    }
}

module.exports = {
    scheduleSitesCrawl
}