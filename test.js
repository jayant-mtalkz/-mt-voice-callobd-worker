const { MongoClient } = require('mongodb')

async function chk() {
    const mongoConn = new MongoClient('mongodb://0.0.0.0:27017')
    mongoConn.connect()
    const db = await mongoConn.db('MTKZ')
    const collection = await db.collection('test')

    // collection.insertOne({ "hello": "world" })
    const result = await collection.findOne({ "hello": "world" })
    console.log(result);
}
chk()
