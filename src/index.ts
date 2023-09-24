import "dotenv/config"

import { Client, Collection, IntentsBitField } from "discord.js"
import { loader } from "./util/loader.js"

import type { ChatCommand } from "#types/Command"
import type { Event } from "#types/Event"

declare global {
    namespace NodeJS {
        export interface ProcessEnv {
            DISCORD_TOKEN: string;
            GUILD_ID: string;
        }
    }
}

declare module 'discord.js' {
    interface Client {
        commands: Collection<string, ChatCommand>;
    }
}

class DM extends Client {
    constructor() {
        super({
            intents: [
                IntentsBitField.Flags.Guilds,
                IntentsBitField.Flags.GuildVoiceStates
            ]
        });

        ["DISCORD_TOKEN", "GUILD_ID"].forEach(x => {
            if (!(x in process.env)) throw new Error(`Environment variable '${x}' not defined`)
        })

        this.commands = new Collection<string, ChatCommand>()
    }

    init() {
        loader<ChatCommand>('commands', ({ command }) => {
            if (this.commands.has(command.data.name)) throw new Error(`Duplicate command: ${command.data.name}`)
            this.commands.set(command.data.name, command)
        })

        loader<Event>('events', ({ event }) => {
            this.on(event.name, event.exec)
        })

        this.login()
    }
}

new DM().init()