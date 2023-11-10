(async () => {
    const chalk = (await import('chalk')).default;

    // Save the original console methods
    const originalLog = console.log;
    const originalError = console.error;
    const originalWarn = console.warn;
    const originalInfo = console.info;

    // Override the default console.log
    console.log = (...args) => {
        const styledArgs = args.map(arg => chalk.green(arg));
        originalLog.apply(console, styledArgs);
    };

    // Override the default console.error
    console.error = (...args) => {
        const styledArgs = args.map(arg => chalk.red(arg));
        originalError.apply(console, styledArgs);
    };

    // Override the default console.warn
    console.warn = (...args) => {
        const styledArgs = args.map(arg => chalk.yellow(arg));
        originalWarn.apply(console, styledArgs);
    };

    // Override the default console.info
    console.info = (...args) => {
        const styledArgs = args.map(arg => chalk.blue(arg));
        originalInfo.apply(console, styledArgs);
    };
})();

