import cheerio from 'cheerio';

const processProductData = async (data: string, config: any, site: string, url: string): Promise<Product> => {
    const $ = cheerio.load(data);
    const productObj: Product = {
        site: site,
        url: url,
        currency: "EUR",
    }

    const product = $(config.selectorsSingle.productElem);
    const available = $(product).find(config.selectorsSingle.available);
    productObj.image = $(product).find(config.selectorsSingle.image).data(config.selectorsSingle.imageData);
    productObj.name = $(product).find(config.selectorsSingle.name).text().trim();
    productObj.available = available.length > 0;
    productObj.amount = $(product).find(config.selectorsSingle.amount).text().trim();
    productObj.dealDuration = $(product).find(config.selectorsSingle.dealDuration).text().trim();

    if (productObj.available) {
        productObj.price = $(product).find(config.selectorsSingle.price).text().trim()?.replace("€", "");
    }

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