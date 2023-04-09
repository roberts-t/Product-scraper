import { Request, Response } from 'express';
import RequestModel from '../models/request.model';
import { ProductSchema } from '../models/product.model';
import moment from 'moment';
import logger from '../helpers/logger.helper';
const { sitesConfig, availableSites } = require('../config/sites.config');


const getScrapingResults = async (req: Request, res: Response) => {
    const sites = req.body.sites;
    const query = req.body.query;

    // Check if sites are valid
    if (sites.length > availableSites.length) {
        return res.status(400).json({ errorCode: 'INVALID_REQUEST' });
    }
    for (const site of sites) {
        if (!availableSites.includes(site)) {
            return res.status(400).json({ errorCode: 'INVALID_REQUEST' });
        }
    }

    const cachedRequest = await RequestModel.findOne({
        query: query.toLowerCase(),
        createdAt: { $gte: moment().startOf('day').toDate() },
    });

    if (cachedRequest) {
        logger.info('Using cached request for query: ' + query);
        const products = cachedRequest.products;
        return res.status(200).json(products);
    }

    try {
        let productPromises = [] as Promise<typeof ProductSchema[]>[];

        for (const site of sites) {
            const siteConfig = sitesConfig[site];
            const siteService = siteConfig.service;

            const ScrapingClient = require('../helpers/request.helper');
            const productPromise = new Promise<typeof ProductSchema[]>(async (resolve) => {
                logger.info('Scraping ' + site + ' for query: ' + query);
                const { data } = await ScrapingClient.get(siteConfig.getUrl(encodeURIComponent(query)));
                const productsData = await siteService.processSearchData(data, siteConfig, site);
                resolve(productsData);
            });
            productPromises.push(productPromise);
        }

        const products = (await Promise.all(productPromises)).flat();
        const request = new RequestModel({
            products: products,
            query: query.toLowerCase(),
            sites: sites
        });
        await request.save();
        return res.status(200).json(products);
    } catch (e) {
        logger.error(e);
        return res.sendStatus(500);

    }
}

module.exports = {
    getScrapingResults
}