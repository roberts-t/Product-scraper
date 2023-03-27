import https from "https";
import crypto from "crypto";

const axios = require('axios');

const httpsAgent = new https.Agent({
    secureOptions: crypto.constants.SSL_OP_LEGACY_SERVER_CONNECT,
});

const ScrapingClient = axios.create({
    baseURL: '',
    httpsAgent,
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.169 Safari/537.36',
        'Accept': '*/*',
        'Accept-Encoding': '*',
    }
});

module.exports = ScrapingClient;