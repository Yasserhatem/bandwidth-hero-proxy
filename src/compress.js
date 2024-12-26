const Jimp = require('jimp');
const redirect = require('./redirect');

function compress(req, res, input) {
  const format = 'jpeg';

  Jimp.read(input)
    .then(image => {
      if (req.params.grayscale) {
        image = image.grayscale();
      }

      image
        .quality(10)
        .getBuffer(Jimp.MIME_JPEG, (err, output) => {
          if (err || res.headersSent) return redirect(req, res);

          res.setHeader('content-type', 'image/jpeg');
          res.setHeader('content-length', output.length);
          res.setHeader('x-original-size', req.params.originSize);
          res.setHeader('x-bytes-saved', req.params.originSize - output.length);
          res.status(200);
          res.write(output);
          res.end();
        });
    })
    .catch(err => {
      return redirect(req, res);
    });
}

module.exports = compress;
