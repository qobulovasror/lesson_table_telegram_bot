const config = require('config')
const { Telegraf } = require('telegraf');
const { google } = require('googleapis');
const cache = require('memory-cache')

// Replace with your own values
const BOT_TOKEN = config.get('newToken');
const SHEET_ID = config.get('SHEET_ID');
let RANGE_NAME = '3 kurs!B143:G143';

// Create a new Telegram bot
const bot = new Telegraf(BOT_TOKEN);

async function getLessTable(tableRangeName){
  try {
    // Load the Google Sheets API credentials
    const auth = new google.auth.GoogleAuth({
      keyFile: './innate-booking-381602-74ef275e21b5.json',
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly']
    });

    // Create a new Google Sheets API client
    const sheets = google.sheets({ version: 'v4', auth });

    // Retrieve the data from the Google Sheets spreadsheet
    const result = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: tableRangeName,
    });

    // Send the data to the user via Telegram
    const data = result.data.values;
    let message = data[0][0]+'\n';
    for (let i = 0; i < data.length; i++) {
      message+= `${(i+1)}) ⏰(${data[i][1]}) | 📘 ${data[i][2]} | 🏢${data[i][5]} \n`;
    }
    // const message = data.map(row => row.join('|')).join('\n');
    return message;
  } catch (err) {
    console.error(err);
    return 'An error occurred while fetching the data';
  }
}
// Handle the /start command
bot.start(async(ctx) => {
  if(ctx.message.from.id===492277763){
    return ctx.reply('Welcome to the Lesson table bot!\nSend the /table command to get the table');
  }
  await ctx.telegram.leaveChat(ctx.message.chat.id);
  await ctx.leaveChat();
});

bot.hears('/table', async(ctx) => {
  if(ctx.message.from.id!==492277763){
    return ctx.deleteMessage(ctx.message.message_id);
  }
  const weekDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const today = new Date();
  const weekDayName = weekDays[today.getDay()];
  
  const data = cache.get(weekDayName);
  if(data){
    ctx.reply(`${data}`);
    return;
  }

  switch (weekDayName) {
      case 'Sunday': 
        ctx.reply(`Bugun 'Yakshanba' dam olish kuni`);
        return;
      case 'Monday': RANGE_NAME = '3 kurs!B145:G148'; break;
      case 'Tuesday': RANGE_NAME = '3 kurs!B149:G152'; break;
      case 'Wednesday': 
        ctx.reply(`Bugun 'Chorshanba' malakaviy amaliyot kuni`);
        return;
      case 'Thursday': 
        ctx.reply(`Bugun 'Payshanba' malakaviy amaliyot kuni`);
        return;
      case 'Friday': RANGE_NAME = '3 kurs!B161:G164'; break;
      case 'Saturday': RANGE_NAME = '3 kurs!B165:G168'; break;
      default: RANGE_NAME = '3 kurs!B144:G168'; break;
  }
  try {
    // Load the Google Sheets API credentials
    const auth = new google.auth.GoogleAuth({
      keyFile: './innate-booking-381602-74ef275e21b5.json',
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly']
    });

    // Create a new Google Sheets API client
    const sheets = google.sheets({ version: 'v4', auth });

    // Retrieve the data from the Google Sheets spreadsheet
    const result = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: RANGE_NAME,
    });

    // Send the data to the user via Telegram
    const data = result.data.values;
    let message = 'Bugun '+data[0][0]+'\n';
    for (let i = 0; i < data.length; i++) {
      message+= `${(i+1)}) ⏰(${data[i][1]}) | 📘 ${data[i][2]} | 🏢${data[i][5]} \n`;
    }
    // const message = data.map(row => row.join('|')).join('\n');

    //save cache 
    cache.put(weekDayName, message, 60*60*1000)

    ctx.reply(`${message}`);
  } catch (err) {
    console.error(err);
    ctx.reply('An error occurred while fetching the data');
  }
});

bot.hears('/dushanba', async(ctx) => {
  const result = await getLessTable('3 kurs!B145:G148');
  if(result)
    ctx.reply(result)
  else
    ctx.reply("error")
})
bot.hears('/seshanba', async(ctx) => {
  const result = await getLessTable('3 kurs!B149:G152');
  if(result)
    ctx.reply(result)
  else
    ctx.reply("error")
})
bot.hears('/chorshanba', (ctx) => {
  ctx.reply(`'Chorshanba' malakaviy amaliyot kuni`);
})
bot.hears('/payshanba', (ctx) => {
  ctx.reply(`'Chorshanba' malakaviy amaliyot kuni`);
})
bot.hears('/juma', async(ctx) => {
  const result = await getLessTable('3 kurs!B161:G164');
  if(result)
    ctx.reply(result)
  else
    ctx.reply("error")
})
bot.hears('/shanba', async(ctx) => {
  const result = await getLessTable('3 kurs!B165:G168');
  if(result)
    ctx.reply(result)
  else
    ctx.reply("error")
})
bot.hears('/yakshanba', (ctx) => {
  ctx.reply(`'Yakshanba' dam olish kuni`);
})


bot.on('message', (ctx) => {
  ctx.reply(`Please send the /table command to get the table\n Jadvalni olish uchun /table komandasini yuboring`);
})

// Start the bot
bot.launch();