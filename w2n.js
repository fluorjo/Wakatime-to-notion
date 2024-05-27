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
    diff = d.getDate() - day + (day == 0 ? -6 : 1); // adjust when day is sunday
  return new Date(d.setDate(diff));
};

const today = new Date();
const monday = getMonday(today);

const todayString = today.toISOString();
const mondayString = monday.toISOString();

const startDate = mondayString.split("T");
const endDate = todayString.split("T");

const wakaURL = `https://wakatime.com/api/v1/users/current/summaries?start=${startDate[0]}&end=${endDate[0]}&api_key=${wakatimeApiKey}`;
//-------------//
const notion = new Client({ auth: process.env.NOTION_KEY });
const databaseId = "8e70205e92e747b6b16d47583c4bd62f";
const dayDB_ID = "0d71ede4962f4af28440bf5bd896ff08";

async function main() {
  request(wakaURL, async function (err, res, body) {
    const jsonBody = JSON.parse(body);
    // console.log(jsonBody);
    const day_cumulative_total = jsonBody.cumulative_total.digital;
    const startDayNTime = jsonBody.start;
    // const startDay=startDayNTime.replaceAll('-','. ').substr(0,12)+'.'
    const startDay = startDayNTime.substr(0, 10);
    console.log(startDay);
    // ---------------------날짜별 ----------------------//

    try {
      const response = await notion.pages.create({
        parent: { database_id: dayDB_ID },
        properties: {
          title: {
            title: [
              {
                text: {
                  content: startDay,
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
      // console.log(response)
      // console.log("Success! Entry added.")
    } catch (error) {
      console.error(error.body);
    }

    // 활동별 ---------------------------
    for (let project in jsonBody.data[0].projects) {
      const projectName = jsonBody.data[0].projects[project].name;
      const time = jsonBody.data[0].projects[project].digital;
      console.log(projectName);
      try {
        const response = await notion.pages.create({
          parent: { database_id: databaseId },
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
                start: startDay,
              },
            },
          },
        });
        // console.log(response)
        // console.log("Success! Entry added.")
      } catch (error) {
        console.error(error.body);
      }
    }
  });
}
main();
