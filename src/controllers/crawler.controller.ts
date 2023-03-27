import cheerio from "cheerio";
const logger = require('../helpers/logger.helper');

const getProductUrls = async (): Promise<void> => {
    const { sitesConfig } = require('../config/sites.config');
    const promises = [] as Promise<string[]>[];

    for (const site in sitesConfig) {
        const siteObj = sitesConfig[site];
        const sitemapUrls = siteObj.productSitemap?.urls;
        const sitemapSelector = siteObj.productSitemap?.selector;
        if (sitemapUrls) {
            const promise = new Promise<string[]>(async (resolve) => {
                const productUrls = await scrapeSitemaps(sitemapUrls, siteObj, sitemapSelector);
                resolve(productUrls);
            });
            promises.push(promise);
        }
    }
}

async function scrapeSitemaps(urls: string[], site: any, selector: string): Promise<string[]> {
    const ScrapingClient = require('../helpers/request.helper');
    let allProductUrls = [] as string[];

    for (const sitemapUrl of urls) {
        logger.info(`Scraping SiteMap - url: ${sitemapUrl}`);
        if (site.service?.processSitemapData) {
            try {
                const { data } = await ScrapingClient.get(sitemapUrl)
                const productUrls = await site.service.processSitemapData(data, selector);
                allProductUrls = allProductUrls.concat(productUrls);
            } catch (error) {
                logger.error(error);
            }
        }
        await new Promise(resolve => setTimeout(resolve, 5000));
    }

    return allProductUrls;
}



module.exports = {
    getProductUrls
}