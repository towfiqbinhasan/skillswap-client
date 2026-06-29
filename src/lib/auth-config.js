import { betterAuth } from 'better-auth';
import { MongoClient } from 'mongodb';

const client = new MongoClient(process.env.MONGODB_URI);

export const auth = betterAuth({
  database: {
    db: client.db(),
    type: 'mongodb',
  },
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    },
  },
  user: {
    additionalFields: {
      role: { type: 'string', default: 'client' },
      skills: { type: 'array', default: [] },
      bio: { type: 'string', default: '' },
      isBlocked: { type: 'boolean', default: false },
      hourlyRate: { type: 'number', default: 0 },
    },
  },
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,
});