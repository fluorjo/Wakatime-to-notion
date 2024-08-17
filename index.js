import { Client } from "@notionhq/client";
import dotenv from "dotenv";
import request from "request";
dotenv.config();

const wakatimeApiKey = process.env.WAKATIME_API_KEY;
const weekNumber = () => {
  currentdate = new Date();
  var oneJan = new Date(currentdate.getFullYear(), 0, 1);
  var numberOfDays = Math.floor((currentdate - oneJan) / (24 * 60 * 60 * 1000));
  return Math.ceil((currentdate.getDay() + 1 + numberOfDays) / 7);
};

const getMonday = (d) => {
  d = new Date(d);
  var day = d.getDay(),
    diff = d.getDate() - day + (day == 0 ? -6 : 1); 
  return new Date(d.setDate(diff));
};

const today = new Date();
const monday = getMonday(today);

const todayString = today.toISOString();
const mondayString = monday.toISOString();

const startDate = mondayString.split("T")[0];
const endDate = todayString.split("T")[0];

// const wakaURL = `https://wakatime.com/api/v1/users/current/summaries?start=${startDate}&end=${endDate}&api_key=${wakatimeApiKey}`;
const wakaURL = `https://wakatime.com/api/v1/users/current/summaries?start=${endDate}&end=${endDate}&api_key=${wakatimeApiKey}`;

//-------------//
const notion = new Client({ auth: process.env.NOTION_KEY });
const day_db= process.env.DAY_DB_ID;
// console.log(startDate);
// console.log(endDate);
const project_db= process.env.PROJECT_DB_ID;

async function main() {
  request(wakaURL, async function (err, res, body) {
    const jsonBody = JSON.parse(body);
    const day_cumulative_total = jsonBody.cumulative_total.digital;
    const startDayNTime = jsonBody.start;
    const startDay = startDayNTime.substr(0, 10);
    const endDayNTime = jsonBody.end;
    const endDay = endDayNTime.substr(0, 10);
    console.log(endDay)
    // console.log(jsonBody.data[0])
    // ---------------------날짜별 ----------------------//
    try {
      const response = await notion.pages.create({
        parent: { database_id: day_db },
        properties: {
          title: {
            title: [
              {
                text: {
                  content: endDay,
                },
              },
            ],
          },

          total_time: {
            rich_text: [
              {
                text: {
                  content: day_cumulative_total,
                },
              },
            ],
          },
        },
      });
    } catch (error) {
      console.error(error.body);
    }

    // 활동별 ---------------------------
    for (let project in jsonBody.data[0].projects) {
      const projectName = jsonBody.data[0].projects[project].name;
      const time = jsonBody.data[0].projects[project].digital;
      try {
        const response = await notion.pages.create({
          parent: { database_id: project_db},
          properties: {
            Project: {
              title: [
                {
                  text: { 
                    content: projectName,
                  },
                },
              ],
            },

            Time: {
              rich_text: [
                {
                  text: {
                    content: time,
                  },
                },
              ],
            },
            Date: {
              date: {
                start: endDay,
              },
            },
          },
        });
      } catch (error) {
        console.error(error.body);
      }
    }
    // 기준
  });
}
main();
