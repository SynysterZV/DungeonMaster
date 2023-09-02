import "dotenv/config";
import { Client, Collection, IntentsBitField } from "discord.js";
import { loader } from "./util/loader.js";
class DM extends Client {
    constructor() {
        super({
            intents: [
                IntentsBitField.Flags.Guilds
            ]
        });
        ["DISCORD_TOKEN", "GUILD_ID"].forEach(x => {
            if (!(x in process.env))
                throw new Error(`Environment variable '${x}' not defined`);
        });
        this.commands = new Collection();
    }
    init() {
        loader('commands', ({ command }) => {
            if (this.commands.has(command.data.name))
                throw new Error(`Duplicate command: ${command.data.name}`);
            this.commands.set(command.data.name, command);
        });
        loader('events', ({ event }) => {
            this.on(event.name, event.exec);
        });
        this.login();
    }
}
new DM().init();
