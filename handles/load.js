const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { nayan } = require('./nayan.js');
const config = require('../config.json');

const commands = new Map();
const postbacks = new Map();
const commentReplies = new Map();
const commentPlugins = [];
const commandNames = new Set();
const commandAliases = new Set();
const commentKeywords = new Set();

// ===== Auto installer =====
function autoInstall(moduleName) {
  try {
    console.log(`📦 Auto installing → ${moduleName}`);
    execSync(`npm install ${moduleName}`, { stdio: 'inherit' });
    console.log(`✅ Installed → ${moduleName}`);
    return true;
  } catch {
    console.error(`❌ Auto install failed → ${moduleName}`);
    return false;
  }
}

function safeRequire(filePath) {
  try {
    return require(filePath);
  } catch (err) {
    const m = err.message.match(/Cannot find module '(.+?)'/);
    if (!m) throw err;

    const pkg = m[1];
    if (!autoInstall(pkg)) throw err;
    return require(filePath);
  }
}

// Counters
let cmdLoaded = 0, cmdFailed = 0;
let pbLoaded = 0, pbFailed = 0;
let crLoaded = 0, crFailed = 0;

/* ================= COMMANDS ================= */
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🚀 Loading Commands...');

const cmdDir = path.join(__dirname, '../plugins/commands');
const cmdFiles = fs.existsSync(cmdDir)
  ? fs.readdirSync(cmdDir).filter(f => f.endsWith('.js'))
  : [];

for (const file of cmdFiles) {
  try {
    const cmd = safeRequire(path.join(cmdDir, file));
    if (!cmd.config || !cmd.config.name) throw new Error('Missing config.name');

    const name = cmd.config.name.toLowerCase();
    if (commandNames.has(name)) {
      console.warn(`⚠️ Duplicate command name skipped → ${name}`);
      continue;
    }

    // ❌ Duplicate aliases
    if (Array.isArray(cmd.config.aliases)) {
      const conflict = cmd.config.aliases.find(a =>
        commandAliases.has(a.toLowerCase())
      );

      if (conflict) {
        console.warn(`⚠️ Duplicate alias "${conflict}" skipped → ${name}`);
        continue;
      }
    }

    commands.set(cmd.config.name.toLowerCase(), cmd);
    commandNames.add(name)

    if (Array.isArray(cmd.config.aliases)) {
      cmd.config.aliases.forEach(a =>
        commandAliases.add(a.toLowerCase())
      );
    }
    
    cmdLoaded++;
    console.log(`⚡ Command Loaded → ${cmd.config.name}`);
  } catch (err) {
    cmdFailed++;
    console.error(`❌ Command Failed → ${file}`);
    console.error(`   ↳ ${err.message}`);
  }
}

/* ================= POSTBACKS ================= */
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🚀 Loading Postbacks...');

const pbDir = path.join(__dirname, '../plugins/postbacks');
const pbFiles = fs.existsSync(pbDir)
  ? fs.readdirSync(pbDir).filter(f => f.endsWith('.js'))
  : [];

for (const file of pbFiles) {
  try {
    const cmd = safeRequire(path.join(pbDir, file));
    if (!cmd.config || !cmd.config.payload) throw new Error('Missing config.payload');

    postbacks.set(cmd.config.payload, cmd);
    pbLoaded++;
    console.log(`⚡ Postback Loaded → ${cmd.config.payload}`);
  } catch (err) {
    pbFailed++;
    console.error(`❌ Postback Failed → ${file}`);
    console.error(`   ↳ ${err.message}`);
  }
}

/* ================= COMMENT TO REPLY ================= */
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🚀 Loading Comment-to-Reply Plugins...');

const crDir = path.join(__dirname, '../plugins/commentToReply');
const crFiles = fs.existsSync(crDir)
  ? fs.readdirSync(crDir).filter(f => f.endsWith('.js'))
  : [];

for (const file of crFiles) {
  try {
    const plugin = safeRequire(path.join(crDir, file));
    if (typeof plugin.run !== 'function') throw new Error('Missing run()');

    commentPlugins.push(plugin);
    crLoaded++;
    console.log(`💬 Comment Plugin Loaded → ${file}`);
  } catch (err) {
    crFailed++;
    console.error(`❌ Comment Plugin Failed → ${file}`);
    console.error(`   ↳ ${err.message}`);
  }
}

/* ================= SUMMARY ================= */
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log(`✅ Commands Loaded: ${cmdLoaded}`);
console.log(`✅ Postbacks Loaded: ${pbLoaded}`);
console.log(`✅ Comment Plugins Loaded: ${crLoaded}`);
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

module.exports = {
  commands,
  postbacks,
  commentReplies,
  commentPlugins,
  nayan
};
