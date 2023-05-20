import { Request, Response } from 'express';
const crawlerService = require('../services/crawler.service');
import logger from '../helpers/logger.helper';


const forceCrawl = async (req: Request, res: Response) => {
    const sites = req.body.sites;
    logger.warn(`Force crawl request from ${req.ip}, sites: ${sites}`);

    if (!sites) {
        return res.status(400).json({ errorMsg: 'INVALID_REQUEST' });
    }
    const { crawlSites } = require('../config/sites.config');
    const crawlPromises = [];
    const validSites = [];

    for (let site of sites) {
        if (crawlSites.includes(site)) {
            const crawlPromise = new Promise<void>(async (resolve) => {
                const storeSitemapId = await crawlerService.getProductUrlsFromSite(site);
                if (storeSitemapId) {
                    await crawlerService.scrapeProducts([site], storeSitemapId);
                }
                resolve();
            });
            crawlPromises.push(crawlPromise);
            validSites.push(site);
        }
    }

    res.status(200).json({ msg: 'CRAWL_STARTED ' + validSites.join(', ') });
    await Promise.all(crawlPromises);
    return;
}

module.exports = {
    forceCrawl
}