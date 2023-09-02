import { globSync } from "glob";
export function loader(path, fn) {
    globSync(`dist/${path}/**/*.js`, { absolute: true }).forEach(file => {
        if (process.platform === "win32")
            file = `file://${file}`;
        return import(file).then(fn).catch(e => console.log(e));
    });
}
