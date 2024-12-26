const Jimp = require('jimp');
const redirect = require('./redirect');

async function compress(req, res, input) {
  const format = req.params.webp ? 'webp' : 'jpeg';
  const quality = req.params.quality || 80;

  try {
    const image = await Jimp.read(input);

    if (req.params.grayscale) {
      image.grayscale();
    }

    if (format === 'jpeg') {
      image.quality(quality);
    }

    const output = await image.getBufferAsync(format === 'webp' ? Jimp.MIME_WEBP : Jimp.MIME_JPEG);

    res.setHeader('content-type', `image/${format}`);
    res.setHeader('content-length', output.length);
    res.setHeader('x-original-size', req.params.originSize);
    res.setHeader('x-bytes-saved', req.params.originSize - output.length);
    res.status(200);
    res.write(output);
    res.end();
  } catch (err) {
    redirect(req, res);
  }
}

module.exports = compress;
