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
        const eventData = JSON.parse(job.data)
        console.log(eventData)


        const db = await mongoConn.db(dbName)
        const collection = await db.collection(colName)

        const query = { "apikey": eventData.apikey, "number": eventData.number, "requestid": eventData.requestid }
        const chk = await collection.findOne(query)

        // console.log("checking collection",chk)

        if (chk) {
            // console.log("data present")
            collection.updateOne(
                query,
                { '$set': { [eventData.event]: eventData.ts } })
            // collection.insertOne(mongoData)
        }
        else {
            // console.log("data not present")
            const {
                apikey,
                number,
                requestid,
                campaign,
                provider,
                ts,
                event,
            } = eventData

            const newPayload = {
                apikey,
                number,
                requestid,
                campaign,
                provider,
                [event]: ts,
            }
            collection.insertOne(newPayload)
        }
    })
} catch (err) {
    console.log('Error', err)
}