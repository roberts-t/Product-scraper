import cheerio from "cheerio";

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
            currency: 'EUR',
            available: true,
        }

        product.name = $(elem).find(config.selectors.name).first().text().trim();
        product.price = $(elem).find(config.selectors.price).first().data(config.selectors.priceData);
        product.image = $(elem).find(config.selectors.image).attr('src');
        product.available = parseInt($(elem).find(config.selectors.available).data(config.selectors.availableData)) > 0;

        const productHref = $(elem).find(config.selectors.url).attr('href');
        if (productHref) {
            product.url = new URL(productHref, config.url).toString();
        }
        productResults.push(product);
    });
    return productResults;
}

const processProductData = async (data: string, config: any, site: string, url: string): Promise<Product> => {
    const $ = cheerio.load(data);
    const schemaHelper = require('../../helpers/schema.helper');
    const productObj: Product = {
        site: site,
        url: url,
        currency: "EUR",
        available: true,
    }
    const product = $(config.selectorsSingle.productElem);
    const productData = schemaHelper.scrapeMicrodata($(product));
    const packageSize = $(product).find(config.selectorsSingle.packageSize).text().trim();
    const packageUnit = $(product).find(config.selectorsSingle.packageUnit).text().trim();

    productObj.name = productData.name;
    productObj.price = productData.price;
    productObj.currency = productData.currency;
    productObj.available = parseInt($(product).find(config.selectorsSingle.available).data(config.selectors.availableData)) > 0;
    productObj.image = $(product).find(config.selectorsSingle.image).attr('src');
    productObj.description = $(product).find(config.selectorsSingle.description).text().trim();
    productObj.brand = $(product).find(config.selectorsSingle.brand).text().trim();
    productObj.country = $(product).find(config.selectorsSingle.country).text().trim();
    productObj.manufacturer = $(product).find(config.selectorsSingle.manufacturer).text().trim();
    productObj.amount = packageSize + packageUnit;

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
    processSitemapData,
    processProductData
}