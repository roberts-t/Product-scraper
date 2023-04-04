import { Schema, model, Types } from 'mongoose';

interface IRefreshToken {
    accessBy?: Types.ObjectId;
    token: string;
}

const RefreshTokenSchema = new Schema<IRefreshToken>({
    token: {
        type: String,
        required: true,
        unique: true,
    },
    accessBy: {
        type: Types.ObjectId,
        required: true,
        ref: 'User',
    }
});

export default model<IRefreshToken>('RefreshToken', RefreshTokenSchema);

