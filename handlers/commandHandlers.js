import { updateData } from "../updateData.js";
import { addData } from "../addData.js";
import { checkUser, autoDeleteMessage } from "../utilits.js";
import { fetchData, fetchBotMessagesField } from "../fetchData.js";
import { InlineKeyboard } from "grammy";

export const remind = async (ctx) => {
  const chatId = ctx.chat.id;
  let messageId = null;
  const userData = await fetchData(ctx.from.username);
  if (!userData) {
    const { message_id } = await ctx.reply("Тебя нет в базе!");
    messageId = message_id;
    return;
  }
  if (userData?.remind) {
    await updateData("users", userData.docId, { remind: false });
    const { message_id } = await ctx.reply(
      `${ctx.from.first_name}, ты больше не будешь получать напоминания!`
    );
    messageId = message_id;
  } else if (!userData.remind) {
    await updateData("users", userData.docId, { remind: true });
    const { message_id } = await ctx.reply(
      `${ctx.from.first_name}, теперь ты будешь получать напоминания!`
    );
    messageId = message_id;
  }
  setTimeout(() => {
    autoDeleteMessage(ctx.bot, chatId, messageId);
  }, 30000);
};

export const reminderTimes = async (ctx) => {
  const user = ctx.from;
  ctx.userState[user.id] = "reminderTimes";
  const username = user.username || null;
  const isExist = await checkUser(username);
  const question = "Выбери нужное время";
  const options = ["4:45", "10:45", "16:45", "22:45"];

  const keyboard = new InlineKeyboard();
  options.forEach((option) => {
    keyboard.text(option, `answer:${option}`).row();
  });
  if (!isExist) {
    const { message_id, chat } = await ctx.reply(
      `Тебя еще нет в базе! Жми /save_me`
    );
    setTimeout(() => {
      autoDeleteMessage(ctx.bot, chat.id, message_id);
    }, 30000);
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
    const { message_id, chat } = await ctx.reply(
      `Мы можем сделать это в личном диалоге!`
    );

    setTimeout(() => {
      autoDeleteMessage(ctx.bot, chat.id, message_id);
    }, 30000);
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
  let messageId = null;
  let chatId = null;

  if (isExist) {
    const { message_id, chat } = await ctx.reply(`Ты уже добавлен, ${name}!`);
    messageId = message_id;
    chatId = chat.id;
  } else if (!isExist && username) {
    const { message_id, chat } = await ctx.reply(
      `Принято, ${name}! Теперь ты один из нас!`
    );
    messageId = message_id;

    await addData(username);
  } else if (!isExist) {
    const helpMessageId = await fetchBotMessagesField("messageId");
    const { message_id, chat } = await ctx.reply(
      `Не вижу твоё имя пользователя, ${name}!`
    );
    messageId = message_id;
    chatId = chat.id;
    const originalChatId = ctx.chat.id;

    if (helpMessageId) {
      try {
        const { message_id } = await ctx.api.copyMessage(
          ctx.chat.id,
          originalChatId,
          helpMessageId
        );
        setTimeout(() => {
          autoDeleteMessage(ctx.bot, chat.id, message_id);
        }, 30000);
      } catch (error) {
        console.error("Ошибка при копировании сообщения:", error);
      }
    }
  }

  setTimeout(() => {
    autoDeleteMessage(ctx.bot, chatId, messageId);
  }, 30000);
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
    const { message_id, chat } = await ctx.reply(
      `Тебя еще нет в базе! Жми /save_me`
    );
    delete ctx.userState[user.id];
    setTimeout(() => {
      autoDeleteMessage(ctx.bot, chat.id, message_id);
    }, 30000);
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
    const { message_id, chat } = await ctx.reply(
      `Мы можем сделать это в личном диалоге!`
    );
    setTimeout(() => {
      autoDeleteMessage(ctx.bot, chat.id, message_id);
    }, 30000);
  }
};

export const start = async (ctx) => {
  let messageId = null;
  let chatId = null;
  const { message_id, chat } = await ctx.reply(
    `Привет. Я - бот. Меня зовут Анна Сергеевна. Я буду напоминать об АВ всяким зайкам, которые потерялись во времени. Проверь, находишься ли ты в моей базе данных /save_me`
  );
  messageId = message_id;
  chatId = chat.id;
  setTimeout(() => {
    autoDeleteMessage(ctx.bot, chatId, messageId);
  }, 30000);
};
