// const { mongoConfig, queues, redisConfig } = require("./config");
// const { MongoClient } = require("mongodb");

// const mongoConn = new MongoClient(mongoConfig.url);
// const { Worker } = require("bullmq");
// const dbmap = {};
// const collectionName = "whatsapp-trans-events";
const { Worker } = require('bullmq')
const { MongoClient } = require('mongodb')

const { voiceQueue } = require('./config/data')
const { url, dbName, colName } = require('./config/mongoConfig')

const mongoConn = new MongoClient(url)
try {
  // Create a mongo connection
  mongoConn.connect();
  

  const worker = new Worker(voiceQueue.eventsVoiceObdTatatele, async (job) => {
    const payload = JSON.parse(job.data);
    console.log(payload);
    const {
      prefix: dbName,
      apikey,
      ts,
      event,
      requestid,
      number,
      numbers,
      campaign_id,
      provider
    } = payload;
    let entityCollection = dbmap[dbName];
    if (!entityCollection) {
      // Collection not found in dbmap, attempt to create
      const db = mongoConn.db(dbName);
      try {
        entityCollection = await db.createCollection(colName);
        entityCollection.createIndex({ apikey: 1, requestid: 1, number: 1 }, { unique: true });
      } catch (e) {
        // Collection already exists
        entityCollection = db.collection(colName);
      }
      dbmap[dbName] = entityCollection;
    }
    let data = { provider, campaign_id };
    console.log(data);
    // Insert into database
    if (number) {
      const query = { apikey, requestid, number };
      data[event] = ts;
      entityCollection.updateOne(query, { $set: data }, { upsert: true });
    } else
      numbers.forEach(async number => {
        const query = { apikey, requestid, number };
        data[event] = ts;
        entityCollection.updateOne(query, { $set: data }, { upsert: true });
      });
  });
} catch (e) {
  console.log(e);
  mongoConn.close();
}