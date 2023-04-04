import { Router } from 'express';
const scrapingController = require('../controllers/scraping.controller');
const accessController = require('../controllers/access.controller');
const authMiddleware = require('../middlewares/access.middleware');
const guestMiddleware = require('../middlewares/guest.middleware');
const router: Router = Router();

router.post('/products', authMiddleware, scrapingController.getScrapingResults);

router.post('/access', guestMiddleware, accessController.getAccess);
router.post('/access/refresh', authMiddleware, accessController.refreshAccess);
router.post('/access/logout', authMiddleware, accessController.logout);

module.exports = router;