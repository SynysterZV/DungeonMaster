import type {
    ApplicationCommandPermissions,
    ChatInputCommandInteraction,
    AutocompleteInteraction,
    ApplicationCommandData
} from "discord.js"

export type ChatCommand = BaseChatCommand | GuildChatCommand

export interface GuildChatCommand extends BaseChatCommand {
    guildIds: string[];
    permissions: ApplicationCommandPermissions[];
}

export interface BaseChatCommand {
    data: ApplicationCommandData;
    exec: (interaction: ChatInputCommandInteraction) => Promise<unknown>;
    autocomplete?: (interaction: AutocompleteInteraction) => Promise<unknown>;
}