import { BskyAgent } from '@atproto/api';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize Bluesky client
const agent = new BskyAgent({ service: 'https://bsky.social' });

// Load events
const eventsPath = join(__dirname, '../src/data/events.json');
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

// Build post text
const typeEmoji = {
  'conference': '🎤',
  'workshop': '🛠️',
  'webinar': '💻',
  'training': '📚',
  'ctf': '🚩',
  'meetup': '🤝'
}[event.type] || '📅';

const postText = `${typeEmoji} ${event.name}

📍 ${location}
📅 ${dateStr}
${event.tags?.length ? `🏷️ ${event.tags.slice(0, 2).join(', ')}` : ''}

#cybersecurity #infosec`;

// Create link facet for the URL
function createLinkFacet(text, url) {
  const linkText = '\n\n🔗 Event Link';
  const fullText = text + linkText;
  const byteStart = new TextEncoder().encode(text + '\n\n🔗 ').length;
  const byteEnd = byteStart + new TextEncoder().encode('Event Link').length;

  return {
    text: fullText,
    facets: [{
      index: { byteStart, byteEnd },
      features: [{ $type: 'app.bsky.richtext.facet#link', uri: url }]
    }]
  };
}

// Post to Bluesky
async function post() {
  try {
    await agent.login({
      identifier: process.env.BLUESKY_HANDLE,
      password: process.env.BLUESKY_APP_PASSWORD,
    });

    const { text, facets } = createLinkFacet(postText, event.url);

    const result = await agent.post({
      text,
      facets,
      createdAt: new Date().toISOString(),
    });

    console.log('Posted successfully!');
    console.log('URI:', result.uri);
    console.log('Content:', text);
  } catch (error) {
    console.error('Error posting:', error);
    process.exit(1);
  }
}

post();
