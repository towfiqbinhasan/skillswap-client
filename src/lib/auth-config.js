import { betterAuth } from 'better-auth';
import { MongoClient } from 'mongodb';

// Singleton pattern — serverless-এ connection reuse করে
let client;
let clientPromise;

if (!global._mongoClientPromise) {
  client = new MongoClient(process.env.MONGODB_URI);
  global._mongoClientPromise = client.connect();
}
clientPromise = global._mongoClientPromise;

export const auth = betterAuth({
  database: {
    db: (await clientPromise).db(),   // ← এটাই আসল fix, connected db দিচ্ছে
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