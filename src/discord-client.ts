import {
    Client,
    GatewayIntentBits, GuildTextBasedChannel, If, Message, TextBasedChannel,
} from "discord.js";
import {aboutParagraphs} from "./aboutParagraphs";

interface SocialNetwork {
    pattern: string;
    host: string;
}

// Match host/username/content to prevent matching profiles
const socialNetworks: SocialNetwork[] = [
    {
        pattern: '.*(https:.*[^vx](twitter.com|x.com)\\/.+\\/.+\\/.+\\S*).*',
        host: 'vxtwitter.com',
    },
    {
        pattern: '.*(https:.*[^vx]tiktok\.com\/@.*\/.+\/.*\s*).*',
        host: 'vxtiktok.com',
    },
    {
        //https://www.instagram.com/stories/marioduplantier/3291124011566971373?utm_source=ig_story_item_share&igsh=bG5kMDdoNnVrNWV6
        // capture group 1: https://www.instagram.com/stories/marioduplantier/3291124011566971373
        pattern: '.*(https:.*[^d]instagram.com\/.+\/.+)[?\/].*',
        host: 'ddinstagram.com',
    },
];

function replySocialLinkIfMatches(message: Message, socialNetwork: SocialNetwork) {
    const [match, group, ...rest] = message.content.match(socialNetwork.pattern) || [];
    if (!match) return;

    const url = new URL(group);
    url.host = socialNetwork.host;

    console.log(match, group, rest)
    message.reply({
        content: url.toString(),
        allowedMentions: {repliedUser: false}
    }).then(() => message.suppressEmbeds(true));
}

export class DiscordClient {
    private client: Client;
    private isBeingPedantic: boolean = false;

    public async init(token: string, clientId: string) {
        const client = new Client({intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]});
        await client.login(token);

        client.once('ready', () => {
            console.log('Ready!');
        });

        client.on("messageCreate", message => {
            try {
                if (!message.content) return console.log('no content')
                if (message.content.startsWith('!about') && message.mentions.has(clientId)) return this.bePedantic(message);
                else socialNetworks.forEach(network => replySocialLinkIfMatches(message, network));
            } catch (err) {
                console.log(err);
            }
        });

        this.client = client;
        return this;
    }

    private bePedantic(message: Message<boolean>) {
        if (this.isBeingPedantic) return;
        this.isBeingPedantic = true;

        message.channel.sendTyping();
        aboutParagraphs.forEach((paragraph, i) => {
            const isLast = i === aboutParagraphs.length - 1;
            const delay = (i + 1) * 5000;
            this.sendAfterDelay(`\n\n${paragraph}`, message.channel, delay, isLast);

            if (isLast) setTimeout(() => this.isBeingPedantic = false, delay);
        });
    }

    private sendAfterDelay(paragraph: string, channel: If<boolean, GuildTextBasedChannel, TextBasedChannel>, number: number, isLast: boolean) {
        setTimeout(() => {
            channel
                .send(paragraph)
                .then(() => {
                    if (!isLast) channel.sendTyping();
                });
        }, number);
    }
}
