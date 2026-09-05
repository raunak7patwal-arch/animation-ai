const { execFile } = require("child_process");

const SAFE_COMMANDS = new Set([
  "pwd",
  "ls",
  "whoami",
  "id",
  "uname",
  "date",
  "df",
  "du",
  "uptime",
  "pm",
  "termux-battery-status",
  "termux-wifi-connectioninfo"
]);

function runSafe(command, args = []) {
  return new Promise((resolve, reject) => {
    if (!SAFE_COMMANDS.has(command)) {
      return reject(new Error("Command not allowed by JARVIS Termux policy."));
    }

    execFile(command, args, {
      timeout: 10000,
      maxBuffer: 1024 * 1024
    }, (error, stdout, stderr) => {
      if (error) {
        return reject(error);
      }

      resolve({
        stdout: stdout || "",
        stderr: stderr || ""
      });
    });
  });
}

module.exports = { runSafe };
