import { Client } from "@notionhq/client";
import dotenv from "dotenv";
import { getDatesStartToLast } from "./date.js";
dotenv.config();

const notion = new Client({ auth: process.env.NOTION_KEY });
const databaseId = "8e70205e92e747b6b16d47583c4bd62f";
const dateList = getDatesStartToLast("2024-05-26", "2024-06-30");

async function addItem() {
  dateList.forEach(async (element) => {
    try {
      const response = await notion.pages.create({
        parent: { database_id: databaseId },
        properties: {
          Title: {
            title: [
              {
                text: {
                  content: element,
                },
              },
            ],
          },
          // "Today User": {
          //     number: 100,
          // },
          Date: {
            date: {
              start: element,
            },
          },
        },
      });
      // console.log(response)
      // console.log("Success! Entry added.")
    } catch (error) {
      console.error(error.body);
    }
  });
}

addItem();
