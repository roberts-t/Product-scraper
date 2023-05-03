import { Schema, model } from 'mongoose';

interface IAccessToken {
    token: string;
    isAdmin: boolean;
}

const AccessTokenSchema = new Schema<IAccessToken>({
    token: {
        type: String,
        required: true,
        unique: true,
    },
    isAdmin: {
        type: Boolean,
        required: false,
        default: false,
    }
});

export default model<IAccessToken>('AccessToken', AccessTokenSchema);
