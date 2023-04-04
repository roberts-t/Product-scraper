import { Schema, model } from 'mongoose';

interface IAccessToken {
    token: string;
}

const AccessTokenSchema = new Schema<IAccessToken>({
    token: {
        type: String,
        required: true,
        unique: true,
    }
});

export default model<IAccessToken>('AccessToken', AccessTokenSchema);
