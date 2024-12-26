const axios = require('axios'); 
const { pick } = require('lodash');
const shouldCompress = require('./shouldCompress');
const redirect = require('./redirect');
const compress = require('./compress');
const bypass = require('./bypass');
const copyHeaders = require('./copyHeaders');

async function proxy(req, res) {
  try {
    const response = await axios.get(req.params.url, {
      headers: {
        ...pick(req.headers, ['cookie', 'dnt', 'referer']),
        'user-agent': 'Bandwidth-Hero Compressor',
        'x-forwarded-for': req.headers['x-forwarded-for'] || req.ip,
        via: '1.1 bandwidth-hero',
      },
      timeout: 10000,
      responseType: 'arraybuffer',
      maxRedirects: 5,
    });

    copyHeaders(response, res);
    res.setHeader('content-encoding', 'identity');

    req.params.originType = response.headers['content-type'] || '';
    req.params.originSize = Buffer.byteLength(response.data);

    if (shouldCompress(req)) {
      compress(req, res, response.data);
    } else {
      bypass(req, res, response.data);
    }
  } catch (err) {
    redirect(req, res);
  }
}

module.exports = proxy;
