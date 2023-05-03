
export const addSiteDataToProducts = (products: any, siteConfig: any) => {
    return products.map((product: Product) => {
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