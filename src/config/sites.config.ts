const rimiService = require('../services/rimi.service');
const barboraService = require('../services/barbora.service');
const nukoService = require('../services/nuko.service');
const topService = require('../services/top.service');
const latsService = require('../services/lats.service');

const availableSites = ['rimi', 'barbora', 'NuKo', 'top', 'lats'];

const sitesConfig = {
    rimi: {
        name: 'Rimi',
        url: 'https://www.rimi.lv/',
        getUrl: (query: string) => `https://www.rimi.lv/e-veikals/lv/meklesana?page=1&pageSize=20&query=${query}`,
        selectors: {
            productElemSelector: '.product-grid__item div.card',
            dataAttr: 'gtm-eec-product',
            image: '.card__image-wrapper img',
            url: 'a.card__url'
        },
        service: rimiService
    },
    barbora: {
        name: 'Barbora',
        url: 'https://www.barbora.lv/',
        getUrl: (query: string) => `https://www.barbora.lv/meklet?q=${query}`,
        selectors: {
            productElemSelector: 'div.b-product--wrap',
            url: '.b-product-wrap-img a.b-product--imagelink',

        },
        service: barboraService
    },
    NuKo: {
        name: 'NuKo',
        url: 'https://www.nuko.lv/lv/',
        getUrl: (query: string) => `https://nuko.lv/lv/catalogsearch/result/?q=${query}`,
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
        service: nukoService
    },
    top: {
        name: 'Top',
        url: 'https://etop.lv/',
        getUrl: (query: string) => `https://etop.lv/index.php?route=product/search&sort=p.price&order=ASC&search=${query}`,
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