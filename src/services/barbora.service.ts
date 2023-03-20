import cheerio from "cheerio";

const processSearchData = async (data: string, config: any): Promise<Product[]> => {
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
            name: productData.name,
            price: productData.price,
            image: productData.image,
            url: productUrl,
            currency: productData.currency,
            available: productData.available
        });
    });
    console.log(productResults);
    return productResults;
}

module.exports = {
    processSearchData
}