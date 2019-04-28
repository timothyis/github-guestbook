const mysql = require('serverless-mysql');

const db = mysql({
  config: {
    host: process.env.GG_MYSQL_HOST,
    database: process.env.GG_MYSQL_DATABASE,
    user: process.env.GG_MYSQL_USER,
    password: process.env.GG_MYSQL_PASSWORD
  }
});

exports.query = async query => {
  try {
    const results = await db.query(query);
    await db.end();
    return results;
  } catch (error) {
    return { error };
  }
};
