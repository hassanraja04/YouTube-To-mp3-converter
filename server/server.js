const { S3Client, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const express = require('express');
const ytdl = require('ytdl-core');
const youtubedl = require('yt-dlp-exec');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

require('dotenv').config();

const app = express();
app.use(express.json());

app.use(cors({
  origin: 'https://yt3-converter.vercel.app'
}));

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

const BUCKET_NAME = 'my-youtube-mp3-converter';


const cleanYouTubeLink = (link) => link.split('?')[0];


const uploadToS3 = async (filePath, fileName) => {
  const fileContent = fs.readFileSync(filePath);
  const params = {
    Bucket: BUCKET_NAME,
    Key: fileName,
    Body: fileContent,
    ContentType: 'audio/mpeg',
  };

  const command = new PutObjectCommand(params);
  try {
    const data = await s3Client.send(command);
    console.log('File uploaded successfully:', data);
    return `https://${BUCKET_NAME}.s3.amazonaws.com/${fileName}`;
  } catch (err) {
    console.error('Error uploading to S3:', err);
    throw err;
  }
};


const deleteFromS3 = async (fileName) => {
  const params = {
    Bucket: BUCKET_NAME,
    Key: fileName,
  };

  const command = new DeleteObjectCommand(params);
  try {
    await s3Client.send(command);
    console.log('File deleted successfully');
  } catch (err) {
    console.error('Error deleting from S3:', err);
    throw err;
  }
};


app.post('/convert', async (req, res) => {
  const { link } = req.body;
  const cleanedLink = cleanYouTubeLink(link);

  if (!ytdl.validateURL(cleanedLink)) {
    return res.status(400).send('Invalid YouTube link');
  }

  try {
    const info = await ytdl.getInfo(cleanedLink);
    const title = info.videoDetails.title.replace(/[^a-zA-Z0-9 ]/g, ''); // Clean the title
    const tempFilePath = path.resolve(__dirname, `audio-${Date.now()}.mp3`);

    
    await youtubedl(cleanedLink, {
      output: tempFilePath,
      extractAudio: true,
      audioFormat: 'mp3',
      audioQuality: '128k',
      noPlaylist: true,
    });

    const fileName = `${title}.mp3`;
    const fileUrl = await uploadToS3(tempFilePath, fileName);

    fs.unlinkSync(tempFilePath);

    res.json({ path: fileUrl, title });
  } catch (error) {
    console.error('Error during conversion or upload:', error);
    res.status(500).send('Error processing the video');
  }
});

app.get('/download', (req, res) => {
  const { path, filename } = req.query;
  if (!path) {
    return res.status(404).send('File not found');
  }
  res.redirect(path); 
});

app.post('/clear', async (req, res) => {
  const { title } = req.body; 
  if (!title) {
    return res.status(400).send('No title provided');
  }
  const fileName = `${title}.mp3`;
  try {
    await deleteFromS3(fileName);
    res.send('File cleared successfully');
  } catch (error) {
    console.error('Error clearing the file:', error);
    res.status(500).send('Error clearing the file');
  }
});


const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

