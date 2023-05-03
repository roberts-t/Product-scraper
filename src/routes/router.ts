import { Router } from 'express';
const scrapingController = require('../controllers/scraping.controller');
const accessController = require('../controllers/access.controller');
const productController = require('../controllers/product.controller');
const crawlController = require('../controllers/crawl.controller');
const authMiddleware = require('../middlewares/access.middleware');
const guestMiddleware = require('../middlewares/guest.middleware');
const adminMiddleware = require('../middlewares/admin.middleware');
const router: Router = Router();

router.post('/products', authMiddleware, scrapingController.getScrapingResults);

router.post('/access', guestMiddleware, accessController.getAccess);
router.post('/access/refresh', accessController.refreshAccess);
router.post('/access/logout', authMiddleware, accessController.logout);

router.post('/product/history', authMiddleware, productController.readHistory);

// Admin routes
router.post('/force-crawl', adminMiddleware, crawlController.forceCrawl);

module.exports = router;