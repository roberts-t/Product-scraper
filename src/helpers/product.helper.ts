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
        threshold: 1,
    };

    const fuse = new Fuse(products, fuseOptions);
    const results = fuse.search(query);

    const scoreWeight = 0.9;
    const priceWeight = 1;

    results.sort((a: any, b: any) => {
        // Calculate the total score for each product
        // Higher score is better which means the product is a better match for the query and cheaper
        const scoreA = ((1 - a.score) * scoreWeight) + ((1 / a.item.price) * priceWeight);
        const scoreB = ((1 - b.score) * scoreWeight) + ((1 / b.item.price) * priceWeight);

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