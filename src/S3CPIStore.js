const s3client = require('@aws-sdk/client-s3');

/**
 * Stores CPI data in Amazon S3.
 */
class S3CPIStore {

    constructor(region, bucket, key) {
        this.s3Client = new s3client.S3Client({ region: region });
        this.bucket = bucket;
        this.key = key;
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
