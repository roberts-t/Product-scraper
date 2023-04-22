import logger from '../helpers/logger.helper';
import StoreSitemap, { IStoreSitemap } from '../models/store-sitemap.model';
import { AxiosError, AxiosResponse } from 'axios';
import StoreSitemapModel from '../models/store-sitemap.model';
import ProductModel from '../models/product.model';
import { HydratedDocument } from 'mongoose';
import ProductLinkModel, { IProductLink } from '../models/product-link.model';

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
            const storeSitemap = await StoreSitemapModel.findOne({ site: siteKey, scrapingDone: false });
            if (!storeSitemap) {
                logger.info(`Finished scraping products for ${siteObj.name}`);
                allProductsFinished = true;
            }
            while (!allProductsFinished && storeSitemap) {
                const notScrapedProduct = await ProductLinkModel.findOne({ storeSitemap: storeSitemap?._id, scrapingFailed: false, product: undefined });
                if (!notScrapedProduct) {
                    logger.info(`Finished scraping products for ${siteObj.name}`);
                    allProductsFinished = true;
                    await StoreSitemapModel.updateOne({ site: siteKey }, { $set: { finishedScraping: true, scrapingFinishedAt: new Date() } });
                } else {
                    await scrapeProduct(notScrapedProduct, storeSitemap, siteObj);
                }
            }
            if (storeSitemap) {
                storeSitemap.scrapingDone = true;
                await storeSitemap.save();
            }
            resolve();
        });
        sitePromises.push(sitePromise);
    }
}

const scrapeProduct = async (productLink: HydratedDocument<IProductLink>, storeSitemap: HydratedDocument<IStoreSitemap>, siteObj: any): Promise<void> => {
    const url = productLink.url;
    if (!url) return;
    const requestDelayPromise = new Promise(resolve => setTimeout(resolve, 4000));
    const response = await tryRequest(url);
    const data = response?.data;

    try {
        if (!data) {
            logger.error(`Failed to get product data from ${url}`);
            productLink.scrapingFailed = true;
        } else {
            const productData = await siteObj.service.processProductData(data, siteObj, siteObj.name, url);
            if (!productData) {
                logger.error(`Failed to process product data from ${url}`);
                productLink.scrapingFailed = true;
            } else {
                const newProduct = new ProductModel(productData);
                newProduct.sitemap = storeSitemap._id;
                await newProduct.save();

                productLink.product = newProduct._id;
                productLink.scrapedAt = new Date();
                logger.info(`Scraped product ${productData.name} from ${url}`);
            }
        }
        await productLink.save();
        if (storeSitemap.notScrapedProductsLeft) {
            storeSitemap.notScrapedProductsLeft--;
            await storeSitemap.save();
        }
    } catch (error) {
        logger.error(error + ' - ' + url);
        productLink.scrapingFailed = true;
    }

    try {
        await productLink.save();
    } catch (error) {
        logger.error(error);
    }

    await requestDelayPromise;
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
                const productLinks = [] as IProductLink[];
                for (const url of productUrls) {
                    const newProductLink = new ProductLinkModel({
                        url,
                        storeSitemap: storeSitemap._id

                    });
                    productLinks.push(newProductLink);
                }
                await ProductLinkModel.insertMany(productLinks);

                allProductUrls = allProductUrls.concat(productUrls);
                await requestDelayPromise;
            } catch (error) {
                logger.error(error);
            }
        }
    }
    logger.info(`Found ${allProductUrls.length} product urls for ${siteKey} in ${urls.length} sitemaps`)
    storeSitemap.totalProducts = allProductUrls.length;
    storeSitemap.notScrapedProductsLeft = allProductUrls.length;
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
            const err = error as AxiosError
            if (err?.response?.status === 404) {
                logger.warn(`404 error for ${url}`);
                success = true;
            } else {
                logger.warn(`Failed to get data from ${url} - try ${tries + 1} of ${MAX_TRIES}, error: ${error}`);
                tries++;
            }
            await new Promise(resolve => setTimeout(resolve, 4000));
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