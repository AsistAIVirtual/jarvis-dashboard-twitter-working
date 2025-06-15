
import Twit from 'twit';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { message } = req.body;

  const T = new Twit({
    consumer_key: process.env.TWITTER_CONSUMER_KEY,
    consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
    access_token: process.env.TWITTER_ACCESS_TOKEN,
    access_token_secret: process.env.TWITTER_ACCESS_SECRET,
  });

  try {
    const tweet = await T.post('statuses/update', { status: message });
    return res.status(200).json({ message: 'Tweet sent', tweet });
  } catch (error) {
    return res.status(500).json({ message: 'Tweet failed', error: error.message });
  }
}
