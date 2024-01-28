import {
  Client,
  GatewayIntentBits, Message,
} from "discord.js";

interface SocialNetwork {
  pattern: string;
  host: string;
}

// Match host/username/content to prevent matching profiles
const socialNetworks: SocialNetwork[] = [
  {
    //        .*(https:.*[^vx](twitter.com|x.com)\/.+\/.+\/.+\d).*
    pattern: '.*(https:.*[^vx](twitter.com|x.com)\/.+\/.+\/.+\s*).*',
    host: 'vxtwitter.com',
  },
  {
    // .*(https:.*[^vx]tiktok.com\/@.*\/.+\?*\d).*
    pattern: '.*(https:.*[^vx]tiktok\.com\/@.*\/.+\/.*\s*).*',
    host:  'vxtiktok.com',
  },
  {
    pattern: '.*(https:.*[^d]instagram\.com.*\/.+\/.+\s*).*',
    host: 'ddinstagram.com',
  },
];

function replySocialLinkIfMatches(message: Message, socialNetwork: SocialNetwork) {
  const [match, group] = message.content.match(socialNetwork.pattern) || [];
  if (!match) return;

  const url = new URL(group);
  url.host = socialNetwork.host;

  message.reply({
    content: url.toString(),
    allowedMentions: { repliedUser: false }
  }).then(() => message.suppressEmbeds(true));
}

export class DiscordClient {
  private client: Client;

  public async init(token: string, clientId: string) {
    const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages,  GatewayIntentBits.MessageContent] });
    await client.login(token);

    client.once('ready', () => {
      console.log('Ready!');
    });

    client.on("messageCreate", message => {
      try {
        if (!message.content) return console.log('no content')
        socialNetworks.forEach(network => replySocialLinkIfMatches(message, network));
      } catch (err) {
        console.log(err);
      }
    });

    this.client = client;
    return this;
  }
}
