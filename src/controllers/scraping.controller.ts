import { Request, Response } from 'express';
import axios from "axios";
import * as https from "https";
const crypto = require('crypto');
const logger = require('../helpers/logger.helper');
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

    try {
        // Iterate through sites
        for (const site of sites) {
            const siteConfig = sitesConfig[site];
            const siteService = siteConfig.service;

            const httpsAgent = new https.Agent({
                secureOptions: crypto.constants.SSL_OP_LEGACY_SERVER_CONNECT,
            });
            // Get scraping results
            const { data } = await axios.get(siteConfig.getUrl(query), {
                httpsAgent,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.169 Safari/537.36',
                    'Accept': '*/*',
                    'Accept-Encoding': 'gzip, deflate, br',
                }
            });
            await siteService.processSearchData(data, siteConfig);
        }

    } catch (e) {
        logger.error(e);
        return res.status(500).json({ errorCode: 'SERVER_ERROR' });

    }
    return res.sendStatus(200);
}

module.exports = {
    getScrapingResults
}