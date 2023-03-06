const axios = require('axios')
const Redis = require('ioredis')
const { MongoClient } = require('mongodb')

const { Queue, Worker } = require('bullmq')

const { voiceUrls, voiceQueue, DefaultTTL } = require('./config/data')
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
            const payload = JSON.parse(job.data)
            console.log(payload)

            const { ivr_id } = payload.data

            if (ivr_id === null || ivr_id === undefined) {
                const key = `REQM:${apikey}:${requestid}`
                const result = {
                    "status": "error",
                    "message": "IVR ID not specified"
                }

                await redis.set(key, JSON.stringify(result), 'ex', DefaultTTL)
                throw new Error("IVR ID not specified")
            }

            const { to, integration } = payload.data

            const { requestid, apikey } = payload

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
                    data['field_34'] = ivr_id

                    // let status = "relayed",
                    //     code = "MT000",
                    //     error = null
                    try {

                        const resp = await axios({
                            method: 'post',
                            url: voiceUrls.MTALKZ_VOICE_OBD_API + payload.data.campaign,
                            headers: voiceApiHeaders,
                            data: data,
                        })

                        const ivrKey = `REQMAP:${data.field_0}:${ivr_id}`
                        const ivrValue = { requestid, apikey }
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
                            campaign: payload.data.campaign,
                            provider: integration.provider,
                        }

                        // addJobs()
                        await myQueue.add(requestid, JSON.stringify(eventQueuePayload))

                        // async function addJobs() {
                        //     await myQueue.add(requestid, eventQueuePayload)
                        // }

                    } catch (err) {
                        console.log("Error: " + err);
                        // status = "rejected"
                        // code = "MT101"
                        // error = err.message
                    }

                })
            }
            else {

                to.forEach(async (arrayItem) => {

                    // let status = "relayed",
                    //     code = "MT000",
                    //     error = null

                    try {

                        const resp = await axios({
                            method: 'post',
                            url: voiceUrls.MTALKZ_VOICE_CALLOBD_API + payload.data.campaign,
                            headers: voiceApiHeaders,
                            data: {
                                "field_0": arrayItem,
                                "field_34": ivr_id,
                            },
                        })

                        const ivrKey = `REQMAP:${arrayItem}:${ivr_id}`
                        const ivrValue = { requestid, apikey }
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
                            campaign: payload.data.campaign,
                            provider: integration.provider,
                        }

                        // async function addJobs() {
                        //     await myQueue.add(requestid, eventQueuePayload)
                        // }

                        // addJobs()
                        await myQueue.add(requestid, JSON.stringify(eventQueuePayload))

                    } catch (err) {
                        console.log("Error: " + err)
                        // status = "rejected"
                        // code = "MT101"
                        // error = err.message
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