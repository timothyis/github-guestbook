const MongoClient = require('mongodb').MongoClient
const uri = process.env.MONGODB_URI

module.exports = async (req, res) => {
  // Create MongoDB Client
  const client = new MongoClient(uri, { useNewUrlParser: true, ssl: true })

  try {
    // Connect MongoDB with the client
    await client.connect()
  } catch (err) {
    throw new Error('[MongoDB] Connection Error: ' + err)
  }

  // Return the client for use and closure
  return client
}