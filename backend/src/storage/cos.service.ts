import S3 from 'ibm-cos-sdk/clients/s3.js';

// Naming convention confirmed final in docs/storage/Storage_and_Metadata_Finalisation_Addendum.md:
// /<incident_id>/<source_type>/<timestamp>_<image_id>.<ext>
export function buildObjectKey(
    incidentId: string,
    sourceType: string,
    timestamp: string,
    imageId: string,
    ext: string,
): string {
    const safeTimestamp = timestamp.replace(/[:]/g, '-');
    return `/${incidentId}/${sourceType}/${safeTimestamp}_${imageId}.${ext}`;
}

let client: S3 | undefined;

// HMAC credentials per docs/storage/Storage_and_metadata_V2.md section 5
// ("IAM, with HMAC credentials generated for S3-compatible SDK access").
function getClient(): S3 {
    client ??= new S3({
        endpoint: process.env.COS_ENDPOINT,
        accessKeyId: process.env.COS_ACCESS_KEY_ID,
        secretAccessKey: process.env.COS_SECRET_ACCESS_KEY,
    });
    return client;
}

export async function uploadImage(key: string, body: Buffer, contentType: string): Promise<void> {
    const bucket = process.env.COS_BUCKET;
    if (!bucket) {
        throw new Error('COS_BUCKET is not configured');
    }
    await getClient().putObject({ Bucket: bucket, Key: key, Body: body, ContentType: contentType }).promise();
}

export async function deleteImage(key: string): Promise<void> {
    const bucket = process.env.COS_BUCKET;
    if (!bucket) {
        throw new Error('COS_BUCKET is not configured');
    }
    await getClient().deleteObject({ Bucket: bucket, Key: key }).promise();
}

// Time-limited signed read URL for the Map/Incident/Order pages (V2 doc section 5):
// clients read images this way rather than ever holding a COS credential themselves.
export async function getSignedUrl(key: string, expiresInSeconds = 900): Promise<string> {
    const bucket = process.env.COS_BUCKET;
    if (!bucket) {
        throw new Error('COS_BUCKET is not configured');
    }
    return getClient().getSignedUrlPromise('getObject', { Bucket: bucket, Key: key, Expires: expiresInSeconds });
}
