const db = require("../../lib/db");

module.exports = async (req, res) => {
  const guestbook = await db.query(`
      SELECT *
      FROM guestbook
    `);
  res.end(JSON.stringify({ guestbook }));
};
