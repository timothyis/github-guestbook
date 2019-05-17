const url = require('url')
const connect = require("../../lib/db");

module.exports = async (req, res) => {
  // Connect to MongoDB and get the client
  const client = await connect()

  // Parse queries or set defaults
  const { query } = url.parse(req.url, true);
  let limit = parseInt(query.limit) || 9
  let page = parseInt(query.page) || 1

  // If page query is less than one, default to 1
  if (page < 1) page = 1

  // If limit query is less than one or more than a hundred, default to either
  if (limit < 1) limit = 1
  if (limit > 100) limit = 100

  // Parse database name from MongoDB URI string
  const database = await client.db(url.parse(process.env.MONGODB_URI).pathname.substr(1))

  const signaturesCollection = await database.collection('signatures')

  const guestbook = await signaturesCollection.find().sort({ updated: -1 }).limit(limit).skip((page-1)*limit).toArray()

  // Get full count of profiles in collection and work out the number
  // of pages there will be, using the limit
  const signaturesCount = await signaturesCollection.countDocuments()
  const pageCount = Math.ceil(signaturesCount / limit);

  // Close the client connection
  await client.close()

  res.end(JSON.stringify({ guestbook, total: signaturesCount, pageCount }))
};
