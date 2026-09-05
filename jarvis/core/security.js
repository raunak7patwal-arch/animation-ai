const blocked = [
  /rm\s+-rf\s+\/\s*$/i,
  /mkfs(\s|$)/i,
  /dd\s+if=.*of=\/dev/i,
  /:\(\)\s*\{\s*:\|:\s*&\s*\};:/,
  /chmod\s+777\s+\//i,
  /su\s*$/i,
  /sudo\s+/i,
  /fastboot/i,
  /bootloader/i,
  /recovery\s+flash/i
];

const highImpact = [
  /delete/i,
  /remove/i,
  /wipe/i,
  /format/i,
  /shutdown/i,
  /reboot/i,
  /factory reset/i,
  /send money/i,
  /publish/i
];

function inspectCommand(command) {
  const value = String(command || "");

  for (const rule of blocked) {
    if (rule.test(value)) {
      return {
        allowed: false,
        requiresConfirmation: false,
        reason: "Protected system/root operation blocked."
      };
    }
  }

  for (const rule of highImpact) {
    if (rule.test(value)) {
      return {
        allowed: false,
        requiresConfirmation: true,
        reason: "High-impact operation requires explicit confirmation."
      };
    }
  }

  return {
    allowed: true,
    requiresConfirmation: false,
    reason: "Allowed user-space operation."
  };
}

module.exports = { inspectCommand };
