import { Schema, model } from 'mongoose';
import SitemapSchema from './schemas/sitemap.schema';

interface ISitemapGroup {
    site: string;
    sitemaps: [typeof SitemapSchema];
    scrapingDone: boolean;
}

const SitemapGroupSchema = new Schema<ISitemapGroup>({
    site: {
        type: String,
        required: true,
        index: true,
    },
    sitemaps: {
        type: [SitemapSchema],
        required: true,
    },
    scrapingDone: {
        type: Boolean,
        required: true,
        default: false,
    }
});

export default model<ISitemapGroup>('SitemapGroup', SitemapGroupSchema);