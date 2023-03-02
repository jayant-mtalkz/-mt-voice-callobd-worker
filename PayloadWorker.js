const axios = require('axios')
const Redis = require('ioredis')
const { MongoClient } = require('mongodb')

const { Queue, Worker } = require('bullmq')

const { voiceUrls, voiceQueue, responses, DefaultTTL } = require('./config/data')
const { dbName } = require('./config/mongoConfig')

const { redisConnection } = require('./config/redisConfig')

try {

    // Creating redis connection

    const redis = new Redis(redisConnection)
    redis.on('error', (err) => {
        console.log("Can't connect to redis")
    })

    // Creating voice-callobd-tatatele worker

    const worker = new Worker(
        voiceQueue.voiceObdTatatele,
        async (job) => {

            //console.log(job.data)
            console.log(`Consumed data from ${voiceQueue.voiceObdTatatele} queue`)
            console.log(job.data)

            const { ivr_id } = job.data.data

            if (ivr_id === null || ivr_id === undefined) {
                const key = `REQM:${apikey}:${requestid}`
                const result = {
                    "status": "error",
                    "message": "IVR ID not specified"
                }

                await redis.set(key, JSON.stringify(result), 'ex', DefaultTTL)
                throw new Error("IVR ID not specified")
            }

            const { campaign, to, integration } = job.data.data

            const { requestid, apikey } = job.data

            const voiceApiHeaders = {
                "accept": "application/json",
                "Authorization": integration.params.token,
                "content-type": "application/json",
            }

            if (typeof to[0] === 'object' && to[0] !== null) {

                to.forEach(async (arrayItem) => {

                    let data = arrayItem

                    for (i in data) {

                        data['field_' + i] = data[i]
                        delete data[i]
                    }
                    try {

                        const resp = await axios({
                            method: 'post',
                            url: voiceUrls.MTALKZ_VOICE_OBD_API + campaign,
                            headers: voiceApiHeaders,
                            data: data,
                        })

                        const ivrKey = `REQMAP:${data.field_0}:${ivr_id}`
                        const ivrValue = { requestid, apikey, }
                        await redis.set(ivrKey, JSON.stringify(ivrValue), 'ex', DefaultTTL)

                        const numKey = `REQM:${apikey}:${requestid}:${data.field_0}`
                        const numValue = { requestid, number: data.field_0, status: "relayed" }
                        await redis.set(numKey, JSON.stringify(numValue), 'ex', DefaultTTL)

                        const myQueue = new Queue(voiceQueue.eventsVoiceObdTatatele, {
                            connection: redisConnection
                        })

                        const eventQueuePayload = {
                            prefix: dbName,
                            apikey,
                            ts: Date.now(),
                            event: 'relayed',
                            requestid,
                            number: data.field_0,
                            campaign,
                            provider: voiceQueue.voiceObdTatatele
                        }

                        // addJobs()
                        await myQueue.add(requestid, eventQueuePayload)

                        // async function addJobs() {
                        //     await myQueue.add(requestid, eventQueuePayload)
                        // }

                    } catch (err) {
                        console.log("Error: " + err)
                    }

                })
            }
            else {

                to.forEach(async (arrayItem) => {

                    try {

                        const resp = await axios({
                            method: 'post',
                            url: voiceUrls.MTALKZ_VOICE_CALLOBD_API + campaign,
                            headers: voiceApiHeaders,
                            data: { "field_0": arrayItem },
                        })

                        const ivrKey = `REQMAP:${arrayItem}:${ivr_id}`
                        const ivrValue = { requestid, apikey, }
                        await redis.set(ivrKey, JSON.stringify(ivrValue), 'ex', DefaultTTL)

                        const numKey = `REQM:${apikey}:${requestid}:${arrayItem}`
                        const numValue = { requestid, number: data.field_0, status: "relayed" }
                        await redis.set(numKey, JSON.stringify(numValue), 'ex', DefaultTTL)

                        const myQueue = new Queue(voiceQueue.eventsVoiceObdTatatele, {
                            connection: redisConnection
                        })

                        const eventQueuePayload = {
                            prefix: dbName,
                            apikey,
                            ts: Date.now(),
                            event: 'relayed',
                            requestid,
                            number: arrayItem,
                            campaign,
                            provider: voiceQueue.voiceObdTatatele
                        }

                        // async function addJobs() {
                        //     await myQueue.add(requestid, eventQueuePayload)
                        // }

                        // addJobs()
                        await myQueue.add(requestid, eventQueuePayload)

                    } catch (err) {
                        console.log("Error: " + err)
                    }
                })
            }
        },
        // Setting the concurrency level
        { concurrency: 5 },
    )
    // Catching Error
} catch (err) {
    console.log('Error', err)
}