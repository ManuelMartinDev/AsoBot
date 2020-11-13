import { Browser, launch, LaunchOptions, Page } from "puppeteer";
import { RawTask, FormatedDate, Task } from "./interfaces/tasks";
import { config } from "dotenv";
config();
const puppeteer_options: LaunchOptions = {
  headless: false,
  slowMo: 450,
  defaultViewport: { width: 1920, height: 1080 },
  ignoreDefaultArgs: ["--enable-automation"],
};

function login(page: Page) {
  // This function will set my moodle credentials and click on login
  return page.evaluate(
    ([moodsername, moodsword]: Array<string>) => {
      const username: HTMLInputElement | null = document.getElementById(
        "username"
      ) as HTMLInputElement;
      const password: HTMLInputElement | null = document.getElementById(
        "password"
      ) as HTMLInputElement;
      if (!username || !password === null) {
        return;
      }
      username.value = moodsername;
      password.value = moodsword;
      const button: HTMLInputElement | null = document.querySelector(
        "[type='submit']"
      );
      if (!button) {
        return;
      }
      button.click();
    },
    [process.env.moodle_user!, process.env.moodle_password!]
  );
}

async function getTasksInfo(page: Page): Promise<Array<Task>> {
  //The function that will get every ASO TASK with the information
  const dates: Array<Task> = [];
  const links: Array<string> = await page.evaluate(function () {
    const a_links: Array<string> = [];
    const links: NodeListOf<Element> = document.querySelectorAll(".assign");
    links.forEach((link: Element) => {
      a_links.push(link.querySelector("a")!.attributes[2]!.value);
    });

    return a_links;
  });

  async function getTimeLine(page: Page): Promise<Task> {
    //This function will get the task name and raw date
    const timeline: RawTask = await page.evaluate(
      (): RawTask => {
        //The element that contain the times in the Moodle page
        const times: HTMLElement = document.getElementsByClassName(
          "cell c1 lastcol"
        )![2] as HTMLElement;
        //The element that contain the name in the Moodle page
        const namecontainer: HTMLElement | null = document.getElementById(
          "intro"
        );
        const name = namecontainer!.getElementsByTagName("p")[0].textContent!;
        return {
          name: name,
          time: times.innerText,
        };
      }
    );

    const arraydate: Array<String> = timeline.time.split(",");
    const formatedDate: FormatedDate = {
      day: arraydate[1].split(" ")[1],
      month: arraydate[1].split(" ")[2],
      year: arraydate[1].split(" ")[3],
    };
    const TaskInfo: Task = {
      name: timeline.name,
      date: formatedDate,
    };

    return TaskInfo;
  }
  for (let i = 0; i < links.length; i++) {
    await Promise.all([
      page.goto(links[i]),
      page.waitForNavigation({ waitUntil: "domcontentloaded" }),
    ]);
    const TaskInfoObject: Task = await getTimeLine(page);
    dates.push(TaskInfoObject);
  }

  return dates;
}
async function fire(): Promise<Array<Task>> {
  try {
    const browser: Browser = await launch(puppeteer_options);
    const page: Page = await browser.newPage();
    await page.goto(
      "https://educacionadistancia.juntadeandalucia.es/centros/granada/course/view.php?id=3734"
    );
    //I wait for the login and the load of the dom
    await Promise.all([
      login(page),
      page.waitForNavigation({ waitUntil: "domcontentloaded" }),
    ]);
    //Then I call my function to get the tasks info
    const AllTasksInfo: Array<Task> = await getTasksInfo(page);
    console.log(AllTasksInfo);
    browser.close();
    return AllTasksInfo;
  } catch (e) {
    console.log(e);
    throw new Error(e);
  }
}

export default fire;
