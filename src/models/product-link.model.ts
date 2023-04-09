import { model, Schema, Types } from 'mongoose';

export interface IProductLink {
    _id?: Types.ObjectId;
    url?: string;
    scrapedAt?: Date;
    scrapingFailed?: boolean;
    product?: Types.ObjectId;
    storeSitemap?: Types.ObjectId;
    expireAt?: Date;
}

const ProductLinkSchema = new Schema<IProductLink>({
    url: {
        type: String,
        required: true,
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
    },
    storeSitemap: {
        type: Types.ObjectId,
        ref: 'StoreSitemap',
        required: true,
    },
    expireAt: {
        type: Date,
        expires: '8d',
        default: new Date(),
    }
});

export default model<IProductLink>('ProductLink', ProductLinkSchema);