const url = require('url')
const connect = require("../../lib/db");
const { json } = require('micro');

module.exports = async (req, res) => {
  const { comment, id, user } = await json(req);

  // Connect to MongoDB and get the client
  const client = await connect()

  // Parse database name from MongoDB URI string
  const database = await client.db(url.parse(process.env.MONGODB_URI).pathname.substr(1))

  const signaturesCollection = await database.collection('signatures')

  const existing = await signaturesCollection.findOne({ id })

  if (existing) {
    await signaturesCollection.updateOne({ id }, { $set: {user, comment, updated: new Date() }})
  } else {
    await signaturesCollection.insertOne({id, user, comment, updated: new Date()})
  }

  res.end();
};
