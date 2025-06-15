
const fs = require('fs');
const { TwitterApi } = require('twitter-api-v2');
require('dotenv').config({ path: './.env.local' });

const twitterClient = new TwitterApi({
  appKey: process.env.TWITTER_API_KEY,
  appSecret: process.env.TWITTER_API_SECRET,
  accessToken: process.env.TWITTER_ACCESS_TOKEN,
  accessSecret: process.env.TWITTER_ACCESS_SECRET,
});

function daysBetween(date1, date2) {
  const oneDay = 1000 * 60 * 60 * 24;
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return Math.floor((d2 - d1) / oneDay);
}

async function checkReminders() {
  try {
    const data = JSON.parse(fs.readFileSync('subscribers.json', 'utf-8'));
    const now = new Date();

    for (const record of data) {
      const reminderDate = new Date(record.createdAt);
      reminderDate.setDate(reminderDate.getDate() + Number(record.days));

      const daysLeft = daysBetween(now, reminderDate);
      if (daysLeft === 1) {
        await twitterClient.v2.tweet(
          `@${record.twitterUsername}, only 1 day left until the unlock of ${record.tokens.join(', ')}! ⏳`
        );
      }
    }

    console.log("Checked all reminders.");
  } catch (error) {
    console.error("Error in reminder check:", error);
  }
}

checkReminders();
