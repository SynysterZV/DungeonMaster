import { Logger } from "../util/logger.js"

import type { Event } from "#types/Event"

export const event: Event<'ready'> = {
    name: "ready",
    async exec(client) {
        const cmds = client.commands.map(x => x.data)
        if(!cmds.length) Logger.error("No commands!")

        const guild = client.guilds.cache.get(process.env['GUILD_ID'])
        if(!guild) return Logger.error('Invalid GUILD_ID!')

        await guild.commands.set(cmds)
        await client.guilds.cache.get("806550877439131660")?.commands.set(cmds)

        Logger.success(`Ready! [${client.user.tag}]`)
    }
}