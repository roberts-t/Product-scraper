import { Request, Response } from 'express';
import ProductModel from '../models/product.model';

const readHistory = async (req: Request, res: Response) => {
    const productUrl = req.body.productUrl;

    if (!productUrl) {
        return res.status(400).json({ errorMsg: 'INVALID_REQUEST' });
    }

    const history = await ProductModel.find({ url: productUrl, available: true }).select(["price", "createdAt"]).lean();
    return res.status(200).json(history);
}

module.exports = {
    readHistory
}