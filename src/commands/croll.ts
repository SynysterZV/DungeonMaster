import { ApplicationCommandOptionType as aType } from "discord.js"
import { Roll } from "../util/roll.js"

import type { ChatCommand } from '#types/Command'



export const command: ChatCommand = {
    data: {
        name: "croll",
        description: "Normal rolling system",
        options: [
            {
                name: "roll",
                description: "roll string",
                type: aType.String,
                required: true
            }
        ]
    },

    async exec(int) {
        const m = int.options.getString("roll",true)

        const roll = Roll.parseRoll(m)

        if (roll.errors.length) {
            return int.reply({ content: roll.errors.join("\n"), ephemeral: true})
        }

        if (roll.errors[0] == roll.text) return;
        
        int.reply({ content: roll.text })
    }
}