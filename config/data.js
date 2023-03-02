const voiceUrls = {
    MTALKZ_VOICE_OBD_API: "https://api-smartflo.tatateleservices.com/v1/broadcast/lead/",
}

const voiceQueue = {
    voiceObdTatatele: "voice-obd-tatatele",
    eventsVoiceObdTatatele: "events-voice-obd-tatatele",
}

const DefaultTTL = 7 * 24 * 60 * 60

module.exports = {
    voiceUrls,
    voiceQueue,
    DefaultTTL,
}