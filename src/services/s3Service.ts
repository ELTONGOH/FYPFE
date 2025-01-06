import AWS from 'aws-sdk';

// Configure S3 with credentials from environment variables
const s3 = new AWS.S3({
  region: process.env.NEXT_PUBLIC_AWS_BUCKET_REGION,
  accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY,
});

const bucketName = process.env.NEXT_PUBLIC_AWS_BUCKET_NAME;

export async function uploadFileToS3(file: File, objectKey: string): Promise<string> {
  if (!bucketName) {
    throw new Error('Bucket name is not defined');
  }

  const params: AWS.S3.PutObjectRequest = {
    Bucket: bucketName,
    Key: objectKey,
    Body: file,
    ContentType: file.type,
  };

  try {
    const data = await s3.upload(params).promise();
    console.log('File uploaded successfully:', data.Location);
    return data.Location;
  } catch (error) {
    console.error('Error uploading file to S3:', error);
    throw new Error('Failed to upload file to S3');
  }
}

export async function deleteMediaFromS3(objectKey: string): Promise<void> {
  if (!bucketName) {
    throw new Error('Bucket name is not defined');
  }

  const params: AWS.S3.DeleteObjectRequest = {
    Bucket: bucketName,
    Key: objectKey,
  };

  try {
    await s3.deleteObject(params).promise();
    console.log(`Successfully deleted object: ${objectKey} from bucket: ${bucketName}`);
  } catch (error) {
    console.error('Error deleting media from S3:', error);
    throw new Error('Failed to delete media from S3');
  }
}

export function constructMediaURL(objectKey: string): string {
  return `https://${bucketName}.s3.${process.env.NEXT_PUBLIC_AWS_BUCKET_REGION}.amazonaws.com/${objectKey}`;
}

