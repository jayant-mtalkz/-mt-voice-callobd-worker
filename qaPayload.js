const { Queue } = require('bullmq')

const { voiceQueue } = require('./config/data')
const { redisConnection } = require('./config/redisConfig')


const queuedPayload = {
    prefix: 'MTKZ',
    apikey: '70Gopn5Rv8yFChQm',
    ts: 1677818521479,
    event: 'queued',
    requestid: 'o7JhmTZYzvoiheY',
    number: '918081701067',
    campaign: '212987',
    provider: 'voice-obd-tatatele'
}
const queuedPayload1 = {
    prefix: 'MTKZ',
    apikey: '70Gopn5Rv8yFChQm',
    ts: 1677818521479,
    event: 'queued',
    requestid: 'o7JhmTZYzvoiheY',
    number: '919205732793',
    campaign: '212987',
    provider: 'voice-obd-tatatele'
}

const acceptedPayload = {
    prefix: 'MTKZ',
    apikey: '70Gopn5Rv8yFChQm',
    ts: 1677818544680,
    event: 'accepted',
    requestid: 'o7JhmTZYzvoiheY',
    number: '918081701067',
    campaign: '212987',
    provider: 'voice-obd-tatatele'
}
const acceptedPayload1 = {
    prefix: 'MTKZ',
    apikey: '70Gopn5Rv8yFChQm',
    ts: 1677818544680,
    event: 'accepted',
    requestid: 'o7JhmTZYzvoiheY',
    number: '919205732793',
    campaign: '212987',
    provider: 'voice-obd-tatatele'
}

try {
    // Creating queue
    const myQueue = new Queue(voiceQueue.eventsVoiceObdTatatele, {
        connection: redisConnection
    })

    async function addJobs() {
        await myQueue.add('callObject', JSON.stringify(queuedPayload))
        // await myQueue.add('callObject', JSON.stringify(queuedPayload1))
        await myQueue.add('callString', JSON.stringify(acceptedPayload))
        // await myQueue.add('callString', JSON.stringify(acceptedPayload1))
    }

    addJobs()
    // console.log(`Payload added to queue: ${voiceQueue.eventsVoiceObdTatatele}`)

} catch (err) {
    console.log(`Error Creating ${voiceQueue.eventsVoiceObdTatatele} :`, err)
}