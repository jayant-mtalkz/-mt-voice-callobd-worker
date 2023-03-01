const axios = require('axios')
const Redis = require('ioredis')

const { Queue, Worker } = require('bullmq')

const { voiceUrls, voiceQueue, responses, DefaultTTL } = require('./config/data')

const { redisConnection } = require('./config/redisConfig')

try {

    // Creating redis connection

    const redis = new Redis(redisConnection)
    redis.on('error',(err) => {
        console.log("Can't connect to redis")
    })

    // Creating voice-callobd-tatatele worker

    const worker = new Worker(
        voiceQueue.voice_obd_tatatele,
        async (job) => {

            //console.log(job.data)
            console.log(`Consumed data from ${voiceQueue.voice_obd_tatatele} queue`)
            console.log(job.data)

            const { requestid, apikey } = job.data

            const { campaign, to, integration } = job.data.data

            const url = voiceUrls.MTALKZ_VOICE_OBD_API + campaign

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

                        const mapKey = `REQMAP:voice:${resp.data.id}`
                        const value = { requestid, id: resp.data.id, apikey, number: data.field_0 }
                        await redis.set(mapKey, JSON.stringify(value), 'ex', DefaultTTL)

                        const numKey = `REQM:${apikey}:${requestid}:${data.field_0}`
                        await redis.set(numKey, JSON.stringify(resp.data), 'ex', DefaultTTL)

                        const myQueue = new Queue(voiceQueue.events_voice_obd_tatatele, {
                            connection: redisConnection
                        })

                        async function addJobs() {
                            await myQueue.add('call', resp.data)
                        }

                        addJobs()

                    } catch (err) {
                        console.log("Error##: " + err)
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

                        const mapKey = `REQMAP:voice:${resp.data.id}`
                        const value = { requestid, id: resp.data.id, apikey, number: arrayItem }
                        await redis.set(mapKey, JSON.stringify(value), 'ex', DefaultTTL)

                        const numKey = `REQM:${apikey}:${requestid}:${arrayItem}`
                        await redis.set(numKey, JSON.stringify(resp.data), 'ex', DefaultTTL)

                        const myQueue = new Queue(voiceQueue.events, {
                            connection: redisConnection
                        })

                        async function addJobs() {
                            await myQueue.add('call', resp.data)
                        }

                        addJobs()

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