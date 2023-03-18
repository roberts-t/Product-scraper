const cheerio = require('cheerio');

const processData = async (data: string, config: any) => {
    const $ = cheerio.load(data);
    const productResults = <any>[];
    const products = $(config.selectors.productElemSelector);
    products.each((i: number, elem: any) => {
        const productData = $(elem).data(config.selectors.dataAttr);
        const productImage = $(elem).find(config.selectors.image).attr('src');
        const productHref = $(elem).find(config.selectors.url).attr('href');
        const productUrl = new URL(productHref, config.url).toString();
        productResults.push({
            name: productData.name,
            price: productData.price,
            image: productImage,
            url: productUrl,
            currency: productData.currency,
            availability: true
        });
    });
    return productResults;
}

module.exports = {
    processData
}