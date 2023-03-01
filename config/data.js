const voiceUrls = {
    MTALKZ_VOICE_OBD_API: "https://api-smartflo.tatateleservices.com/v1/broadcast/lead/",
}

const voiceQueue = {
    voice_obd_tatatele: "voice-obd-tatatele",
    events_voice_obd_tatatele: "events-voice-obd-tatatele",
}

const DefaultTTL = 7 * 24 * 60 * 60

module.exports = {
    voiceUrls,
    voiceQueue,
    DefaultTTL,
}