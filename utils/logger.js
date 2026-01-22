// logger.js (or paste directly in index.js)

/* ===============================
   Color Codes (Safe)
================================ */
const isColorSupported = process.stdout.isTTY;

const colors = {
  reset: isColorSupported ? "\x1b[0m" : "",
  green: isColorSupported ? "\x1b[32m" : "",
  red: isColorSupported ? "\x1b[31m" : "",
  yellow: isColorSupported ? "\x1b[33m" : "",
  cyan: isColorSupported ? "\x1b[36m" : "",
  gray: isColorSupported ? "\x1b[90m" : ""
};

/* ===============================
   Time Formatter
================================ */
function getTime() {
  const d = new Date();
  return d.toLocaleString("en-GB", {
    hour12: true,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });
}

/* ===============================
   Safe Message Formatter
================================ */
function formatMsg(msg) {
  if (msg instanceof Error) {
    return msg.stack || msg.message;
  }
  if (typeof msg === "object") {
    try {
      return JSON.stringify(msg, null, 2);
    } catch {
      return String(msg);
    }
  }
  return String(msg);
}

/* ===============================
   Global Logger
================================ */
global.log = {
  info(msg) {
    console.log(
      `${colors.gray}[${getTime()}]${colors.reset} ` +
      `${colors.cyan}[INFO]${colors.reset} ` +
      formatMsg(msg)
    );
  },

  success(msg) {
    console.log(
      `${colors.gray}[${getTime()}]${colors.reset} ` +
      `${colors.green}[SUCCESS]${colors.reset} ` +
      formatMsg(msg)
    );
  },

  warn(msg) {
    console.log(
      `${colors.gray}[${getTime()}]${colors.reset} ` +
      `${colors.yellow}[WARN]${colors.reset} ` +
      formatMsg(msg)
    );
  },

  error(msg) {
    console.error(
      `${colors.gray}[${getTime()}]${colors.reset} ` +
      `${colors.red}[ERROR]${colors.reset} ` +
      formatMsg(msg)
    );
  }
};

/* ===============================
   Export (optional)
================================ */
module.exports = global.log;
