import { Request, Response } from 'express';
import RequestModel from '../models/request.model';
import ProductModel, { ProductSchema } from '../models/product.model';
import moment from 'moment';
import logger from '../helpers/logger.helper';
import StoreSitemapModel from '../models/store-sitemap.model';
import { addSiteDataToProducts, getDbProductParams } from '../helpers/product.helper';

const { sitesConfig, availableSites } = require('../config/sites.config');


const getScrapingResults = async (req: Request, res: Response) => {
    const query = req.body.query;
    const updated = req.body.updated;

    const sites = availableSites;

    // Check if there is a cached request for this query (same query requested today)
    const cachedRequest = await RequestModel.findOne({
        query: query.toLowerCase(),
        createdAt: { $gte: moment().startOf('day').toDate() },
    }).sort({ createdAt: -1 }).lean();

    if (cachedRequest && !updated) {
        logger.info('Using cached request for query: ' + query);
        const products = cachedRequest.products;

        return res.status(200).json({
            products: products,
            updateAvailable: !updated ?? true
        });
    }

    try {
        let productPromises = [] as Promise<typeof ProductSchema[]>[];

        for (const site of sites) {
            const siteConfig = sitesConfig[site];
            const siteService = siteConfig.service;

            // Check for sites that use sitemap in which case get products from database
            // If 'updated' param is true, then scrape products from site if direct scraping is available (processSearchData)
            if (siteService.processSitemapData && (!updated || siteService.processSearchData === undefined)) {
                const productPromise = new Promise<typeof ProductSchema[]>(async (resolve) => {
                    const latestSitemap = await StoreSitemapModel.findOne({ site: site, scrapingDone: true }).sort({ createdAt: -1 }).lean();
                    if (!latestSitemap) {
                        resolve([]);
                        return;
                    }

                    let dbProducts: typeof ProductSchema[];
                    // Use Atlas Search for PRODUCTION
                    if (process.env.NODE_ENV === 'PROD') {
                        dbProducts = await ProductModel.aggregate([
                            {
                                $search: {
                                    "index": "product-index",
                                    "text": {
                                        "query": query,
                                        "path": "name",
                                        "fuzzy": {}
                                    }
                                },
                            },
                            {
                                $match: {
                                    sitemap: latestSitemap._id,
                                    available: true
                                }
                            }
                        ]).exec();
                    } else {
                        // Use regex for DEV
                        const queryRegex = new RegExp(query, 'i');
                        dbProducts = await ProductModel.find({
                            sitemap: latestSitemap._id,
                            name: queryRegex,
                            available: true
                        }).lean();
                    }
                    dbProducts = addSiteDataToProducts(dbProducts, siteConfig);
                    resolve(dbProducts);
                });
                productPromises.push(productPromise);
            } else {
                // Scrape products from site
                const ScrapingClient = require('../helpers/request.helper');
                const productPromise = new Promise<typeof ProductSchema[]>(async (resolve) => {
                    logger.info('Scraping ' + site + ' for query: ' + query);
                    try {
                        const { data } = await ScrapingClient.get(siteConfig.getUrl(encodeURIComponent(query)));
                        let productsData = await siteService.processSearchData(data, siteConfig, site);
                        productsData = addSiteDataToProducts(productsData, siteConfig);
                        resolve(productsData);
                    } catch (error) {
                        logger.error("Failed to scrape " + site + " for query: " + query + " with error: " + error);
                        resolve([]);
                    }
                });
                productPromises.push(productPromise);
            }
        }

        const products = (await Promise.all(productPromises)).flat();
        const dbFormattedProducts = products.map(product => {
            return getDbProductParams(product);
        });
        const request = new RequestModel({
            products: products,
            query: query.toLowerCase(),
            sites: sites
        });
        await request.save();

        // Insert scraped products into database (for price history)
        await ProductModel.insertMany(dbFormattedProducts, { ordered: false });

        res.status(200).json({
            products: products,
            updateAvailable: !updated ?? true
        });
    } catch (e) {
        logger.error(e);
        return res.sendStatus(500);

    }
}

module.exports = {
    getScrapingResults
}