export const answer = async (ctx) => {
  const answer = ctx.match[1];
  ctx.userState[ctx.from.id] = answer;

  await ctx.answerCallbackQuery(`Вы выбрали: ${answer}`);
  await ctx.reply(`Отправь в сообщении "${answer}"`);
};
