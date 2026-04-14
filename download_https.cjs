const https = require('https');
const fs = require('fs');

const file = fs.createWriteStream("public/logo.png");
https.get("https://drive.google.com/uc?export=download&id=1zZwAUL76C3kZTUIO8LevVj8mtmWGBpas", function(response) {
  if (response.statusCode === 302 || response.statusCode === 303) {
    https.get(response.headers.location, function(redirectResponse) {
      redirectResponse.pipe(file);
      file.on('finish', function() {
        file.close();
        console.log('Download complete');
      });
    });
  } else {
    response.pipe(file);
    file.on('finish', function() {
      file.close();
      console.log('Download complete');
    });
  }
});
