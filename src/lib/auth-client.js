import { createAuthClient } from 'better-auth/react';

export const authClient = createAuthClient({
  baseURL: 'https://skillswap-client-2ngr.vercel.app',
});

export const { signIn, signUp, signOut, useSession } = authClient;