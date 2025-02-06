import { arrayRemove, arrayUnion } from "firebase/firestore";
import { fetchData } from "../fetchData.js";
import { updateData } from "../updateData.js";

export const answer = async (ctx) => {
  const answer = ctx.match[1];
  switch (ctx.userState[ctx.from.id]) {
    case "add_info":
      ctx.userState[ctx.from.id] = answer;
      await ctx.answerCallbackQuery(`Вы выбрали: ${answer}`);
      await ctx.reply(`Отправь в сообщении "${answer}"`);
      break;
    case "reminderTimes":
      const { docId, reminderTimes } = await fetchData(ctx.from.username);
      if (reminderTimes?.find((el) => el === answer)) {
        await updateData("users", docId, {
          reminderTimes: arrayRemove(answer),
        });
        await ctx.answerCallbackQuery(`Вы выбрали: ${answer}`);
        await ctx.reply(`Время "${answer}" успешно удалено!`);
      } else {
        await updateData("users", docId, { reminderTimes: arrayUnion(answer) });
        await ctx.answerCallbackQuery(`Вы выбрали: ${answer}`);
        await ctx.reply(`Время "${answer}" успешно добавлено!`);
      }
      break;
  }
};
