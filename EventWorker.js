const { Worker } = require('bullmq');
const { voiceQueue } = require('./config/data')


const worker = new Worker(voiceQueue.events_voice_obd_tatatele, async job => {
    console.log(`Consumed data from ${voiceQueue.events_voice_obd_tatatele} queue`)
    console.log(job.data)
})
