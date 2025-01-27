import dotenv from "dotenv";
dotenv.config();
import { Bot } from "grammy";
import { scheduleDailyMessages } from "./utilits.js";
import { setupCommands } from "./commands.js";
import { setupListeners } from "./listeners.js";

const bot = new Bot(process.env.BOT_KEY);

bot.api.setMyCommands([
  {
    command: "start",
    description: "запуск бота",
  },
  {
    command: "save_me",
    description: "сохранить в базу",
  },
  {
    command: "remind",
    description: "вкл/выкл напоминания",
  },
  {
    command: "add_info",
    description: "указать информацию о себе",
  },
]);
let userState = {};
bot.use((ctx, next) => {
  ctx.userState = userState;
  ctx.chatIndex = process.env.CHAT_ID;
  ctx.bot = bot;
  return next();
});
setupCommands(bot);
setupListeners(bot);
scheduleDailyMessages(bot);
// bot.catch((err) => {
//   console.error("Произошла ошибка:", err.message);
// });
bot.start({
  allowed_updates: [
    "chat_member",
    "message",
    "edited_message",
    "callback_query",
    "my_chat_member",
  ],
});
