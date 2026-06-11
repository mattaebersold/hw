const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const sharp = require('sharp');

const s3 = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const generateKey = () => {
  const digits = Math.floor(Math.random() * 9000 + 1000);
  const chars = Math.random().toString(36).substring(2, 10);
  return `img${digits}-${chars}.jpg`;
};

const processImage = async (buffer, maxDimension = 2000) => {
  return sharp(buffer)
    .rotate()                         // auto-rotate from EXIF orientation
    .resize(maxDimension, maxDimension, { fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: 85, progressive: true })
    .toBuffer();
};

const uploadToS3 = async (file) => {
  const processed = await processImage(file.buffer);
  const key = generateKey();

  await s3.send(new PutObjectCommand({
    Bucket: process.env.S3_BUCKET,
    Key: key,
    Body: processed,
    ContentType: 'image/jpeg',
  }));

  return `https://${process.env.S3_BUCKET}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${key}`;
};

module.exports = { uploadToS3 };
