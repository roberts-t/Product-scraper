import Fuse from 'fuse.js';

export const addSiteDataToProducts = (products: any) => {
    const { sitesConfig } = require('../config/sites.config');
    return products.map((product: Product) => {
        if (!product.site) {
            return product;
        }
        const productSite = product.site.toLowerCase().replace(" ", "").replace("!", "");
        const siteConfig = sitesConfig[productSite];
        product.siteName = siteConfig.urlName;
        product.siteUrl = siteConfig.url;
        product.siteLogo = siteConfig.logo;
        return product;
    });
}

export const getDbProductParams = (product: any) => {
    return {
        site: product.site,
        name: product.name,
        price: product.price,
        image: product.image,
        url: product.url,
        currency: product.currency,
        available: product.available,
        description: product.description,
        brand: product.brand,
        country: product.country,
        manufacturer: product.manufacturer,
        amount: product.amount,
        dealDuration: product.dealDuration,
    }
}

export const getDefaultSortedProducts = (products: any, query: string) => {
    // Score products by comparing product name to the query
    // Fuse.js: A score of 0 indicates a perfect match, while a score of 1 indicates a complete mismatch.
    const fuseOptions = {
        keys: ['name'],
        includeScore: true,
        isCaseSensitive: false,
        ignoreFieldNorm: true,
        ignoreLocation: true,
        threshold: 1.0,
    };

    const fuse = new Fuse(products, fuseOptions);
    const results = fuse.search(query);

    const scoreWeight = 1;
    const priceWeight = 0.1;
    const exactMatchWeight = 0.5;

    results.sort((a: any, b: any) => {
        const exactMatchA = a.item.name.toLowerCase().includes(query.toLowerCase());
        const exactMatchB = b.item.name.toLowerCase().includes(query.toLowerCase());

        // Calculate the total score for each product
        // Higher score is better which means the product is a better match for the query and cheaper
        const scoreA = ((1 - a.score) * scoreWeight) + ((1 / a.item.price) * priceWeight) + (exactMatchA ? exactMatchWeight : 0);
        const scoreB = ((1 - b.score) * scoreWeight) + ((1 / b.item.price) * priceWeight) + (exactMatchB ? exactMatchWeight : 0);

        // Compare the total scores
        if (scoreB > scoreA) {
            return 1;
        } else if (scoreB < scoreA) {
            return -1;
        } else {
            return 0;
        }
    });

    return results.map((result: any) => result.item);
}