const fs = require('fs');
const buffer = fs.readFileSync('public/logo.png');
console.log(buffer.toString('utf8', 0, 100));
