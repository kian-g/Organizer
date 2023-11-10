const fs = require('fs');
const util = require('util');
const path = require('path');

// Preserve original console methods
const originalConsoleLog = console.log;
const originalConsoleError = console.error;

// Log directory path
const logDirectory = path.join(__dirname, 'logs');
if (!fs.existsSync(logDirectory)) {
    fs.mkdirSync(logDirectory);
}

// Create a write stream for logging
const logFileStream = fs.createWriteStream(path.join(logDirectory, 'bot-log.txt'), { flags: 'a' });

// Custom log function
function customLog(level, ...args) {
    const timestamp = new Date().toISOString();
    const message = util.format(...args);
    const formattedMessage = `[${timestamp}] [${level}] ${message}`;

    // Use original console method
    const originalMethod = level === 'ERROR' ? originalConsoleError : originalConsoleLog;
    originalMethod(formattedMessage);

    // Log to file
    logFileStream.write(formattedMessage + '\n');
}

// Override console.log
console.log = (...args) => {
    customLog('INFO', ...args);
};

// Override console.error
console.error = (...args) => {
    customLog('ERROR', ...args);
};

module.exports = {
    log: console.log,
    error: console.error
};
