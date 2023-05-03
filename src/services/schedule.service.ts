import StoreSitemapModel from '../models/store-sitemap.model';

const schedule = require('node-schedule');
const crawlerService = require('../services/crawler.service');
import logger from '../helpers/logger.helper';

const scheduleSitesCrawl = async () => {
    const { crawlSites, sitesConfig } = require('../config/sites.config');
    const unfinishedCrawls = [];

    for (const siteKey of crawlSites) {
        const siteObj = sitesConfig[siteKey];
        const siteSchedule = siteObj?.productSitemap?.schedule;
        if (siteSchedule) {
            const crawlingLeftUnfinished = await crawlerService.isAlreadyScraping(siteKey);

            if (crawlingLeftUnfinished) {
                const unfinishedSitemaps = await crawlerService.getUnfinishedSitemaps(siteKey);
                for (const sitemap of unfinishedSitemaps) {
                    unfinishedCrawls.push({
                        site: siteKey,
                        storeSitemapId: sitemap._id
                    });
                }
            }

            const job = schedule.scheduleJob({rule: siteSchedule, tz: 'Europe/Riga'}, async () => {
                logger.info('Starting scheduled crawl for site: ' + siteKey);
                const isScraping = await crawlerService.isAlreadyScraping(siteKey);
                if (!isScraping) {
                    const storeSitemapId = await crawlerService.getProductUrlsFromSite(siteKey);
                    if (storeSitemapId) {
                        await crawlerService.scrapeProducts([siteKey], storeSitemapId);
                    }
                } else {
                    logger.warn('Crawling for site ' + siteKey + ' is already in progress. Skipping scheduled crawl.');
                }
            });
            logger.info('Next scheduled crawl for site ' + siteKey + ' is on ' + job.nextInvocation().toString());
        }
    }

    if (unfinishedCrawls.length > 0) {
        logger.info('Continuing unfinished crawling for sites: ' + unfinishedCrawls.map((crawl: any) => crawl.site).join(', '));
        for (const crawl of unfinishedCrawls) {
            const { site, storeSitemapId } = crawl;
            crawlerService.scrapeProducts([site], storeSitemapId).then();
        }
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