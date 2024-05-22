import { Client } from "@notionhq/client"
import dotenv from "dotenv";
dotenv.config();
import {getDatesStartToLast} from './date.js'

const notion = new Client({ auth: process.env.NOTION_KEY })
const databaseId = '0c0bc08d948040dd97d2b0d7b2d17cfc'
const dateList = getDatesStartToLast('2024-05-26','2024-06-30')

async function addItem() {
  dateList.forEach(async element=>{

  try {
    const response = await notion.pages.create({
        parent: { database_id: databaseId },

        properties: {
            "Title": {
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
        "Date": {
            "date": {
            "start": element
            }
          }
      },
    })
    // console.log(response)
    // console.log("Success! Entry added.")
  } catch (error) {
    console.error(error.body)
  }
}  

  )
}

addItem()