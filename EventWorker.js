const { Worker } = require('bullmq')
const { MongoClient } = require('mongodb')

const { voiceQueue } = require('./config/data')
const { url, dbName, colName } = require('./config/mongoConfig')

try {

    // Creating mongo connection

    const mongoConn = new MongoClient(url)
    mongoConn.connect()

    const worker = new Worker(voiceQueue.eventsVoiceObdTatatele, async job => {
        console.log(`Consumed data from ${voiceQueue.eventsVoiceObdTatatele} queue`)
        console.log(job.data)
        const eventData = job.data


        const db = await mongoConn.db(dbName)
        const collection = await db.collection(colName)

        let updatedEvent = {}
        updatedEvent[eventData.event] = eventData.ts
        
        collection.updateOne(
            { "apikey": eventData.apikey, "number": eventData.number, "requestid": eventData.requestid },
            { '$set': updatedEvent })

        // collection.insertOne(mongoData)

    })
} catch (err) {
    console.log('Error', err)
}