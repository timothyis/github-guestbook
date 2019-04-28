const db = require("../../lib/db");
const { json } = require("micro");

module.exports = async (req, res) => {
  const { comment, id, name, picture } = await json(req);
  await db.query(
    `INSERT INTO guestbook VALUES (${id},'${name}','${comment}','${picture}')`
  );
  res.end();
};
