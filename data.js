const voiceUrls = {
    MTALKZ_VOICE_CALLOBD_API: "https://api-smartflo.tatateleservices.com/v1/broadcast/lead/",
}

const voiceQueue = {
    callobd: "voice-callobd-tatatele",
    events: "events-voice-callobd-tatatele",
}

const DefaultTTL = 7 * 24 * 60 * 60

module.exports = {
    voiceUrls,
    voiceQueue,
    DefaultTTL,
}