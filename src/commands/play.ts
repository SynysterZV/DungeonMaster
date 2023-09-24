import { 
    createAudioResource,
    createAudioPlayer,
    NoSubscriberBehavior,
    AudioPlayerStatus,
    joinVoiceChannel,
    entersState,
    VoiceConnectionStatus
} from "@discordjs/voice";

import { BaseGuildVoiceChannel } from "discord.js";

import type { ChatCommand } from "#types/Command";

const player = createAudioPlayer({
    behaviors: {
        noSubscriber: NoSubscriberBehavior.Play,
        maxMissedFrames: Math.round(5000/20)
    }
})

player.on('stateChange', (oldState, newState) => {
    if (oldState.status === AudioPlayerStatus.Idle && newState.status == AudioPlayerStatus.Playing) {
        console.log('Playing audio output')
    } else if (newState.status === AudioPlayerStatus.Idle) {
        console.log('Playback stopped. Attempting to restart')
        attachRecorder()
    }
})

let resource = createAudioResource("https://radio.synzv.com//listen/default/ogg")

function attachRecorder() {
    player.play(resource)
}

async function connectToChannel(channel: BaseGuildVoiceChannel) {
    const connection = joinVoiceChannel({
        channelId: channel.id,
        guildId: channel.guildId,
        adapterCreator: channel.guild.voiceAdapterCreator
    })

    try {
        await entersState(connection, VoiceConnectionStatus.Ready, 30_000)
        return connection
    } catch (error) {
        connection.destroy()
        throw error
    }
}

attachRecorder()

export const command: ChatCommand = {
    data: {
        name: "play",
        description: "Play radio"
    },

    async exec(int) {
        if(!int.guild) return int.reply("You must be in a guild to use this command!")
        
        const member = await int.guild.members.fetch(int.user)
        if(!member) return int.reply("How")

        const { channel } = member.voice
        if(!channel) return int.reply("You must be in a voice channel to use this command")

        try {
            const connection = await connectToChannel(channel)
            connection.subscribe(player)
            await int.reply({ content: "Playing now!", ephemeral: true })
        } catch (error) {
            console.log(error)
        }
    }
}