import { deleteDocument } from "../deleteData.js";
import { fetchData } from "../fetchData.js";
import { updateData } from "../updateData.js";

export const addInfoValue = async (ctx) => {
  const userId = ctx.from.id;
  const text = ctx.message.text;
  const docId = (await fetchData()).find(
    (doc) => doc.username === ctx.from.username
  )?.docId;
  if (!ctx.userState || !docId) return;
  if (!ctx.userState[userId]) return;
  if (ctx.chat.type !== "private") return;

  switch (ctx.userState[userId]) {
    case "Игровой id":
      await updateData(docId, { id: `${text}` });
      ctx.reply(`id успешно добавлен!`);
      console.log(`id: ${text} успешно добавлен!`);
      delete ctx.userState[userId];
      break;

    case "Игровой ник":
      await updateData(docId, { nickName: `${text}` });
      ctx.reply(`ник успешно добавлен!`);
      console.log(`ник: ${text} успешно добавлен!`);
      delete ctx.userState[userId];
      break;

    case "Реальное имя":
      await updateData(docId, { realName: `${text}` });
      ctx.reply(`имя успешно добавлено!`);
      console.log(`имя: ${text} успешно добавлено!`);
      delete ctx.userState[userId];
      break;

    case "Возраст":
      await updateData(docId, { age: `${text}` });
      ctx.reply(`Возраст успешно добавлен!`);
      console.log(`возраст: ${text} успешно добавлен!`);
      delete ctx.userState[userId];
      break;
    case "Откуда ты":
      await updateData(docId, { areFrom: `${text}` });
      ctx.reply(`местоположение успешно добавлено!`);
      console.log(`местоположение: ${text} успешно добавлено!`);
      delete ctx.userState[userId];
      break;

    default:
      break;
  }
};

export const savePhoto = async (ctx) => {
  const reply = ctx.message.reply_to_message;
  const userId = ctx.from.id; // ID отправителя
  const chatId = ctx.chat.id; // ID чата
  const chatMember = await ctx.api.getChatMember(chatId, userId);
  const isAdmin = ["administrator", "creator"].includes(chatMember.status);
  if (reply && ctx.message.text === "/saved" && isAdmin) {
    const docId = (await fetchData()).find(
      (doc) => doc.username === reply.from.username
    )?.docId;
    if (docId) {
      await updateData(docId, { messageId: reply.message_id });
      await ctx.reply("Успешно сохранено!");
    }
  }
  if (ctx.message.text === "/saved" && !isAdmin)
    await ctx.reply("Ты не админ! Прекрати хулиганить!");
};

export const deleteDoc = async (ctx) => {
  const status = ctx.chatMember.new_chat_member.status;
  if (status === "left") {
    const user = ctx.chatMember.from;
    const userData = (await fetchData()).find(
      (doc) => doc.username === user.username
    );
    userData && (await deleteDocument("users", userData.docId));
    console.log(`Пользователь ${user.first_name} (${user.id}) покинул чат.`);
  }
};

export const newMembers = async (ctx) => {
  const newMembers = ctx.message.new_chat_members;
  for (const member of newMembers) {
    if (member.is_bot) {
      continue;
    }
    const name = member.first_name || "друг";

    await ctx.reply(
      `Приветствую, ${name}! Если хочешь получать напоминания - сохрани себя в базу /save_me и включи напоминание /remind`
    );
  }
};

export const newChatForBot = async (ctx) => {
  const chat = ctx.chat;
  const status = ctx.myChatMember.new_chat_member.status;

  if (status === "member") {
    console.log(`Бот добавлен в чат: ${chat.title} (ID: ${chat.id})`);
    await ctx.reply(`Спасибо, что добавили меня в группу "${chat.title}"!`);
  }
};

export const showUserInfo = async (ctx) => {
  if (ctx.from.is_bot) {
    return;
  }
  const username = ctx.message.text.slice(2);
  const userData = (await fetchData()).find(
    (user) => user.username === username
  );

  userData &&
    ctx.reply(
      Object.keys(userData)
        .filter(
          (key) => !["docId", "username", "remind", "messageId"].includes(key)
        )
        .map((key) => `${key}: ${userData[key]}`)
        .join("\n")
    );
};

export const showUserPhoto = async (ctx) => {
  if (ctx.from.is_bot) {
    return;
  }
  const username = ctx.message.text.slice(1);
  const userData = (await fetchData()).find(
    (user) => user.username === username
  );

  const originalChatId = ctx.chatIndex;
  const messageId = userData.messageId;

  if (messageId) {
    try {
      await ctx.api.copyMessage(ctx.chat.id, originalChatId, messageId, {
        reply_to_message_id: ctx.message.message_id,
      });
    } catch (error) {
      console.error("Ошибка при копировании сообщения:", error);
    }
  }
};
