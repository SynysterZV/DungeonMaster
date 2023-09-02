function init(open: number) {
    return function (str: string) {
        return `\x1b[${open}m${str}\x1b[0m`
    }
}

const Colors = {
    bold: init(1),
    underline: init(4),
    black: init(30),
    red: init(31),
    green: init(32),
    magenta: init(35)
}

export class Logger {

    static log(content: string | string[], ...colors: (keyof typeof Colors)[]) {
        if (!Array.isArray(content)) content = [content]
        content.forEach(str => {
            console.log(`[${new Date().toLocaleTimeString()}] :: ${colors.reduce((a,c) => Colors[c](a), str)}`)
        })
    }

    static success(content: string | string[]) {
        return this.log(content, "green")
    }

    static error(content: string | string[]) {
        return this.log(content, "red", "bold")
    }

    static debug(content: string | string[]) {
        return this.log(content, 'magenta')
    }
}