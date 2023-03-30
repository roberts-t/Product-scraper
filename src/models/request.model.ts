import { Schema, model } from 'mongoose';
import { ProductSchema } from './product.model';

interface IRequest {
    query: string;
    products: [typeof ProductSchema];
    sites: [string];
}

const RequestSchema = new Schema<IRequest>({
    query: {
        type: String,
        required: true,
        index: true,
    },
    sites: {
        type: [String],
        required: true,
    },
    products: {
        type: [ProductSchema],
        required: true,
    }
}, { timestamps: true });

export default model<IRequest>('Request', RequestSchema);