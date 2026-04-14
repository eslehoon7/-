const fs = require('fs');
try {
  const buffer = fs.readFileSync('public/logo.png');
  // Check PNG magic number
  if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) {
    console.log('Valid PNG header');
  } else {
    console.log('Invalid PNG header');
  }
} catch (e) {
  console.error(e);
}
