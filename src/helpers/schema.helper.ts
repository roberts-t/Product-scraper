import Cheerio = cheerio.Cheerio;

const scrapeMicrodata = (product: Cheerio): ProductMicrodata => {
    const price = product.find('[itemprop="price"]').attr('content');
    const name = product.find('[itemprop="name"]').text();
    const image = product.find('[itemprop="image"]').attr('src');
    const currency = product.find('[itemprop="priceCurrency"]').attr('content');
    const available = product.find('[itemprop="availability"]').attr('href') === 'http://schema.org/InStock';

    return {
        name,
        price,
        image,
        currency,
        available
    }
}

module.exports = {
    scrapeMicrodata
}