import { Schema, Types } from 'mongoose';

interface IProductLink {
    url: string;
    scrapedAt?: Date;
    scrapingFailed?: boolean;
    scrapingTries?: number;
    product?: Types.ObjectId;
}

export default new Schema<IProductLink>({
    url: {
        type: String,
        required: true,
        index: true,
    },
    scrapedAt: {
        type: Date,
        required: false,
    },
    scrapingFailed: {
        type: Boolean,
        required: true,
        default: false,
    },
    scrapingTries: {
        type: Number,
        required: true,
        default: 0,
    },
    product: {
        type: Types.ObjectId,
        required: false,
        ref: 'Product',
    }
}, { timestamps: true });