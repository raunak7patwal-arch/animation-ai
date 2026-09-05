function detectIntent(text) {
  const t = String(text).toLowerCase();

  if (
    /(video|वीडियो|animation|एनीमेशन|cartoon|कार्टून|clip|scene|सीन)/i.test(t)
  ) {
    if (/(image|photo|चित्र|तस्वीर)/i.test(t)) return "image-to-video";
    if (/(story|कहानी|स्टोरी)/i.test(t)) return "story-to-video";
    return "text-to-video";
  }

  if (/(youtube|यूट्यूब)/i.test(t)) {
    if (/(remix|रीमिक्स|parody|पैरोडी|analyze|analysis|विश्लेषण)/i.test(t)) {
      return "youtube-analysis";
    }
    return "youtube";
  }

  if (/(voice|आवाज|बोलो|speak|speech|tts)/i.test(t)) {
    return "voice";
  }

  if (/(image|photo|चित्र|तस्वीर|thumbnail|थंबनेल)/i.test(t)) {
    return "image";
  }

  if (
    /(nmap|wireshark|dns|http|linux|linux|termux|cyber|cybersecurity|security|network|vulnerability|vulnerability|ctf|penetration|pentest|malware|exploit)/i.test(t)
  ) {
    return "cybersecurity";
  }

  if (
    /(file|folder|directory|storage|battery|device|फोन|मोबाइल|termux command|command चलाओ|system info)/i.test(t)
  ) {
    return "device";
  }

  if (/(backup|बैकअप|export|transfer|restore|मूव)/i.test(t)) {
    return "backup";
  }

  return "chat";
}

function makePlan(intent, text) {
  const plans = {
    chat: ["understand", "answer"],
    cybersecurity: ["classify-security-task", "provide-technical-guidance"],
    "text-to-video": ["parse-video-request", "select-video-provider", "create-job"],
    "image-to-video": ["parse-image-input", "select-video-provider", "create-job"],
    "story-to-video": ["parse-story", "split-scenes", "create-video-jobs", "stitch"],
    voice: ["parse-voice-request", "select-voice-provider"],
    image: ["parse-image-request", "select-image-provider"],
    "youtube-analysis": ["validate-url", "analyze-permitted-data", "create-original-remix-plan"],
    youtube: ["validate-url", "read-permitted-metadata"],
    device: ["classify-device-action", "check-permission", "execute-safe-action"],
    backup: ["collect-user-space-data", "create-archive"]
  };

  return {
    intent,
    input: text,
    steps: plans[intent] || plans.chat
  };
}

module.exports = { detectIntent, makePlan };
