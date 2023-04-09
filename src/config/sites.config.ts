const rimiService = require('../services/site-services/rimi.service');
const barboraService = require('../services/site-services/barbora.service');
const nukoService = require('../services/site-services/nuko.service');
const topService = require('../services/site-services/top.service');
const latsService = require('../services/site-services/lats.service');
const lidlService = require('../services/site-services/lidl.service');
const pienaveikalsService = require('../services/site-services/pienaveikals.service');

const availableSites = ['rimi', 'barbora', 'nuko', 'top', 'lats', 'pienaveikals'];
const crawlSites = ['rimi', 'nuko', 'lidl', 'pienaveikals'];

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
            available: '.card__similar-btn',
        },
        selectorsSingle: {
            productElem: '.cart-layout__main',
            name: 'h3.name',
            image: '.product__main-image img',
            priceEur: '.price-wrapper span',
            priceCents: '.price-wrapper div sup',
            loyaltyPrice: '.product__main-image .price-badge',
            loyaltyPriceEur: '.price-badge__price > span',
            loyaltyPriceCents: '.price-badge__price div > span',
            available: 'button.card__similar-btn',
            // country: '.product-details li.item span:contains("Izcelsmes valsts") + p',
            // brand: '.product-details li.item span:contains("Zīmols") + p',
            // amount: '.product-details li.item span:contains("Daudzums") + p',
            // dealDuration: '.price-wrapper p.notice',
            manufacturer: '.other-from-brand .link-button',
        },
        productSitemap: {
            selector: 'loc',
            schedule: '1 0 * * 2',
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
        // productSitemap: {
        //     selector: 'loc:contains("/produkti/")',
        //     urls: [
        //         'https://www.barbora.lv/sitemap.xml'
        //     ],
        // },
        service: barboraService
    },
    nuko: {
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
        selectorsSingle: {
            productElem: '.column.main',
            image: 'img.gallery-placeholder__image',
            available: 'span.available-qty',
            availableData: 'qty',
            description: '.product.description .value',
            manufacturer: '.additional-attributes th.label:contains("Ražotājs") + td.data',
            country: '.additional-attributes th.label:contains("Izcelsmes valsts") + td.data',
            brand: '.additional-attributes th.label:contains("Zīmols") + td.data',
            packageSize: '.additional-attributes th.label:contains("Iepakojuma lielums") + td.data',
            packageUnit: '.additional-attributes th.label:contains("Mērvienība") + td.data',
        },
        productSitemap: {
            selector: 'url:has(PageMap) > loc',
            schedule: '1 0 * * 1,4',
            urls: [
                'https://nuko.lv/pub/media/sitemap_lv-1-1.xml',
                'https://nuko.lv/pub/media/sitemap_lv-1-2.xml',
            ]
        },
        service: nukoService
    },
    top: {
        name: 'Top!',
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
        name: 'LaTs',
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
    },
    lidl: {
        name: 'Lidl',
        logo: '/images/stores/Lidl-logo.png',
        url: 'https://www.lidl.lv/',
        selectorsSingle: {
            productElem: 'div.page__section',
            name: 'h1[itemprop="name"]',
            brand: 'p[itemprop="description"]',
            price: '.pricebox__price',
            amount: '.pricebox__basic-quantity',
            dealDuration: '.ribbon .ribbon__text',
            description: '.attributebox__long-description p',
            image: '.picture source',
            imageData: 'srcset',
        },
        service: lidlService,
        productSitemap: {
            schedule: '1 0 * * 1,4',
            selector: 'loc:contains("/p/")',
            urls: [
                'https://www.lidl.lv/lv/sitemap-lv-LV.xml'
            ]
        }
    },
    pienaveikals: {
        name: 'Piena veikals',
        url: 'https://pienaveikals.lv/',
        getUrl: (query: string) => `https://pienaveikals.lv/index.php?route=product/search&search=${query}`,
        selectors: {
            productElemSelector: '.product-layout div.product-thumb',
            image: 'div.image img',
            name: 'div.caption h4 a',
            priceSale: 'div.caption p.price > span',
            price: 'div.caption p.price',
            url: 'div.caption h4 a',
            description: 'div.caption p.desc',
        },
        selectorsSingle: {
            productElem: '.productpage',
            name: 'h2.product-title',
            price: 'ul.price h2',
            image: '.image img',
            manufacturer: 'li.manufacturer a',
            available: 'div#product .btn-danger',
            dealDuration: '.model:contains("Akcija spēkā")',
            amount: '.tab-pane dt:contains("Svars") + dd',
        },
        productSitemap: {
            schedule: '1 0 * * 1,5',
            selector: 'loc:contains("product&product_id")',
            urls: [
                'https://pienaveikals.lv/index.php?route=extension/feed/google_sitemap'
            ]
        },
        service: pienaveikalsService
    }
}

module.exports = {
    availableSites,
    sitesConfig,
    crawlSites,
};