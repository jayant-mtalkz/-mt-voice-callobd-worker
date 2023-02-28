const { Worker } = require('bullmq');
const { voiceQueue } = require('./data')


const worker = new Worker(voiceQueue.events, async job => {
    console.log(`Consumed data from ${voiceQueue.events} queue`)
    console.log(job.data)
})
