const fs = require('fs');
const buffer = fs.readFileSync('public/logo.png');
console.log(buffer.slice(0, 10));
