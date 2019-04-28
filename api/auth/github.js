const url = require('url');
const request = require('request-promise');

module.exports = async (req, res) => {
  const { query } = url.parse(req.url, true);
  const resp = await request({
    method: 'POST',
    uri: 'https://github.com/login/oauth/access_token',
    body: {
      client_id: process.env.GG_ID,
      client_secret: process.env.GG_SECRET,
      code: query.code
    },
    json: true
  });
  console.log('RESP', resp);
  res.writeHead(301, {
    Location: `/?token=${resp.access_token}`
  });
  res.end(JSON.stringify({ ...resp }));
};
