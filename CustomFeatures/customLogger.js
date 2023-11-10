const fs = require('fs');
const util = require('util');
const path = require('path');

// Preserve original console methods
const originalConsoleLog = console.log;
const originalConsoleError = console.error;

// Log directory path
const logDirectory = path.join(__dirname, '../logs');
if (!fs.existsSync(logDirectory)) {
    fs.mkdirSync(logDirectory);
}

// Create a write stream for logging
const logFileStream = fs.createWriteStream(path.join(logDirectory, '../logs/bot-log.txt'), { flags: 'a' });

// Function to format timestamp
function formatTimestamp() {
    const now = new Date();
    const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
    const dayOfWeek = days[now.getDay()];
    const month = now.getMonth() + 1; // JavaScript months are 0-based
    const day = now.getDate();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedTime = `${hours % 12 || 12}:${minutes < 10 ? '0' : ''}${minutes}${ampm}`;

    return `[${dayOfWeek} (${month}/${day}) ${formattedTime}]`;
}

// Custom log function
function customLog(level, ...args) {
    const timestamp = formatTimestamp();
    const message = util.format(...args);
    const formattedMessage = `${timestamp} [${level}] ${message}`;

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
