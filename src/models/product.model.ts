import { Schema, model, Types } from 'mongoose';

interface IProduct extends Product {
    site: string;
    sitemap?: Types.ObjectId;
}

export const ProductSchema = new Schema<IProduct>({
    site: {
        type: String,
        required: true,
        index: true,
    },
    name: {
        type: String,
        required: true,
        index: true,
    },
    price: {
        type: String,
        required: false,
    },
    image: {
        type: String,
        required: false,
    },
    url: {
        type: String,
        required: true,
        index: true,
    },
    currency: {
        type: String,
        required: false,
    },
    available: {
        type: Boolean,
        required: true,
    },
    description: {
        type: String,
        required: false,
    },
    brand: {
        type: String,
        required: false,
    },
    country: {
        type: String,
        required: false,
    },
    manufacturer: {
        type: String,
        required: false,
    },
    amount: {
        type: String,
        required: false,
    },
    dealDuration: {
        type: String,
        required: false,
    },
    sitemap: {
        type: Types.ObjectId,
        ref: 'StoreSitemap',
        required: false,
    }
}, { timestamps: true });

export default model<IProduct>('Product', ProductSchema);