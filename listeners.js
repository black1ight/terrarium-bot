import { answer } from "./handlers/otherHandlers.js";
import {
  addInfoValue,
  savePhoto,
  deleteDoc,
  newMembers,
  newChatForBot,
  showUserInfo,
  showUserPhoto,
} from "./handlers/listenerHandlers.js";

export const setupListeners = (bot) => {
  bot.on("my_chat_member", newChatForBot);
  bot.hears(/^##\w+$/, showUserInfo);
  bot.hears(/^#\w+$/, showUserPhoto);
  bot.callbackQuery(/answer:(.+)/, answer);
  bot.on("message:new_chat_members", newMembers);
  bot.on("message", (ctx) => {
    ctx.userState[ctx.from.id] && ctx.chat.type === "private"
      ? addInfoValue(ctx)
      : savePhoto(ctx);
  });
  bot.on("chat_member", deleteDoc);
};
