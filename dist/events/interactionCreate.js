import { Logger } from "../util/logger.js";
export const event = {
    name: "interactionCreate",
    async exec(int) {
        if (int.isChatInputCommand()) {
            const cmd = int.client.commands.get(int.commandName);
            if (!cmd)
                return Logger.error(`Unimplimented command registered: ${int.commandName}`);
            try {
                await cmd.exec(int);
            }
            catch (e) {
                return console.log(e);
            }
        }
    }
};
