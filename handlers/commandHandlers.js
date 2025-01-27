import { updateData } from "../updateData.js";
import { addData } from "../addData.js";
import { checkUser } from "../utilits.js";
import { fetchData } from "../fetchData.js";
import { InlineKeyboard } from "grammy";

export const remind = async (ctx) => {
  const userData = (await fetchData()).find(
    (doc) => doc.username === ctx.from.username
  );

  if (!userData) {
    await ctx.reply("Тебя нет в базе!");
    return;
  }

  if (userData?.remind) {
    await updateData(userData.docId, { remind: false });
    await ctx.reply(
      `${ctx.from.first_name}, ты больше не будешь получать напоминания!`
    );
  } else if (!userData.remind) {
    await updateData(userData.docId, { remind: true });
    await ctx.reply(
      `${ctx.from.first_name}, теперь ты будешь получать напоминания!`
    );
  }
};

export const getChatId = async (ctx) => {
  await ctx.reply(`Chat ID: ${ctx.chat.id}`);
};

export const saveToDb = async (ctx) => {
  const user = ctx.from;
  const name = user.first_name || "друг";
  const username = user.username || null;
  const isExist = await checkUser(username);

  isExist && (await ctx.reply(`Ты уже добавлен, ${name}!`));
  !isExist && username
    ? (await ctx.reply(`Принято, ${name}! Теперь ты один из нас!`)) &&
      (await addData(username))
    : !isExist && (await ctx.reply(`Не вижу твоё имя пользователя, ${name}!`));
};

export const addInfo = async (ctx) => {
  ctx.userState[ctx.from.id] = "add_info";
  const user = ctx.from;
  const username = user.username || null;
  const isExist = await checkUser(username);
  const question = "Выбери что нужно добавить";
  const options = [
    "Игровой id",
    "Игровой ник",
    "Реальное имя",
    "Возраст",
    "Откуда ты",
  ];

  const keyboard = new InlineKeyboard();
  options.forEach((option) => {
    keyboard.text(option, `answer:${option}`).row();
  });

  if (!isExist) {
    await ctx.reply(`Тебя еще нет в базе! Жми /save_me`);
    delete ctx.userState[user.id];
    return;
  }

  if (ctx.chat.type === "private") {
    try {
      await ctx.bot.api.sendMessage(user.id, question, {
        reply_markup: keyboard,
      });
      console.log("Вопрос отправлен пользователю!");
    } catch (error) {
      console.error("Ошибка при отправке вопроса:", error);
    }
  } else {
    await ctx.reply(`Мы можем сделать это в личном диалоге!`);
  }
};

export const start = async (ctx) => {
  await ctx.reply(
    `Привет. Я - бот. Меня зовут Анна Сергеевна. Я буду напоминать об АВ всяким зайкам, которые потерялись во времени. Проверь, находишься ли ты в моей базе данных /save_me`
  );
};
