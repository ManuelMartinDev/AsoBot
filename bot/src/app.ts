import { config } from "dotenv";
import fire from "./asotasks";
import { Task } from "./interfaces/tasks";
config();
import Telegraf, { Context } from "telegraf";
import { TelegrafContext } from "telegraf/typings/context";
import taskHelpers from "./helpers/tasks";
const { sendAsoTasks } = taskHelpers;
const bot: Telegraf<TelegrafContext> = new Telegraf(process.env.bot_token!);

bot.start(async (ctx: TelegrafContext) => {
  ctx.reply("Estoy recogiendo los datos , espera porfavor ....");
  const tasks: Array<Task> = await fire();
  await sendAsoTasks(tasks, ctx);
});

bot.launch();
