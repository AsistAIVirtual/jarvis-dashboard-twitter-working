
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const { TwitterApi } = require('twitter-api-v2');
require('dotenv').config({ path: './.env.local' });

const app = express();
app.use(bodyParser.json());

const twitterClient = new TwitterApi({
  appKey: process.env.TWITTER_API_KEY,
  appSecret: process.env.TWITTER_API_SECRET,
  accessToken: process.env.TWITTER_ACCESS_TOKEN,
  accessSecret: process.env.TWITTER_ACCESS_SECRET,
});

app.post('/subscribe', async (req, res) => {
  const { twitterUsername, walletAddress, tokens, days } = req.body;
  const record = { twitterUsername, walletAddress, tokens, days, createdAt: new Date().toISOString() };

  try {
    const data = fs.existsSync('subscribers.json')
      ? JSON.parse(fs.readFileSync('subscribers.json', 'utf-8'))
      : [];
    data.push(record);
    fs.writeFileSync('subscribers.json', JSON.stringify(data, null, 2));

    await twitterClient.v2.tweet(
      `@${twitterUsername}, your reminder for ${tokens.join(', ')} has been set! We'll notify you ${days} days before unlock.`
    );

    res.status(200).json({ success: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, error: e.message });
  }
});

app.listen(3001, () => console.log('Backend listening on port 3001'));
