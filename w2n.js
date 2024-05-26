import dotenv from "dotenv";
dotenv.config();
import request from "request";
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

const main = async () => {
  request(wakaURL, function (err, res, body) {
    const jsonBody = JSON.parse(body);
    console.log(jsonBody);
        for (let project in jsonBody.data[0].projects) {
            const projectName = jsonBody.data[0].projects[project].name;
            const time = jsonBody.data[0].projects[project].text;
            console.log(projectName);
        }
  });
};
main();
