import cheerio from "cheerio";

const processSearchData = async (data: string, config: any): Promise<Product[]> => {
    const $ = cheerio.load(data);
    const productResults = [] as Product[];
    const products = $(config.selectors.productElemSelector);
    products.each((i: number, elem: any) => {
        const productImage = $(elem).find(config.selectors.image).attr('src');
        const productName = $(elem).find(config.selectors.name).text().trim();
        const productUrl = $(elem).find(config.selectors.url).attr('href');
        const productPriceEur = $(elem).find(config.selectors.priceEur).first().text().trim();
        const productPriceCents = $(elem).find(config.selectors.priceCents).text().trim();
        productResults.push({
            name: productName,
            price: `${productPriceEur}.${productPriceCents}`,
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