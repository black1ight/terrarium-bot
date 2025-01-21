import dotenv from "dotenv";
dotenv.config();
import schedule from "node-schedule";
import { Bot } from "grammy";
import { fetchData } from "./fetchData.js";
import { addData } from "./addData.js";
import { deleteDocument } from "./deleteData.js";

const bot = new Bot(process.env.BOT_KEY);

bot.api.setMyCommands([
  {
    command: "start",
    description: "запуск бота",
  },
  {
    command: "remind_me",
    description: "присоединиться к напоминанию",
  },
]);
let chatId = process.env.CHAT_ID;
// let threadIndex = 47;

const usersList = (await fetchData()).map((user) => user.username);

const checkUser = async (username) => {
  const usersData = await fetchData();

  return usersData.find((user) => user.username === username) ? true : false;
};

bot.command("getid", async (ctx) => {
  await ctx.reply(`Chat ID: ${ctx.chat.id}`);
});

bot.command("remind_me", async (ctx) => {
  const user = ctx.from;
  const name = user.first_name || "друг";
  const username = user.username || null;
  const isExist = await checkUser(username);

  isExist && (await ctx.reply(`Ты уже добавлен, ${name}!`));
  !isExist && username
    ? (await ctx.reply(`Принято, ${name}!`)) && (await addData(username))
    : !isExist && (await ctx.reply(`Не вижу твоё имя пользователя, ${name}!`));
});

// bot.command("getthreadid", async (ctx) => {
//   const threadId = ctx.message.message_thread_id;
//   if (threadId) {
//     threadIndex = threadId;
//     await ctx.reply(`ID темы: ${threadId}`);
//   } else {
//     await ctx.reply("Команда не запущена в теме.");
//   }
// });

bot.on("message:new_chat_members", async (ctx) => {
  const newMembers = ctx.message.new_chat_members;
  for (const member of newMembers) {
    if (member.is_bot) {
      continue;
    }
    const name = member.first_name || "друг";
    const username = member.username || null;
    username && (await addData(username));
    await ctx.reply(
      `Приветствую, ${name}! Сдай паспорт и веди себя хорошо! Теперь ты один из нас...`
    );
    !username &&
      (await ctx.reply(
        `Если хочешь получать напоминания об АВ - укажи в профиле имя пользователя и напиши мне /remind_me.`
      ));
  }
});

// DELETE USER FROM DB
bot.on("chat_member", async (ctx) => {
  const status = ctx.chatMember.new_chat_member.status;
  if (status === "left") {
    const user = ctx.chatMember.from;
    const docId = (await fetchData()).find(
      (doc) => doc.username === user.username
    ).id;
    docId && (await deleteDocument("users", docId));
    console.log(`Пользователь ${user.first_name} (${user.id}) покинул чат.`);
  }
});

bot.command("start", async (ctx) => {
  await ctx.reply(
    `Привет. Я - бот. Меня зовут Анна Сергеевна. Я буду напоминать об АВ всяким зайкам, которые потерялись во времени. Проверь, находишься ли ты в моей базе данных /remind_me`
  );
});

// SEND MESSAGE
const sendMessage = async (chatId, text) => {
  try {
    const sentMessage = await bot.api.sendMessage(chatId, text);
    console.log(`Сообщение "${text}" отправлено.`);
  } catch (error) {
    console.error("Ошибка при отправке", error);
  }
};

const scheduleDailyMessages = () => {
  const times = ["4:45", "10:45", "16:45", "22:45"];
  const messageText = `${usersList.map((user) =>
    user[0] !== user ? " " + "@" + user : "@" + user
  )} АВ начнется через 15 минут! Выставь отряд!`;

  times.forEach((time) => {
    const [hour, minute] = time.split(":").map(Number);

    schedule.scheduleJob({ hour, minute }, () => {
      console.log(`Отправка сообщения в ${time}`);
      sendMessage(chatId, messageText);
    });
  });
};

scheduleDailyMessages();

bot.start({
  allowed_updates: [
    "chat_member",
    "message",
    "edited_message",
    "callback_query",
  ],
});
