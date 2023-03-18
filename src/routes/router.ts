import { Router } from 'express';
const scrapingController = require('../controllers/scraping.controller');
const router: Router = Router();

router.get('/', (req, res) => {
    res.send('Hello World!');
});

router.get('/test', scrapingController.getScrapingResults);

module.exports = router;