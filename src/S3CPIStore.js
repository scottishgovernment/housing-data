const s3client = require('@aws-sdk/client-s3');
const url = require('url');

/**
 * Stores CPI data in Amazon S3.
 */
class S3CPIStore {

    constructor(region, target) {
        this.s3Client = new s3client.S3Client({ region: region });
        const s3Path = url.parse(target);
        if (s3Path.protocol !== 's3:') {
            throw new Error(`Invalid protocol for s3 target: ${s3Path.protocol}`);
        }
        if (!s3Path.pathname) {
            throw new Error(`Missing pathname for s3 target: ${target}`);
        }
        this.bucket = s3Path.host;
        this.key = s3Path.pathname.slice(1);
    }

    async latest() {
        const getObjectCommand = new s3client.GetObjectCommand({
            Bucket: this.bucket,
            Key: this.key
        });
        const data = await this.s3Client.send(getObjectCommand);
        const body = await this.readJSON(data.Body);
        return body;
    }

    async store(cpi) {
        const body = JSON.stringify(cpi, null, 2) + '\n';
        const putObjectCommand = new s3client.PutObjectCommand({
            Bucket: this.bucket,
            Key: this.key,
            Body: body
        });
        await this.s3Client.send(putObjectCommand);
    }

    async readJSON(stream) {
        const content = await new Promise((resolve, reject) => {
            const chunks = [];
            stream.on('data', (chunk) => chunks.push(chunk));
            stream.on('error', reject);
            stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
        });
        return JSON.parse(content);
    }

}

module.exports = S3CPIStore;
