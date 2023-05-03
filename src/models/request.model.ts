import { Schema, model } from 'mongoose';

interface IRequest {
    query: string;
    products: Schema.Types.Mixed;
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
        type: Schema.Types.Mixed,
        required: true,
    }
}, { timestamps: true });

export default model<IRequest>('Request', RequestSchema);