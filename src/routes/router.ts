import { Router } from 'express';
const scrapingController = require('../controllers/scraping.controller');
const crawlerController = require('../controllers/crawler.controller');
const router: Router = Router();

router.get('/', (req, res) => {
    crawlerController.getProductUrls();
});

router.post('/products', scrapingController.getScrapingResults);

module.exports = router;