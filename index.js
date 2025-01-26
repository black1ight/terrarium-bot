import dotenv from "dotenv";
dotenv.config();
import { Bot } from "grammy";
import { scheduleDailyMessages } from "./utilits.js";
import {
  addInfoValue,
  savePhoto,
  deleteDoc,
  newMembers,
  newChatForBot,
  showUserInfo,
  showUserPhoto,
} from "./handlers/listenerHandlers.js";
import {
  remind,
  getChatId,
  saveToDb,
  addInfo,
  start,
} from "./handlers/commandHandlers.js";
import { answer } from "./handlers/otherHandlers.js";

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

bot.on("my_chat_member", newChatForBot);
bot.command("getid", getChatId);
bot.command("save_me", saveToDb);
bot.command("add_info", addInfo);
bot.hears(/^##\w+$/, showUserInfo);
bot.hears(/^#\w+$/, showUserPhoto);
bot.callbackQuery(/answer:(.+)/, answer);
bot.on("message:new_chat_members", newMembers);
bot.command("remind", remind);
bot.on("message", (ctx) => {
  userState[ctx.from.id] ? addInfoValue(ctx) : savePhoto(ctx);
});
bot.on("chat_member", deleteDoc);
bot.command("start", start);
bot.catch((err) => {
  console.error("Произошла ошибка:", err.message);
});

scheduleDailyMessages();

bot.start({
  allowed_updates: [
    "chat_member",
    "message",
    "edited_message",
    "callback_query",
    "my_chat_member",
  ],
});
