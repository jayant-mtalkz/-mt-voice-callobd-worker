const { Worker } = require('bullmq');
const { voiceQueue } = require('./config/data')


const worker = new Worker(voiceQueue.eventsVoiceObdTatatele, async job => {
    console.log(`Consumed data from ${voiceQueue.eventsVoiceObdTatatele} queue`)
    console.log(job.data)
})
