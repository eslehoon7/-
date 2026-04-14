const fs = require('fs');
const https = require('https');

async function download() {
  try {
    const response = await fetch('https://drive.google.com/uc?export=download&id=1LU0jEHCWLbWd9K81_8NyxnzQLffAAYsf');
    const buffer = await response.arrayBuffer();
    
    if (!fs.existsSync('public')) {
      fs.mkdirSync('public');
    }
    
    fs.writeFileSync('public/logo.png', Buffer.from(buffer));
    console.log('Successfully downloaded logo.png');
  } catch (err) {
    console.error('Error downloading:', err);
  }
}

download();
