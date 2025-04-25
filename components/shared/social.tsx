'use client';

import { Button } from '@/components/ui/button';
import { signIn } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { IoLogoGithub } from 'react-icons/io5';
import { FcGoogle } from 'react-icons/fc';
import { DEFAULT_LOGIN_REDIRECT } from '@/routes';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';

export const Social = () => {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || DEFAULT_LOGIN_REDIRECT;
  const [isLoadingGoogle, setIsLoadingGoogle] = useState(false);
  const [isLoadingGithub, setIsLoadingGithub] = useState(false);

  const onClick = (provider: 'google' | 'github') => {
    if (provider === 'google') {
      setIsLoadingGoogle(true);
    } else {
      setIsLoadingGithub(true);
    }
    signIn(provider, {
      callbackUrl,
    });
  };

  return (
    <div className="flex gap-x-2 items-center w-full">
      <Button
        size="lg"
        className="w-full  "
        variant="outline"
        onClick={() => onClick('google')}
        disabled={isLoadingGoogle || isLoadingGithub}
      >
        {isLoadingGoogle ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FcGoogle />} Google
      </Button>
      <Button
        size="lg"
        className="w-full  "
        variant="outline"
        onClick={() => onClick('github')}
        disabled={isLoadingGoogle || isLoadingGithub}
      >
        {isLoadingGithub ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <IoLogoGithub />}{' '}
        Github
      </Button>
    </div>
  );
};
