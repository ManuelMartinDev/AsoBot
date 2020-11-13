import { Task } from "../interfaces/tasks";
import { TelegrafContext } from "telegraf/typings/context";

const sendAsoTasks = async (Tasks: Array<Task>, ctx: TelegrafContext) => {
  for (let i = 0; i < Tasks.length; i++) {
    const { day, month, year } = Tasks[i].date;
    await ctx.reply(`La tarea ${Tasks[i].name}
	se entrega en el ${day} de ${month} del ${year}
	`);
  }
};

export default {
  sendAsoTasks,
};
