const fs = require("fs");
const path = require("path");
const { execFile } = require("child_process");

function createBackup() {
  return new Promise((resolve, reject) => {
    const root = path.join(__dirname, "..", "..");
    const backupDir = path.join(root, "jarvis", "backup");

    fs.mkdirSync(backupDir, { recursive: true });

    const stamp = new Date()
      .toISOString()
      .replace(/[:.]/g, "-");

    const output = path.join(
      backupDir,
      `JARVIS-backup-${stamp}.tar.gz`
    );

    const args = [
      "-czf",
      output,
      "jarvis",
      "api",
      "package.json",
      ".env.example"
    ];

    execFile("tar", args, {
      cwd: root,
      timeout: 120000
    }, (error) => {
      if (error) return reject(error);

      resolve({
        success: true,
        file: output,
        message: "JARVIS user-space backup created."
      });
    });
  });
}

module.exports = { createBackup };
