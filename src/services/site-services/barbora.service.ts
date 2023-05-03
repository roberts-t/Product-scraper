import cheerio from "cheerio";
const schemaHelper = require('../../helpers/schema.helper');

const processSearchData = async (data: string, config: any, site: string): Promise<Product[]> => {
    const $ = cheerio.load(data);
    const productResults = [] as Product[];
    const products = $(config.selectors.productElemSelector);
    products.each((i: number, elem: any) => {
        const productData = schemaHelper.scrapeMicrodata($(elem));
        const productHref = $(elem).find(config.selectors.url).attr('href');
        let productUrl: string = '';
        if (productHref) {
            productUrl = new URL(productHref, config.url).toString();
        }
        productResults.push({
            site: site,
            name: productData.name,
            price: productData.price,
            image: productData.image,
            url: productUrl,
            currency: productData.currency,
            available: productData.available
        });
    });
    return productResults;
}

const processProductData = async (data: string, config: any, site: string, url: string): Promise<Product> => {
    const $ = cheerio.load(data);
    const schemaHelper = require('../../helpers/schema.helper');
    const productObj: Product = {
        site: site,
        url: url,
    }
    const product = $(config.selectorsSingle.productElem);
    const productMicrodata = schemaHelper.scrapeMicrodata(product);

    productObj.name = productMicrodata.name;
    productObj.image = productMicrodata.image;
    productObj.available = productMicrodata.available;
    productObj.currency = productMicrodata.currency;
    productObj.description = productMicrodata.description || undefined;

    if (productObj.available || productMicrodata.price.toString() != '0') {
        productObj.price = productMicrodata.price;
    }

    productObj.brand = $(product).find(config.selectorsSingle.brand).text().trim() || undefined;
    productObj.manufacturer = $(product).find(config.selectorsSingle.manufacturer).text().trim() || undefined;
    productObj.dealDuration = $(product).find(config.selectorsSingle.dealDuration).text().trim() || undefined;
    productObj.country = $(product).find(config.selectorsSingle.country).text().trim() || undefined;

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