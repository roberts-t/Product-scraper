const rimiService = require('../services/rimi.service');

const availableSites = ['rimi'];

const sitesConfig = {
    rimi: {
        name: 'Rimi',
        url: 'https://www.rimi.lv/',
        searchType: 'data',
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
        searchType: 'data',
        getUrl: (query: string) => `https://www.barbora.lv/lv/produkti?query=${query}`,
        selectors: {

        }
    }
}

module.exports = {
    availableSites,
    sitesConfig
};