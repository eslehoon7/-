const https = require('https');
const fs = require('fs');

const fileId = '1zZwAUL76C3kZTUIO8LevVj8mtmWGBpas';
const url = `https://lh3.googleusercontent.com/d/${fileId}`;

https.get(url, (res) => {
  if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
    // Handle redirect
    https.get(res.headers.location, (redirectRes) => {
      const fileStream = fs.createWriteStream('public/logo.png');
      redirectRes.pipe(fileStream);
      fileStream.on('finish', () => {
        console.log('Logo downloaded successfully via redirect.');
      });
    });
  } else {
    const fileStream = fs.createWriteStream('public/logo.png');
    res.pipe(fileStream);
    fileStream.on('finish', () => {
      console.log('Logo downloaded successfully.');
    });
  }
}).on('error', (err) => {
  console.error('Error downloading logo:', err.message);
});
