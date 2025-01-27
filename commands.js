import {
  remind,
  getChatId,
  saveToDb,
  addInfo,
  start,
} from "./handlers/commandHandlers.js";

export const setupCommands = (bot) => {
  bot.command("getid", getChatId);
  bot.command("save_me", saveToDb);
  bot.command("add_info", addInfo);
  bot.command("remind", remind);
  bot.command("start", start);
};
