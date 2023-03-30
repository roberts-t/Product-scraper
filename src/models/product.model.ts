import { Schema, model } from 'mongoose';

interface IProduct extends Product {
    site: string;
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
}, { timestamps: true });

export default model<IProduct>('Product', ProductSchema);