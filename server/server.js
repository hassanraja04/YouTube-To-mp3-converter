// const express = require('express');
// const ytdl = require('ytdl-core');
// const youtubedl = require('yt-dlp-exec');
// const path = require('path');
// const fs = require('fs');
// const cors = require('cors');

// const app = express();
// app.use(express.json());

// // Enable CORS for frontend
// // app.use(cors({
// //   origin: 'https://yt3-converter.vercel.app'
// // }));

// app.use(cors({
//   origin: 'http://localhost:3000'
// }));


// app.get("/", (req, res) => {
//   res.json("Hello world")
// })

// // Helper function to clean and simplify YouTube links
// const cleanYouTubeLink = (link) => {
//   return link.split('?')[0]; // Remove query parameters
// };

// // Variable to store the current temporary file path
// let tempFilePath = '';

// app.post('/convert', async (req, res) => {
//   const { link } = req.body;
//   console.log(`Received link: ${link}`);
//   const cleanedLink = cleanYouTubeLink(link);

//   if (!ytdl.validateURL(cleanedLink)) {
//     console.log('Invalid YouTube link');
//     return res.status(400).send('Invalid YouTube link');
//   }

//   // Get video info to extract the title
//   try {
//     const info = await ytdl.getInfo(cleanedLink);
//     const title = info.videoDetails.title.replace(/[^a-zA-Z0-9 ]/g, ""); // Remove special characters from title
//     tempFilePath = path.resolve(__dirname, `audio-${Date.now()}.mp3`);

//     // Use youtube-dl-exec to download and convert the video to mp3
//     await youtubedl(cleanedLink, {
//       output: tempFilePath,
//       extractAudio: true,
//       audioFormat: 'mp3',
//       audioQuality: '128k',
//       noPlaylist: true // Ensure it doesn't try to download playlists
//     });

//     console.log('Conversion finished, sending file to client');
//     if (fs.existsSync(tempFilePath)) {
//       // Send the file path and title back to the frontend
//       res.json({ path: tempFilePath, title });
//     } else {
//       console.log('File not found after conversion');
//       res.status(500).send('Error: file not found after conversion');
//     }
//   } catch (error) {
//     console.error('youtube-dl error:', error);
//     res.status(500).send('Error processing the video');
//   }
// });

// app.get('/download', (req, res) => {
//   const { path, filename } = req.query;

//   if (!path || !fs.existsSync(path)) {
//     return res.status(404).send('File not found');
//   }

//   res.download(path, filename, (err) => {
//     if (err) {
//       console.error('Error sending file:', err);
//     } else {
//       console.log('File sent successfully, deleting local file');
//     }

//     // Remove the file after the download
//     fs.unlink(path, (unlinkErr) => {
//       if (unlinkErr) {
//         console.error('Error deleting file:', unlinkErr);
//       } else {
//         tempFilePath = ''; // Reset the temp file path after deletion
//       }
//     });
//   });
// });

// // Endpoint to clear the temporary file manually if needed
// app.post('/clear', (req, res) => {
//   if (tempFilePath && fs.existsSync(tempFilePath)) {
//     fs.unlink(tempFilePath, (err) => {
//       if (err) {
//         console.error('Error deleting file:', err);
//         return res.status(500).send('Error clearing the file');
//       }
//       tempFilePath = ''; // Reset the temporary file path
//       console.log('Temporary file cleared successfully');
//       res.send('File cleared successfully');
//     });
//   } else {
//     res.send('No file to clear');
//   }
// });

// const PORT = process.env.PORT || 3001;
// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });

const { S3Client, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const express = require('express');
const ytdl = require('ytdl-core');
const youtubedl = require('yt-dlp-exec');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

// Load environment variables
require('dotenv').config();

const app = express();
app.use(express.json());

// Enable CORS for frontend
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

// Helper function to clean YouTube link
const cleanYouTubeLink = (link) => link.split('?')[0];

// Function to upload to S3 using AWS SDK v3
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

// Function to delete from S3 using AWS SDK v3
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

// POST: Convert YouTube to MP3 and upload to S3
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

    // Convert YouTube video to MP3
    await youtubedl(cleanedLink, {
      output: tempFilePath,
      extractAudio: true,
      audioFormat: 'mp3',
      audioQuality: '128k',
      noPlaylist: true,
    });

    // Upload the MP3 file to S3
    const fileName = `${title}.mp3`;
    const fileUrl = await uploadToS3(tempFilePath, fileName);

    // Clean up the local file after upload
    fs.unlinkSync(tempFilePath);

    res.json({ path: fileUrl, title });
  } catch (error) {
    console.error('Error during conversion or upload:', error);
    res.status(500).send('Error processing the video');
  }
});

// GET: Download MP3 from S3
app.get('/download', (req, res) => {
  const { path, filename } = req.query;
  if (!path) {
    return res.status(404).send('File not found');
  }
  res.redirect(path); // Redirect to the S3 URL for direct download
});

// POST: Clear (delete) the MP3 from S3
app.post('/clear', async (req, res) => {
  const { title } = req.body; // The title is passed from the frontend
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

// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

