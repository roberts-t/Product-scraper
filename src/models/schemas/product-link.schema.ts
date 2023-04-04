import { Schema, Types } from 'mongoose';

export interface IProductLink {
    _id?: Types.ObjectId;
    url?: string;
    scrapedAt?: Date;
    scrapingFailed?: boolean;
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
    product: {
        type: Types.ObjectId,
        ref: 'Product',
        required: false,
    }
}, { timestamps: true });