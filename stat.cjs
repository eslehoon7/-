const fs = require('fs');
console.log(fs.statSync('public/logo.png').size);
