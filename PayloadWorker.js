const axios = require('axios')
const Redis = require('ioredis')

const { Queue, Worker } = require('bullmq')

const { voiceUrls, voiceQueue, responses, DefaultTTL } = require('./data')

const { redisConnection } = require('./config/redisConfig')

try {

    // Creating redis connection

    const redis = new Redis(redisConnection)

    // Creating voice-callpatch-tatatele worker

    const worker = new Worker(
        voiceQueue.callobd,
        async (job) => {

            //console.log(job.data);
            console.log(`Consumed data from ${voiceQueue.callobd} queue`)
            console.log(job.data)

            const { requestid, apikey } = job.data

            const { campaign, to, integration } = job.data.data

            const { token } = integration.params

            const url = voiceUrls.MTALKZ_VOICE_CALLOBD_API + campaign

            const voiceApiHeaders = {
                "accept": "application/json",
                "Authorization": token,
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
                            url: voiceUrls.MTALKZ_VOICE_CALLOBD_API + campaign,
                            headers: voiceApiHeaders,
                            data: data,
                        })

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
                //         else {

                //             try {
                //                 const resp = await axios({
                //                     method: 'post',
                //                     url: voiceUrls.MTALKZ_VOICE_CALLOBD_API + campaign,
                //                     headers: voiceApiHeaders,
                //                     data: { "field_0"},
                //                 })
                //             }
                //     }
                // }
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