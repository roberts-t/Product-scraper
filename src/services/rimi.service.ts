import cheerio from 'cheerio';

const processSearchData = async (data: string, config: any, site: string): Promise<Product[]> => {
    const $ = cheerio.load(data);
    const productResults = [] as Product[];
    const products = $(config.selectors.productElemSelector);
    products.each((i: number, elem: any) => {
        const productData = $(elem).data(config.selectors.dataAttr);
        const productImage = $(elem).find(config.selectors.image).attr('src');
        const productHref = $(elem).find(config.selectors.url).attr('href');
        const priceEur = $(elem).find(config.selectors.priceEur).first().text().trim();
        const priceCents = $(elem).find(config.selectors.priceCents).first().text().trim();
        const loyaltyPriceElem = $(elem).find(config.selectors.loyaltyPrice).first();

        let loyaltyPrice = '';
        if (loyaltyPriceElem.length) {
            const loyaltyPriceEur = $(loyaltyPriceElem).find(config.selectors.loyaltyPriceEur).first().text().trim();
            const loyaltyPriceCents = $(loyaltyPriceElem).find(config.selectors.loyaltyPriceCents).first().text().trim();
            loyaltyPrice = `${loyaltyPriceEur}.${loyaltyPriceCents}`;
        }
        const productPrice = `${priceEur}.${priceCents}`;
        let productUrl: string = '';
        if (productHref) {
            productUrl = new URL(productHref, config.url).toString();
        }
        productResults.push({
            site: site,
            name: productData.name,
            price: loyaltyPriceElem.length ? loyaltyPrice : productPrice,
            image: productImage,
            url: productUrl,
            currency: productData.currency,
            available: true
        });
    });
    return productResults;
}

const processSitemapData = async (data: string, selector: string): Promise<string[]> => {
    const $ = cheerio.load(data, { xmlMode: true });
    return $(selector).map((i, url) => $(url).text()).get();
}

module.exports = {
    processSearchData,
    processSitemapData
}