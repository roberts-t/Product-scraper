import cheerio from 'cheerio';

const processProductData = async (data: string, config: any, site: string, url: string): Promise<Product> => {
    const $ = cheerio.load(data);
    const productObj: Product = {
        site: site,
        url: url,
        currency: "EUR",
        available: true,
    }

    const product = $(config.selectorsSingle.productElem);
    productObj.image = $(product).find(config.selectorsSingle.image).data(config.selectorsSingle.imageData);
    productObj.name = $(product).find(config.selectorsSingle.name).text().trim();
    productObj.brand = $(product).find(config.selectorsSingle.brand).text().trim();
    productObj.price = $(product).find(config.selectorsSingle.price).text().trim()?.replace(",", ".");
    productObj.amount = $(product).find(config.selectorsSingle.amount).text().trim();
    productObj.dealDuration = $(product).find(config.selectorsSingle.dealDuration).text().trim();
    productObj.description = $(product).find(config.selectorsSingle.description).text().trim().replace("•", " ");

    return productObj;
}

const processSitemapData = async (data: string, selector: string): Promise<string[]> => {
    const $ = cheerio.load(data, { xmlMode: true });
    return $(selector)
        .map((i, url) => $(url).text())
        .get();
}

module.exports = {
    processProductData,
    processSitemapData
}