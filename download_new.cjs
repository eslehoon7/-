const fs = require('fs');

async function download() {
  try {
    const response = await fetch('https://drive.google.com/uc?export=download&id=1zZwAUL76C3kZTUIO8LevVj8mtmWGBpas');
    const buffer = await response.arrayBuffer();
    
    if (!fs.existsSync('public')) {
      fs.mkdirSync('public');
    }
    
    fs.writeFileSync('public/logo.png', Buffer.from(buffer));
    console.log('Successfully downloaded new logo.png');
  } catch (err) {
    console.error('Error downloading:', err);
  }
}

download();
