const config = require('config')
const { Telegraf } = require('telegraf');
const { google } = require('googleapis');
const cache = require('memory-cache')
const { CronJob } = require('cron');

// Replace with your own values
const BOT_TOKEN = config.get('newToken');
const SHEET_ID = config.get('SHEET_ID');
let RANGE_NAME = '3 kurs!B143:G143';
const userId = '492277763'; // @Qobulov_Asror
const groupId = '-1001492319223'; // '👩‍🎓 306-guruh 👨‍🎓',
const groupId2 = '-1001377009705';

const bot = new Telegraf(BOT_TOKEN);

async function getLessTable(weekName=false){
  const weekDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const today = new Date();
  const weekDayName = weekDays[today.getDay()];
  
  if(weekName){
    RANGE_NAME=weekName;
  }else{
    const data = cache.get(weekDayName);
    if(data){
      return data;
    }
  
    switch (weekDayName) {
        case 'Sunday': 
          return `Bugun 'Yakshanba' dam olish kuni`;
        case 'Monday': RANGE_NAME = '3 kurs!B145:G148'; break;
        case 'Tuesday': RANGE_NAME = '3 kurs!B149:G152'; break;
        case 'Wednesday': 
          return `Bugun 'Chorshanba' malakaviy amaliyot kuni`;
        case 'Thursday': 
          return `Bugun 'Payshanba' malakaviy amaliyot kuni`;
        case 'Friday': RANGE_NAME = '3 kurs!B161:G164'; break;
        case 'Saturday': RANGE_NAME = '3 kurs!B165:G168'; break;
        default: RANGE_NAME = '3 kurs!B144:G168'; break;
    }
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
    let message = data[0][0]+'\n';
    for (let i = 0; i < data.length; i++) {
      message+= `${(i+1)}) ⏰(${data[i][1]}) | 📘 ${data[i][2]} | 🏢${data[i][5]} \n`;
    }
    cache.put(weekDayName, message, 2*60*60*1000) 
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

  const result = await getLessTable();
  if(result)
    ctx.reply(result)
  else
    ctx.reply("error")
});

bot.on('message', async(ctx) => {
  if(ctx.chat.type !== 'supergroup')
    if(ctx.message.from.username!=="Qobulov_Asror")
      return ctx.reply('Error: This bot can only be run by the bot creator');

  switch (ctx.message.text) {
    case '/help@dars_jadvali_306_bot': {
      return ctx.reply(`Dars jadvali uchun /table@dars_jadvali_306_bot komandasi`);
    }
    case '/help-all@dars_jadvali_306_bot': {
      return ctx.reply(`Bugungi jadvali /table@dars_jadvali_306_bot \n dushanba uchun /dushanba@dars_jadvali_306_bot \nseshanba uchun /seshanba@dars_jadvali_306_bot \njuma uchun /juma@dars_jadvali_306_bot \nshanba uchun /shanba@dars_jadvali_306_bot`);
    }
    case '/dushanba@dars_jadvali_306_bot': {
      const result = await getLessTable('3 kurs!B145:G148');
      if(result)
        return ctx.reply(result)
      else
      return ctx.reply("error")
    }
    case '/seshanba@dars_jadvali_306_bot': {
      const result = await getLessTable('3 kurs!B149:G152');
      if(result)
        return ctx.reply(result)
      else
      return ctx.reply("error")
    }
    case '/chorshanba@dars_jadvali_306_bot': {
      return ctx.reply(`'Chorshanba' malakaviy amaliyot kuni`);
    }
    case '/payshanba@dars_jadvali_306_bot': {
      return ctx.reply(`'Payshanba' malakaviy amaliyot kuni`);
    }
    case '/juma@dars_jadvali_306_bot': {
      const result = await getLessTable('3 kurs!B161:G164');
      if(result)
        return ctx.reply(result)
      else
      return ctx.reply("error")
    }
    case '/shanba@dars_jadvali_306_bot': {
      const result = await getLessTable('3 kurs!B165:G168');
      if(result)
        return ctx.reply(result)
      else
      return ctx.reply("error")
    }
    case '/yakshanba@dars_jadvali_306_bot': {
      return ctx.reply(`'Yakshanba' dam olish kuni`)
    }
    default: return ctx.reply(`Xatolik`)
  }
})

var job = new CronJob('00 00 8 * * *',async ()=> {
    const result = await getLessTable();
      bot.telegram.sendMessage(userId, result);
      bot.telegram.sendMessage(groupId, result);
  }, null, true, 'UTC+05:00'
);

bot.startPolling();

// Start the bot
// bot.launch();