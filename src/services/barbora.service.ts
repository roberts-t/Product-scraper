import cheerio from "cheerio";

const processSearchData = async (data: string, config: any, site: string): Promise<Product[]> => {
    const schemaHelper = require('../helpers/schema.helper');
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

const processSitemapData = async (data: string, selector: string): Promise<string[]> => {
    const $ = cheerio.load(data, { xmlMode: true });
    return $(selector)
        .map((i, url) => $(url).text())
        .get();
}

module.exports = {
    processSearchData,
    processSitemapData
}