import ProductLinkSchema, { IProductLink } from './schemas/product-link.schema';
import { model, Schema } from 'mongoose';

interface IStoreSitemap {
    site: string;
    productLinks: IProductLink[];
    scrapingDone?: boolean;
    expireAt?: Date;
    scrapingFinishedAt?: Date;
}

const StoreSitemapSchema = new Schema<IStoreSitemap>({
    site: {
        type: String,
        required: true,
        index: true,
    },
    productLinks: {
        type: [ProductLinkSchema],
        required: true,
        default: [],
    },
    scrapingDone: {
        type: Boolean,
        required: true,
        default: false,
    },
    scrapingFinishedAt: {
        type: Date,
        required: false,
    },
    expireAt: {
        type: Date,
        expires: '8d',
        default: new Date(),
    }
});

export default model<IStoreSitemap>('StoreSitemap', StoreSitemapSchema);
