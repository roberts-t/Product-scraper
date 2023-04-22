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
        product.image = $(elem).find(config.selectors.image).first().attr('src');
        product.price = $(elem).find(config.selectors.price).first().text().trim().replace('€', '');
        product.url = $(elem).find(config.selectors.url).attr('href');

        productResults.push(product);
    });
    return productResults;
}

module.exports = {
    processSearchData
}

