import { config } from "dotenv";
import { DiscordClient } from "./discord-client";

export let env;
try {
  config();
  env = process.env;
  new DiscordClient().init(env.DISCORD_API_KEY, env.CLIENT_ID);
} catch (err) {
  console.log(err);
}

