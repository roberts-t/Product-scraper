import cheerio from 'cheerio';

const processSearchData = async (data: string, config: any, site: string): Promise<Product[]> => {
    const $ = cheerio.load(data);
    const productResults = [] as Product[];
    const products = $(config.selectors.productElemSelector);
    products.each((i: number, elem: any) => {
        const product: Product = {
            site: site,
            currency: 'EUR',
            available: true,
        }

        product.name = $(elem).find(config.selectors.name).first().text().trim();
        const priceSale = $(elem).find(config.selectors.priceSale).first();
        if (!priceSale.length) {
            product.price = $(elem).find(config.selectors.price).first().text();
        } else {
            product.price = priceSale.text();
        }
        product.price = product.price.trim().replace(',', '.').replace('€', '')
        product.image = $(elem).find(config.selectors.image).attr('src');
        product.url = $(elem).find(config.selectors.url).attr('href');
        product.description = $(elem).find(config.selectors.description).text().trim();

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
    }

    const product = $(config.selectorsSingle.productElem);
    productObj.name = $(product).find(config.selectorsSingle.name).text().trim();
    productObj.price = $(product).find(config.selectorsSingle.price).text()?.trim()?.replace(',', '.')?.replace('€', '');
    productObj.image = $(product).find(config.selectorsSingle.image).attr('src');
    productObj.manufacturer = $(product).find(config.selectorsSingle.manufacturer).text().trim();
    productObj.amount = $(product).find(config.selectorsSingle.amount).text().trim();

    const notAvailableElem = $(product).find(config.selectorsSingle.available);
    productObj.available = notAvailableElem.length == 0;
    const dealDurationElem = $(product).find(config.selectorsSingle.dealDuration);
    if (dealDurationElem.length > 0) {
        productObj.dealDuration = dealDurationElem.text().trim();
    }


    return productObj;
}

const processSitemapData = async (data: string, selector: string): Promise<string[]> => {
    const $ = cheerio.load(data, { xmlMode: true });
    return $(selector)
        .map((i, url) => $(url).text())
        .get();
}

module.exports = {
    processSearchData,
    processProductData,
    processSitemapData,
}