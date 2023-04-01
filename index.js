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
  if(ctx.message.from.username==="Qobulov_Asror"){
    return ctx.reply('Welcome to the Lesson table bot!\nSend the /table@dars_jadvali_306_bot command to get the table');
  }
  if(ctx.chat.type !== 'supergroup')
    return ctx.reply('Error: This bot can only be run by the bot creator');
});

bot.hears('/table@dars_jadvali_306_bot', async(ctx) => {
  if(ctx.chat.type !== 'supergroup' )
    if(ctx.message.from.username!=="Qobulov_Asror")
      return ctx.deleteMessage(ctx.message.message_id);

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

bot.hears('/dushanba@dars_jadvali_306_bot', async(ctx) => {
  if(ctx.chat.type !== 'supergroup')
    if(ctx.message.from.username!=="Qobulov_Asror")
      return ctx.reply('Error: This bot can only be run by the bot creator');
  const result = await getLessTable('3 kurs!B145:G148');
  if(result)
    ctx.reply(result)
  else
    ctx.reply("error")
})
bot.hears('/seshanba@dars_jadvali_306_bot', async(ctx) => {
  if(ctx.chat.type !== 'supergroup')
    if(ctx.message.from.username!=="Qobulov_Asror")
      return ctx.reply('Error: This bot can only be run by the bot creator');
  const result = await getLessTable('3 kurs!B149:G152');
  if(result)
    ctx.reply(result)
  else
    ctx.reply("error")
})
bot.hears('/chorshanba@dars_jadvali_306_bot', (ctx) => {
  ctx.reply(`'Chorshanba' malakaviy amaliyot kuni`);
})
bot.hears('/payshanba@dars_jadvali_306_bot', (ctx) => {
  ctx.reply(`'Chorshanba' malakaviy amaliyot kuni`);
})
bot.hears('/juma@dars_jadvali_306_bot', async(ctx) => {
  if(ctx.chat.type !== 'supergroup')
    if(ctx.message.from.username!=="Qobulov_Asror")
      return ctx.reply('Error: This bot can only be run by the bot creator');
  const result = await getLessTable('3 kurs!B161:G164');
  if(result)
    ctx.reply(result)
  else
    ctx.reply("error")
})
bot.hears('/shanba@dars_jadvali_306_bot', async(ctx) => {
  if(ctx.chat.type !== 'supergroup')
    if(ctx.message.from.username!=="Qobulov_Asror")
      return ctx.reply('Error: This bot can only be run by the bot creator');
  const result = await getLessTable('3 kurs!B165:G168');
  if(result)
    ctx.reply(result)
  else
    ctx.reply("error")
})
bot.hears('/yakshanba@dars_jadvali_306_bot', (ctx) => {
  ctx.reply(`'Yakshanba' dam olish kuni`);
})

bot.on('message', (ctx) => {
  if(ctx.chat.type != 'supergroup')
    return ctx.reply(`Bot superguruhda ishlaydi`);
  if(ctx.message.text==='help')
    ctx.reply(`Dars jadvali uchun /table@dars_jadvali_306_bot komandasi`);
  if(ctx.message.text==='help -all')
    ctx.reply(`Bugungi jadvali /table@dars_jadvali_306_bot \n dushanba uchun /dushanba@dars_jadvali_306_bot \nseshanba uchun /seshanba@dars_jadvali_306_bot \njuma uchun /juma@dars_jadvali_306_bot \nshanba uchun /shanba@dars_jadvali_306_bot`);
})


// Start the bot
bot.launch();