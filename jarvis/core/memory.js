const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const BASE = path.join(__dirname, "..", "memory");

function file(name) {
  return path.join(BASE, name);
}

function readJSON(name, fallback) {
  try {
    return JSON.parse(fs.readFileSync(file(name), "utf8"));
  } catch {
    return fallback;
  }
}

function writeJSON(name, data) {
  const tmp = file(name) + ".tmp";
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2));
  fs.renameSync(tmp, file(name));
}

function rememberConversation(user, assistant) {
  const data = readJSON("conversations.json", []);

  data.push({
    id: crypto.randomUUID(),
    time: new Date().toISOString(),
    user: String(user).slice(0, 10000),
    assistant: String(assistant).slice(0, 20000)
  });

  while (data.length > 500) data.shift();

  writeJSON("conversations.json", data);
}

function getRecent(limit = 10) {
  const data = readJSON("conversations.json", []);
  return data.slice(-limit);
}

function addFact(fact) {
  const data = readJSON("facts.json", []);

  const clean = String(fact).trim().slice(0, 2000);

  if (!clean) return;

  if (!data.includes(clean)) {
    data.push(clean);
  }

  while (data.length > 200) data.shift();

  writeJSON("facts.json", data);
}

function getFacts() {
  return readJSON("facts.json", []);
}

function savePreferences(data) {
  writeJSON("preferences.json", data || {});
}

function getPreferences() {
  return readJSON("preferences.json", {});
}

module.exports = {
  rememberConversation,
  getRecent,
  addFact,
  getFacts,
  savePreferences,
  getPreferences
};
