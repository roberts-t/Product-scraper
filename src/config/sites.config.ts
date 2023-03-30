const rimiService = require('../services/rimi.service');
const barboraService = require('../services/barbora.service');
const nukoService = require('../services/nuko.service');
const topService = require('../services/top.service');
const latsService = require('../services/lats.service');

const availableSites = ['rimi', 'barbora', 'NuKo', 'top', 'lats'];

const sitesConfig = {
    rimi: {
        name: 'Rimi',
        logo: '/images/stores/Rimi-logo.png',
        url: 'https://www.rimi.lv/',
        getUrl: (query: string) => `https://www.rimi.lv/e-veikals/lv/meklesana?page=1&pageSize=10&query=${query}`,
        selectors: {
            productElemSelector: '.product-grid__item div.card',
            dataAttr: 'gtm-eec-product',
            image: '.card__image-wrapper img',
            url: 'a.card__url',
            priceEur: '.price-tag span',
            priceCents: '.price-tag div sup',
            loyaltyPrice: '.card__image-wrapper .price-badge',
            loyaltyPriceEur: '.price-badge__price > span',
            loyaltyPriceCents: '.price-badge__price div > span',
        },
        productSitemap: {
            selector: 'loc',
            urls: [
                'https://www.rimi.lv/e-veikals/sitemaps/products/siteMap_rimiLvSite_Product_lv_1.xml',
                'https://www.rimi.lv/e-veikals/sitemaps/products/siteMap_rimiLvSite_Product_lv_2.xml',
                'https://www.rimi.lv/e-veikals/sitemaps/products/siteMap_rimiLvSite_Product_lv_3.xml',
                'https://www.rimi.lv/e-veikals/sitemaps/products/siteMap_rimiLvSite_Product_lv_4.xml',
                'https://www.rimi.lv/e-veikals/sitemaps/products/siteMap_rimiLvSite_Product_lv_5.xml',
            ]
        },
        service: rimiService
    },
    barbora: {
        name: 'Barbora',
        logo: '/images/stores/Barbora-logo.png',
        url: 'https://www.barbora.lv/',
        getUrl: (query: string) => `https://www.barbora.lv/meklet?q=${query}`,
        selectors: {
            productElemSelector: 'div.b-product--wrap',
            url: '.b-product-wrap-img a.b-product--imagelink',

        },
        productSitemap: {
            selector: 'loc:contains("/produkti/")',
            urls: [
                'https://www.barbora.lv/sitemap.xml'
            ],
        },
        service: barboraService
    },
    NuKo: {
        name: 'NuKo',
        logo: '/images/stores/NuKo-logo.png',
        url: 'https://www.nuko.lv/lv/',
        getUrl: (query: string) => `https://nuko.lv/lv/catalogsearch/result/index/?product_list_limit=12&q=${query}`,
        selectors: {
            productElemSelector: 'div.product-item-info',
            url: 'a.product-item-photo',
            image: 'img.product-image-photo',
            name: 'strong.name a.product-item-link',
            price: 'span[id^="product-price-"]',
            priceData: 'price-amount',
            available: 'span.available-qty',
            availableData: 'qty'
        },
        productSitemap: {
            selector: 'url:has(PageMap) > loc',
            urls: [
                'https://nuko.lv/pub/media/sitemap_lv-1-1.xml',
                'https://nuko.lv/pub/media/sitemap_lv-1-2.xml',
            ]
        },
        service: nukoService
    },
    top: {
        name: 'Top',
        logo: '/images/stores/Top!-logo.png',
        url: 'https://etop.lv/',
        getUrl: (query: string) => `https://etop.lv/index.php?route=product/search&search=${query}&limit=10`,
        selectors: {
            productElemSelector: 'div.product-thumb',
            url: 'div.product-name a',
            image: 'div.image img[itemprop="image"]',
            name: 'div.product-name a',
            priceEur: 'div.price-block span[class*="_no_format_"]',
            priceCents: 'div.price-block div.cents',
        },
        service: topService
    },
    lats: {
        name: 'Lats',
        logo: '/images/stores/LaTs-logo.png',
        url: 'https://www.e-latts.lv/',
        getUrl: (query: string) => `https://www.e-latts.lv/${query}.gs?o=sa`,
        selectors: {
            productElemSelector: 'div.-oProduct',
            url: 'a.-oTitle',
            image: 'div.-oThumb img',
            name: 'a.-oTitle',
            price: 'div.-oPrice',
            priceAttr: '-price',
        },
        service: latsService
    }
}

module.exports = {
    availableSites,
    sitesConfig
};