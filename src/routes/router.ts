import { Request, Router } from 'express';
import rateLimit from 'express-rate-limit';
const scrapingController = require('../controllers/scraping.controller');
const accessController = require('../controllers/access.controller');
const productController = require('../controllers/product.controller');
const crawlController = require('../controllers/crawl.controller');
const authMiddleware = require('../middlewares/access.middleware');
const guestMiddleware = require('../middlewares/guest.middleware');
const adminMiddleware = require('../middlewares/admin.middleware');
const { isLoggedIn } = require('../helpers/user.helper');
const router: Router = Router();

// Rate limiter for product scraping route
const scrapingLimiter = rateLimit({
    windowMs: 6 * 1000, // 6 seconds
    max: async (req: Request, _) => {
        // If user is logged in, allow 6 requests per 6 seconds
        if (isLoggedIn(req)) {
            return 6;
        }
        // If user is not logged in, allow 1 request per 6 seconds
        return 1;
    },
    standardHeaders: true,
    legacyHeaders: false
})

router.post('/products', scrapingLimiter, scrapingController.getScrapingResults);

router.post('/access', guestMiddleware, accessController.getAccess);
router.post('/access/refresh', accessController.refreshAccess);
router.post('/access/logout', authMiddleware, accessController.logout);

router.post('/product/history', productController.readHistory);

// Admin routes
router.post('/force-crawl', adminMiddleware, crawlController.forceCrawl);

module.exports = router;