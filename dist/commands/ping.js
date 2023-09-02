import { ApplicationCommandOptionType as aType } from "discord.js";
export const command = {
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
        });
    }
};
