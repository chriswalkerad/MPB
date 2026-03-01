const { TwitterApi } = require('twitter-api-v2');
const fs = require('fs');
const path = require('path');

// Initialize Twitter client
const client = new TwitterApi({
  appKey: process.env.TWITTER_API_KEY,
  appSecret: process.env.TWITTER_API_SECRET,
  accessToken: process.env.TWITTER_ACCESS_TOKEN,
  accessSecret: process.env.TWITTER_ACCESS_SECRET,
});

// Load events
const eventsPath = path.join(__dirname, '../src/data/events.json');
const events = JSON.parse(fs.readFileSync(eventsPath, 'utf-8'));

// Get upcoming events (next 30 days)
const today = new Date();
const thirtyDaysOut = new Date(today);
thirtyDaysOut.setDate(thirtyDaysOut.getDate() + 30);

const upcomingEvents = events.filter(event => {
  const eventDate = new Date(event.date);
  return eventDate >= today && eventDate <= thirtyDaysOut;
}).sort((a, b) => new Date(a.date) - new Date(b.date));

if (upcomingEvents.length === 0) {
  console.log('No upcoming events in the next 30 days');
  process.exit(0);
}

// Pick event based on day of year (cycles through events)
const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
const eventIndex = dayOfYear % upcomingEvents.length;
const event = upcomingEvents[eventIndex];

// Format date
const eventDate = new Date(event.date);
const dateStr = eventDate.toLocaleDateString('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric'
});

// Format location
const location = event.format === 'virtual' ? 'Virtual' : event.city || 'TBA';

// Build tweet
const typeEmoji = {
  'conference': '🎤',
  'workshop': '🛠️',
  'webinar': '💻',
  'training': '📚',
  'ctf': '🚩',
  'meetup': '🤝'
}[event.type] || '📅';

const tweet = `${typeEmoji} ${event.name}

📍 ${location}
📅 ${dateStr}
${event.tags?.length ? `🏷️ ${event.tags.slice(0, 2).join(', ')}` : ''}

${event.url}

#cybersecurity #infosec`;

// Post tweet
async function postTweet() {
  try {
    const result = await client.v2.tweet(tweet);
    console.log('Tweet posted successfully!');
    console.log('Tweet ID:', result.data.id);
    console.log('Content:', tweet);
  } catch (error) {
    console.error('Error posting tweet:', error);
    process.exit(1);
  }
}

postTweet();
