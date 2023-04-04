import { Schema } from 'mongoose';
import ProductLinkSchema, { IProductLink } from './product-link.schema';

export interface ISitemap {
    url: string;
    productLinks?: IProductLink[];
    scrapingDone?: boolean;
}

export default new Schema<ISitemap>({
    url: {
        type: String,
        required: true,
    },
    productLinks: {
        type: [ProductLinkSchema],
        required: true,
        default: [],
    },
    scrapingDone: {
        type: Boolean,
        required: false,
        default: false,
    }
});

