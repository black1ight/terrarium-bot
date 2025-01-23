import dotenv from "dotenv";
dotenv.config();
import schedule from "node-schedule";
import { Bot, InlineKeyboard } from "grammy";
import { fetchData } from "./fetchData.js";
import { addData } from "./addData.js";
import { deleteDocument } from "./deleteData.js";
import { updateData } from "./updateData.js";

const bot = new Bot(process.env.BOT_KEY);

// НАПИСАТЬ ЛОГИКУ ВКЛ/ВЫКЛ НАПОМИНАНИЯ

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
let chatId = process.env.CHAT_ID;
// let threadIndex = 47;
let userState = {};

const usersList = (await fetchData()).map((user) => user.username);

const checkUser = async (username) => {
  const usersData = await fetchData();

  return usersData.find((user) => user.username === username) ? true : false;
};

bot.command("getid", async (ctx) => {
  await ctx.reply(`Chat ID: ${ctx.chat.id}`);
});

bot.command("save_me", async (ctx) => {
  const user = ctx.from;
  const name = user.first_name || "друг";
  const username = user.username || null;
  const isExist = await checkUser(username);

  isExist && (await ctx.reply(`Ты уже добавлен, ${name}!`));
  !isExist && username
    ? (await ctx.reply(`Принято, ${name}! Теперь ты один из нас!`)) &&
      (await addData(username))
    : !isExist && (await ctx.reply(`Не вижу твоё имя пользователя, ${name}!`));
});

// bot.command("remove_me", async (ctx) => {
//   const user = ctx.from;
//   const name = user.first_name || "друг";
//   const username = user.username || null;
//   const isExist = await checkUser(username);

//   if (isExist) {
//     const docId = (await fetchData()).find(
//       (doc) => doc.username === user.username
//     ).id;
//     docId && (await deleteDocument("users", docId));
//     await ctx.reply(`${name} был успешно удалён!`);
//   } else {
//     await ctx.reply(`А тебя и не было, ${name}!`);
//   }
// });

bot.command("add_info", async (ctx) => {
  userState[ctx.from.id] = "add_info";
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

  if (isExist) {
    try {
      const pollMessage = await bot.api.sendMessage(user.id, question, {
        reply_markup: keyboard,
      });
      console.log("Вопрос отправлен пользователю!");
    } catch (error) {
      console.error("Ошибка при отправке вопроса:", error);
    }
  } else {
    await ctx.reply(`Тебя еще нет в базе! Жми /save_me`);
    delete userState[user.id];
  }
});

bot.callbackQuery(/answer:(.+)/, async (ctx) => {
  const answer = ctx.match[1]; // Извлекаем выбранный вариант
  userState[ctx.from.id] = answer;
  console.log(userState);

  await ctx.answerCallbackQuery(`Вы выбрали: ${answer}`);
  await ctx.reply(`Отправь в сообщении "${answer}"`);
});

bot.on("message:new_chat_members", async (ctx) => {
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
});

bot.command("remind", async (ctx) => {
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
});

bot.on("message", async (ctx) => {
  const userId = ctx.from.id;
  const text = ctx.message.text;
  const docId = (await fetchData()).find(
    (doc) => doc.username === ctx.from.username
  )?.docId;
  if (!userState || !docId) return;
  if (!userState[userId]) return;

  switch (userState[userId]) {
    case "Игровой id":
      await updateData(docId, { id: `${text}` });
      ctx.reply(`id успешно добавлен!`);
      console.log(`id: ${text} успешно добавлен!`);
      delete userState[userId];
      break;

    case "Игровой ник":
      await updateData(docId, { nickName: `${text}` });
      ctx.reply(`ник успешно добавлен!`);
      console.log(`ник: ${text} успешно добавлен!`);
      delete userState[userId];
      break;

    case "Реальное имя":
      await updateData(docId, { realName: `${text}` });
      ctx.reply(`имя успешно добавлено!`);
      console.log(`имя: ${text} успешно добавлено!`);
      delete userState[userId];
      break;

    case "Возраст":
      await updateData(docId, { age: `${text}` });
      ctx.reply(`Возраст успешно добавлен!`);
      console.log(`возраст: ${text} успешно добавлен!`);
      delete userState[userId];
      break;
    case "Откуда ты":
      await updateData(docId, { areFrom: `${text}` });
      ctx.reply(`местоположение успешно добавлено!`);
      console.log(`местоположение: ${text} успешно добавлено!`);
      delete userState[userId];
      break;

    default:
      break;
  }
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

// LEFT USER
bot.on("chat_member", async (ctx) => {
  const status = ctx.chatMember.new_chat_member.status;
  if (status === "left") {
    const user = ctx.chatMember.from;
    const userData = (await fetchData()).find(
      (doc) => doc.username === user.username
    );
    userData && (await deleteDocument("users", userData.docId));
    console.log(`Пользователь ${user.first_name} (${user.id}) покинул чат.`);
  }
});

bot.command("test", async (ctx) => {
  await ctx.reply("Бот работает!");
});

bot.command("start", async (ctx) => {
  await ctx.reply(
    `Привет. Я - бот. Меня зовут Анна Сергеевна. Я буду напоминать об АВ всяким зайкам, которые потерялись во времени. Проверь, находишься ли ты в моей базе данных /save_me`
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
