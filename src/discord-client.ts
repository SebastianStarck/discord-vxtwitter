import {
  Client,
  GatewayIntentBits, Message,
} from "discord.js";

const TWITTER_FACADE_HOST = 'vxtwitter.com';
const INSTAGRAM_FACADE_HOST = 'ddinstagram.com';

function checkForTwitterLink(message: Message) {
  const [match, group] = message.content.match('.*(https://(twitter\.com|x.com)/.*)\s?') || [];
  if (!match) return;

  const url = new URL(group);
  url.host = TWITTER_FACADE_HOST;

  message.reply({
    content: url.toString(),
    allowedMentions: { repliedUser: false }
  }).then(() => message.suppressEmbeds(true));
}
function checkForInstagramLink(message: Message) {
  const [match, group] = message.content.match('.*(https:\/\/(?:www\.)?instagram\\.com\/reel\/.*)\s?') || [];
  if (!match) return;

  const url = new URL(group);
  url.host = INSTAGRAM_FACADE_HOST;

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
        checkForTwitterLink(message)
        checkForInstagramLink(message)
      } catch (err) {
        console.log(err);
      }
    });

    this.client = client;
    return this;
  }
}
