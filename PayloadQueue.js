const { Queue } = require('bullmq')

const { voiceQueue } = require('./config/data')
const { redisConnection } = require('./config/redisConfig')

// worker payload

const objectQueuePayload = {
    "requestid": "o7JhmTZYzvoiheY",
    "apikey": "70Gopn5Rv8yFChQm",
    "data": {
        "campaign": "211843",
        "ivr_id": "46433",
        "to": [
            {
                "0": "918081701067",
                "1": "Naman",
            },
            // {
            //     "0": "919205732793",
            //     "1": "Ritul",
            // },
        ],
        "integration": {
            "provider": "voice-callobd-tatatele",
            "params": {
                "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjMxNTAwNiwiaXNzIjoiaHR0cHM6XC9cL2Nsb3VkcGhvbmUudGF0YXRlbGVzZXJ2aWNlcy5jb21cL3Rva2VuXC9nZW5lcmF0ZSIsImlhdCI6MTY3NTE0OTg3MSwiZXhwIjoxOTc1MTQ5ODcxLCJuYmYiOjE2NzUxNDk4NzEsImp0aSI6IlREbm1MT0tZZlJkWGdtZmwifQ.NWeV7vlXeObBl1IDdUt-omCySLcPjT32__4vj9_BcbQ",
            },
        },
        "channel": "voice",
    },
}

const stringQueuePayload = {
    "requestid": "o7JhmTZYzvoiheY",
    "apikey": "70Gopn5Rv8yFChQm",
    "data": {
        "campaign": "211843",
        "ivr_id": "46433",
        "to": [
            "918821848295",
            "919759426266",
        ],
        "integration": {
            "provider": "voice-callobd-tatatele",
            "params": {
                "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjMxNTAwNiwiaXNzIjoiaHR0cHM6XC9cL2Nsb3VkcGhvbmUudGF0YXRlbGVzZXJ2aWNlcy5jb21cL3Rva2VuXC9nZW5lcmF0ZSIsImlhdCI6MTY3NTE0OTg3MSwiZXhwIjoxOTc1MTQ5ODcxLCJuYmYiOjE2NzUxNDk4NzEsImp0aSI6IlREbm1MT0tZZlJkWGdtZmwifQ.NWeV7vlXeObBl1IDdUt-omCySLcPjT32__4vj9_BcbQ",
            },
        },
        "channel": "voice",
    },
}


try {
    // Creating queue
    const myQueue = new Queue(voiceQueue.voice_obd_tatatele, {
        connection: redisConnection
    })

    async function addJobs() {
        await myQueue.add('callObject', objectQueuePayload)
        // await myQueue.add('callString', stringQueuePayload)
    }

    addJobs()
    // console.log(`Payload added to queue: ${voiceQueue.callpatch}`)

} catch (err) {
    console.log(`Error Creating ${voiceQueue.voice_obd_tatatele} :`, err)
}