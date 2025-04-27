'use server';

import { withErrorHandling } from '@/lib/with-error-handling';
import axios from 'axios';

export const authorizeCode = withErrorHandling(async (code: string) => {
  let data = {
    code,
    grant_type: 'authorization_code',
    client_id: process.env.LINKEDIN_CLIENT_ID,
    client_secret: process.env.LINKEDIN_CLIENT_SECRET,
    redirect_uri: process.env.NEXT_PUBLIC_APP_URL + '/career-profiles/create',
  };

  const result = await axios.post('https://www.linkedin.com/oauth/v2/accessToken', data, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });
  const authData = result.data;
  return authData;
});
