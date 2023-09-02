function init(open) {
    return function (str) {
        return `\x1b[${open}m${str}\x1b[0m`;
    };
}
const Colors = {
    bold: init(1),
    underline: init(4),
    black: init(30),
    red: init(31),
    green: init(32),
    magenta: init(35)
};
export class Logger {
    static log(content, ...colors) {
        if (!Array.isArray(content))
            content = [content];
        content.forEach(str => {
            console.log(`[${new Date().toLocaleTimeString()}] :: ${colors.reduce((a, c) => Colors[c](a), str)}`);
        });
    }
    static success(content) {
        return this.log(content, "green");
    }
    static error(content) {
        return this.log(content, "red", "bold");
    }
    static debug(content) {
        return this.log(content, 'magenta');
    }
}
