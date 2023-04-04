import cheerio from 'cheerio';

const processSearchData = async (data: string, config: any, site: string): Promise<Product[]> => {
    const $ = cheerio.load(data);
    const productResults = [] as Product[];
    const products = $(config.selectors.productElemSelector);
    products.each((i: number, elem: any) => {
        const product: Product = {
            site: site,
            name: undefined,
            price:undefined,
            image: undefined,
            url: undefined,
            currency: undefined,
            available: true,
        }

        const productData = $(elem).data(config.selectors.dataAttr);
        const productHref = $(elem).find(config.selectors.url).attr('href');
        const priceEur = $(elem).find(config.selectors.priceEur).first().text().trim();
        const priceCents = $(elem).find(config.selectors.priceCents).first().text().trim();
        const loyaltyPriceElem = $(elem).find(config.selectors.loyaltyPrice).first();

        product.image = $(elem).find(config.selectors.image).attr('src');
        product.available = $(elem).find(config.selectors.available).first().length == 0;
        if (productHref) {
            product.url = new URL(productHref, config.url).toString();
        }
        product.name = productData.name;
        product.currency = productData.currency;

        // Set price if available
        if (product.available) {
            if (loyaltyPriceElem.length) {
                const loyaltyPriceEur = $(loyaltyPriceElem).find(config.selectors.loyaltyPriceEur).first().text().trim();
                const loyaltyPriceCents = $(loyaltyPriceElem).find(config.selectors.loyaltyPriceCents).first().text().trim();
                product.price = `${loyaltyPriceEur}.${loyaltyPriceCents}`;
            } else {
                product.price = `${priceEur}.${priceCents}`;
            }
        }

        productResults.push(product);
    });
    return productResults;
}

const processProductData = async (data: string, config: any, site: string, url: string): Promise<Product> => {
    const $ = cheerio.load(data);
    const productObj: Product = {
        site: site,
        url: url,
        currency: "EUR",
        available: true,
    }
    const product = $(config.selectorsSingle.productElem);

    const priceEur = $(product).find(config.selectorsSingle.priceEur).first().text().trim();
    const priceCents = $(product).find(config.selectorsSingle.priceCents).first().text().trim();
    const loyaltyPriceElem = $(product).find(config.selectorsSingle.loyaltyPrice).first();

    productObj.name = $(product).find(config.selectorsSingle.name).text().trim();
    productObj.image = $(product).find(config.selectorsSingle.image).attr('src');
    productObj.available = $(product).find(config.selectors.available).first().length == 0;
    productObj.manufacturer = $(product).find(config.selectorsSingle.manufacturer).text().trim();

    if (productObj.available) {
        if (loyaltyPriceElem.length) {
            const loyaltyPriceEur = $(loyaltyPriceElem).find(config.selectorsSingle.loyaltyPriceEur).first().text().trim();
            const loyaltyPriceCents = $(loyaltyPriceElem).find(config.selectorsSingle.loyaltyPriceCents).first().text().trim();
            productObj.price = `${loyaltyPriceEur}.${loyaltyPriceCents}`;
        } else {
            productObj.price = `${priceEur}.${priceCents}`;
        }
    }
    return productObj;
}

const processSitemapData = async (data: string, selector: string): Promise<string[]> => {
    const $ = cheerio.load(data, { xmlMode: true });
    return $(selector).map((i, url) => $(url).text()).get();
}

module.exports = {
    processSearchData,
    processSitemapData,
    processProductData
}