// Replace this deterministic MVP parser with a structured LLM extraction service.
// Keep the same output contract and validate the result before creating an event.
function parseNaturalLanguageSchedule(message, now = new Date()) {
  const text = message.trim();
  const time = text.match(/\b(?:at\s+)?(\d{1,2})(?::(\d{2}))?\s*(am|pm)\b/i);
  const tomorrow = /\btomorrow\b/i.test(text);
  const title = text
    .replace(/^(hey|hae|please)?\s*(schedule|add|create|book)\s*/i, "")
    .replace(/\b(tomorrow|today)\b.*$/i, "")
    .replace(/\bat\s+\d{1,2}(?::\d{2})?\s*(am|pm)\b.*$/i, "")
    .trim() || "New event";

  const startTime = new Date(now);
  startTime.setSeconds(0, 0);
  if (tomorrow) startTime.setDate(startTime.getDate() + 1);
  if (time) {
    let hour = Number(time[1]);
    const minute = Number(time[2] || 0);
    const period = time[3].toLowerCase();
    if (period === "pm" && hour !== 12) hour += 12;
    if (period === "am" && hour === 12) hour = 0;
    startTime.setHours(hour, minute, 0, 0);
  } else {
    startTime.setHours(9, 0, 0, 0);
  }

  const endTime = new Date(startTime.getTime() + 60 * 60 * 1000);
  return { title, startTime, endTime, confidence: time || tomorrow ? 0.8 : 0.45 };
}

module.exports = { parseNaturalLanguageSchedule };
