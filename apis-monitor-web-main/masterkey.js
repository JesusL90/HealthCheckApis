import crypto from 'crypto';
const algorithm = 'aes-256-cbc';
const iv = Buffer.alloc(16, 0);

const masterKey ='MASTER_KEY';
const apiKey = 'apiKey';

const cipher = crypto.createCipheriv(algorithm, Buffer.from(masterKey, 'hex'), iv);
let encrypted = cipher.update(apiKey, 'utf8', 'base64');
encrypted += cipher.final('base64');

console.log('API_KEY_ENC=' + encrypted);
