require('dotenv').config({ path: './.env.local' });

const express = require("express");
const cors = require("cors");
const fs = require("fs");
const dotenv = require("dotenv");
const { TwitterApi } = require("twitter-api-v2");
dotenv.config();

const app = express();
const port = 3001;
app.use(cors());
app.use(express.json());

const twitterClient = new TwitterApi({
  appKey: process.env.TWITTER_API_KEY,
  appSecret: process.env.TWITTER_API_SECRET,
  accessToken: process.env.TWITTER_ACCESS_TOKEN,
  accessSecret: process.env.TWITTER_ACCESS_SECRET,
});

const subscribersFile = "./subscribers.json";
if (!fs.existsSync(subscribersFile)) {
  fs.writeFileSync(subscribersFile, JSON.stringify([]));
}

app.post("/subscribe", async (req, res) => {
  try {
    const { twitterUsername, walletAddress, tokens, days } = req.body;
    if (!twitterUsername || !walletAddress || !tokens || !days) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Veriyi kaydet
    const subscribers = JSON.parse(fs.readFileSync(subscribersFile));
    subscribers.push({ twitterUsername, walletAddress, tokens, days });
    fs.writeFileSync(subscribersFile, JSON.stringify(subscribers, null, 2));

    // Tweet at
    const tweetText = `✅ New Reminder Subscription!

👛 Wallet: ${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}
🐦 Twitter: @${twitterUsername}
🕓 Days: ${days}
📦 Tokens: ${tokens.join(", ")}`;

    await twitterClient.v2.tweet(tweetText);
    console.log("✅ Tweet sent.");

    res.status(200).json({ success: true, message: "Subscription complete and tweet sent." });
  } catch (error) {
    console.error("❌ Error during subscription:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.listen(port, () => {
  console.log(`🚀 Backend is running on http://localhost:${port}`);
});
