import logger from '../helpers/logger.helper';
import StoreSitemap from '../models/store-sitemap.model';
import { AxiosResponse } from 'axios';
import StoreSitemapModel from '../models/store-sitemap.model';
import ProductModel from '../models/product.model';
import { Types } from 'mongoose';

const MAX_TRIES = 3;
const { crawlSites, sitesConfig } = require('../config/sites.config');

const getProductUrlsFromSite = async (siteKey: string): Promise<boolean> => {
    logger.info('Starting to scrape sitemaps for site: ' + siteKey);
    if (!crawlSites.includes(siteKey)) {
        return false;
    }

    const siteObj = sitesConfig[siteKey];
    const sitemapUrls = siteObj.productSitemap?.urls;
    if (!sitemapUrls) {
        return false;
    }

    const sitemapSelector = siteObj.productSitemap?.selector;
    await scrapeSitemaps(sitemapUrls, siteKey, sitemapSelector);
    logger.info('Finished scraping sitemaps for site: ' + siteKey);
    return true;
}
const getAllProductUrlsFromSites = async (): Promise<any[]> => {
    const promises = [] as Promise<void>[];
    const validSites = [] as string[];

    for (const siteKey of crawlSites) {
        const promise = new Promise<void>(async (resolve) => {
            const productsFetched = await getProductUrlsFromSite(siteKey);
            if (productsFetched) {
                validSites.push(siteKey);
            }
            resolve();
        });
        promises.push(promise);
    }

    await Promise.all(promises);
    logger.info('Finished scraping all site sitemaps');
    return validSites;
}

const scrapeProducts = async (siteKeys: string[]): Promise<void> => {
    let sitePromises = [] as Promise<void>[];
    for (const siteKey of siteKeys) {
        const siteObj = sitesConfig[siteKey];
        const sitePromise = new Promise<void>(async (resolve) => {
            let allProductsFinished = false;
            while (!allProductsFinished) {
                const storeSitemap = await StoreSitemapModel.findOne(
                    { site: siteKey, scrapingDone: false, productLinks: { $elemMatch: { scrapingFailed: false, product: undefined } } },
                    { 'productLinks.$': 1 }
                );
                if (!storeSitemap) {
                    logger.info(`Finished scraping products for ${siteObj.name}`);
                    allProductsFinished = true;
                    await StoreSitemapModel.updateOne({ site: siteKey }, { $set: { finishedScraping: true, scrapingFinishedAt: new Date() } });
                } else {
                    await scrapeProduct(storeSitemap.productLinks[0].url, siteObj, storeSitemap._id, storeSitemap.productLinks[0]._id as Types.ObjectId);
                }
            }
            resolve();
        });
        sitePromises.push(sitePromise);
    }
}

const scrapeProduct = async (url: string | undefined, siteObj: any, storeSitemapId: Types.ObjectId, productLinkId: Types.ObjectId): Promise<void> => {
    if (!url) return;
    const response = await tryRequest(url);
    const data = response?.data;
    const requestDelayPromise = new Promise(resolve => setTimeout(resolve, 5000));

    try {
        if (!data) {
            logger.error(`Failed to get product data from ${url}`);
            await failScrapingAttempt(storeSitemapId, productLinkId);
        } else {
            const product = await siteObj.service.processProductData(data, siteObj, siteObj.name, url);
            if (!product) {
                logger.error(`Failed to process product data from ${url}`);
                await failScrapingAttempt(storeSitemapId, productLinkId);
            } else {
                const newProduct = new ProductModel(product);
                await newProduct.save();

                await StoreSitemapModel.updateOne(
                    {_id: storeSitemapId, 'productLinks._id': productLinkId},
                    {$set: {'productLinks.$.product': newProduct._id, 'productLinks.$.scrapedAt': new Date()}}
                );
                logger.info(`Scraped product ${product.name} from ${url}`);
            }
        }
    } catch (error) {
        logger.error(error + ' - ' + url);
        await failScrapingAttempt(storeSitemapId, productLinkId);
    }
    await requestDelayPromise;
}

async function failScrapingAttempt(storeSitemapId: Types.ObjectId, productLinkId: Types.ObjectId) {
    await StoreSitemapModel.updateOne(
        {_id: storeSitemapId, 'productLinks._id': productLinkId},
        {$set: {'productLinks.$.scrapingFailed': true}}
    );
}

async function scrapeSitemaps(urls: string[], siteKey: string, selector: string): Promise<void> {
    let allProductUrls = [] as string[];

    const storeSitemap = new StoreSitemap({
        site: siteKey
    });

    const site = sitesConfig[siteKey];
    for (const sitemapUrl of urls) {
        if (site?.service?.processSitemapData) {
            try {
                const { data } = await tryRequest(sitemapUrl);
                const requestDelayPromise = new Promise(resolve => setTimeout(resolve, 5000));
                if (!data) {
                    logger.error(`Failed to get data from ${sitemapUrl}`);
                    continue;
                }
                const productUrls: string[] = await site.service.processSitemapData(data, selector);
                productUrls.forEach(url => storeSitemap.productLinks.push({url: url}));

                allProductUrls = allProductUrls.concat(productUrls);
                await requestDelayPromise;
            } catch (error) {
                logger.error(error);
            }
        }
    }
    logger.info(`Found ${allProductUrls.length} product urls for ${siteKey} in ${urls.length} sitemaps`)
    await storeSitemap.save();
}

const isAlreadyScraping = async (siteKey: string): Promise<boolean> => {
    const sitemap = await StoreSitemapModel.findOne({ site: siteKey, scrapingDone: false });
    return !!sitemap;
}

const tryRequest = async (url: string): Promise<any> => {
    const ScrapingClient = require('../helpers/request.helper');
    let tries = 0;
    let success = false;
    let res: AxiosResponse<any> | undefined;
    while (!success && tries < MAX_TRIES) {
        try {
            res = await ScrapingClient.get(url);
            success = true;
        } catch (error) {
            logger.warn(`Failed to get data from ${url} - try ${tries + 1} of ${MAX_TRIES}, error: ${error}`);
            tries++;
            await new Promise(resolve => setTimeout(resolve, 5000));
        }
    }
    return res;
}



module.exports = {
    getProductUrlsFromSite,
    getAllProductUrlsFromSites,
    scrapeProducts,
    isAlreadyScraping
}