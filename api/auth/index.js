module.exports = async (req, res) => {
  res.writeHead(302, {
    Location: `https://github.com/login/oauth/authorize?client_id=${
      process.env.GG_ID
    }`
  });
  res.end();
};
