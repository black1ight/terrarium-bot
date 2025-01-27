import { fetchData } from "./fetchData.js";
import schedule from "node-schedule";

export const checkUser = async (username) => {
  const usersData = await fetchData();
  return usersData.find((user) => user.username === username) ? true : false;
};

export const sendMessage = async (bot, chatId, text) => {
  try {
    const sentMessage = await bot.api.sendMessage(chatId, text);
  } catch (error) {
    console.error("Ошибка при отправке", error);
  }
};

export const scheduleDailyMessages = async (bot) => {
  const chatId = process.env.CHAT_ID;
  const times = ["4:45", "10:45", "16:45", "22:45"];
  const usersData = await fetchData();
  times.forEach(async (time) => {
    const usersList = usersData
      .filter((user) => user.reminderTimes?.includes(time))
      .map((el) => el.username);
    const messageText = `${usersList.map((user) =>
      usersList[0] !== user ? " " + "@" + user : "@" + user
    )} АВ начнется через 15 минут! Выставь отряд!`;

    const [hour, minute] = time.split(":").map(Number);

    schedule.scheduleJob({ hour, minute }, () => {
      console.log(`Отправка сообщения в ${time}`);
      sendMessage(bot, chatId, messageText);
    });
  });
};
