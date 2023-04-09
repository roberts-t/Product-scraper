import { model, Schema } from 'mongoose';

export interface IStoreSitemap {
    site: string;
    scrapingDone?: boolean;
    totalProducts?: number;
    notScrapedProductsLeft?: number;
    expireAt?: Date;
    scrapingFinishedAt?: Date;
}

const StoreSitemapSchema = new Schema<IStoreSitemap>({
    site: {
        type: String,
        required: true,
        index: true,
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
    totalProducts: {
        type: Number,
        required: true,
    },
    notScrapedProductsLeft: {
        type: Number,
        required: true,
    },
    expireAt: {
        type: Date,
        expires: '8d',
        default: new Date(),
    }
}, { timestamps: true });

export default model<IStoreSitemap>('StoreSitemap', StoreSitemapSchema);
