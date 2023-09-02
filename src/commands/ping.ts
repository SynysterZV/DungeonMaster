import { ApplicationCommandOptionType as aType } from "discord.js"

import type { ChatCommand } from '#types/Command'

export const command: ChatCommand = {
    data: {
        name: "ping",
        description: "pong",
        options: [
            {
                name: "ephemeral",
                description: "Hide this message?",
                type: aType.Boolean
            }
        ]
    },

    async exec(int) {
        int.reply({
            content: "Pong!",
            ephemeral: int.options.getBoolean('ephemeral') ?? true
        })
    }
}