import dotenv from "dotenv";
dotenv.config();
import schedule from "node-schedule";
import { Bot } from "grammy";
import { fetchData } from "./fetchData.js";

const bot = new Bot(process.env.BOT_KEY);
const chatId = process.env.CHAT_ID;
let threadIndex = 47;

const usersList = await fetchData();

bot.command("getid", async (ctx) => {
  const chatId = ctx.chat.id;
  await ctx.reply(`Chat ID: ${chatId}`);
});

bot.command("getthreadid", async (ctx) => {
  const threadId = ctx.message.message_thread_id;
  if (threadId) {
    threadIndex = threadId;
    await ctx.reply(`ID темы: ${threadId}`);
  } else {
    await ctx.reply("Команда не запущена в теме.");
  }
});

bot.command("start", async (ctx) => {
  await ctx.reply(`Оставь свой паспорт, всяк сюда входящий... ${threadIndex}`);
});

async function sendMessage(chatId, threadIndex, text) {
  try {
    const sentMessage = await bot.api.sendMessage(chatId, text, {
      message_thread_id: threadIndex,
    });
    console.log(`Сообщение "${text}" отправлено.`);
  } catch (error) {
    console.error("Ошибка при отправке", error);
  }
}

function scheduleDailyMessages() {
  const times = ["4:45", "10:45", "16:45", "22:45"];
  const messageText = `${usersList.map((user) =>
    user[0] !== user ? " " + user : user
  )} Это запланированное сообщение!`;

  times.forEach((time) => {
    const [hour, minute] = time.split(":").map(Number);

    schedule.scheduleJob({ hour, minute }, () => {
      console.log(`Отправка сообщения в ${time}`);
      sendMessage(chatId, threadIndex, messageText);
    });
  });
}

scheduleDailyMessages();

bot.start();
