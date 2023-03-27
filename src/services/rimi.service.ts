import cheerio from 'cheerio';

const processSearchData = async (data: string, config: any): Promise<Product[]> => {
    const $ = cheerio.load(data);
    const productResults = [] as Product[];
    const products = $(config.selectors.productElemSelector);
    products.each((i: number, elem: any) => {
        const productData = $(elem).data(config.selectors.dataAttr);
        const productImage = $(elem).find(config.selectors.image).attr('src');
        const productHref = $(elem).find(config.selectors.url).attr('href');
        let productUrl: string = '';
        if (productHref) {
            productUrl = new URL(productHref, config.url).toString();
        }
        productResults.push({
            name: productData.name,
            price: productData.price,
            image: productImage,
            url: productUrl,
            currency: productData.currency,
            available: true
        });
    });
    return productResults;
}

const processSitemapData = async (data: string, selector: string): Promise<string[]> => {
    const $ = cheerio.load(data, { xmlMode: true });
    return $(selector).map((i, url) => $(url).text()).get();
}

module.exports = {
    processSearchData,
    processSitemapData
}