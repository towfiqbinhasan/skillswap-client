import { betterAuth } from 'better-auth';
import { mongodbAdapter } from 'better-auth/adapters/mongodb';
import { MongoClient } from 'mongodb';

const client = new MongoClient(process.env.MONGODB_URI);
const db = client.db('skillswap');

export const auth = betterAuth({
  database: mongodbAdapter(db, {
    client,
    collectionNames: {
      user: 'users',
      session: 'sessions',
      account: 'accounts',
      verification: 'verifications',
    },
  }),

  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: 'https://skillswap-client-2ngr.vercel.app',

  emailAndPassword: {
    enabled: true,
    minPasswordLength: 6,
  },

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    },
  },

  user: {
    additionalFields: {
      role: {
        type: 'string',
        defaultValue: 'client',
        input: true,
      },
      skills: {
        type: 'string[]',
        required: false,
      },
      bio: {
        type: 'string',
        required: false,
      },
      hourlyRate: {
        type: 'number',
        required: false,
      },
      isBlocked: {
        type: 'boolean',
        defaultValue: false,
      },
    },
  },

  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        user.role = 'client';
      }
      return true;
    },
  },
});