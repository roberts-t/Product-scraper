import { Schema } from 'mongoose';
import ProductLinkSchema from './product-link.schema';

interface ISitemap {
    url: string;
    productLinks: [typeof ProductLinkSchema];
    scrapingDone: boolean;
}

export default new Schema<ISitemap>({
    url: {
        type: String,
        required: true,
    },
    productLinks: {
        type: [ProductLinkSchema],
        required: true,
    },
    scrapingDone: {
        type: Boolean,
        required: false,
        default: false,
    }
});