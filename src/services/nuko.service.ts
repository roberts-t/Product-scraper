import cheerio from "cheerio";

const processSearchData = async (data: string, config: any, site: string): Promise<Product[]> => {
    const $ = cheerio.load(data);
    const productResults = [] as Product[];
    const products = $(config.selectors.productElemSelector);
    products.each((i: number, elem: any) => {
        const productName = $(elem).find(config.selectors.name).first().text().trim();
        const productPrice = $(elem).find(config.selectors.price).first().data(config.selectors.priceData);
        const productImage = $(elem).find(config.selectors.image).attr('src');
        const productHref = $(elem).find(config.selectors.url).attr('href');
        const available = parseInt($(elem).find(config.selectors.available).data(config.selectors.availableData)) > 0;
        let productUrl: string = '';
        if (productHref) {
            productUrl = new URL(productHref, config.url).toString();
        }
        productResults.push({
            site: site,
            name: productName,
            price: productPrice,
            image: productImage,
            url: productUrl,
            currency: 'EUR',
            available: available
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