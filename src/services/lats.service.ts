import cheerio from "cheerio";

const processSearchData = async (data: string, config: any): Promise<Product[]> => {
    const $ = cheerio.load(data);
    const productResults = [] as Product[];
    const products = $(config.selectors.productElemSelector);
    products.each((i: number, elem: any) => {
        const productImageHref = $(elem).find(config.selectors.image).attr('src');
        const productName = $(elem).find(config.selectors.name).text().trim();
        const productHref = $(elem).find(config.selectors.url).attr('href');
        const productPrice = $(elem).find(config.selectors.price).attr(config.selectors.priceAttr);
        let productImage: string = '';
        let productUrl: string = '';
        if (productHref) {
            productUrl = new URL(productHref, config.url).toString();
        }
        if (productImageHref) {
            productImage = new URL(productImageHref, config.url).toString();
        }
        productResults.push({
            name: productName,
            price: productPrice,
            image: productImage,
            url: productUrl,
            currency: "EUR",
            available: true
        });
    });
    console.log(productResults);
    return productResults;
}

module.exports = {
    processSearchData
}