import { CardWrapper } from '@/components/shared/card-wrapper';
import { AuthError } from 'next-auth';
import { redirect } from 'next/navigation';

type ErrorCardProps = {
  message?: any /*AuthError['type']*/;
};

export const ErrorCard = ({ message }: ErrorCardProps) => {
  let headerDescription =
    'Oops! Something went wrong. Please contact administrator for more details or try again later.';

  if (!message) {
    redirect('/login');
  }

  if (message === 'OAuthAccountNotLinked') {
    headerDescription =
      'Authentication error. Please try again or contact support if the issue persists.';
  }

  return (
    <CardWrapper
      headerTitle="An Error Occured"
      headerDescription={headerDescription}
      backButtonLabel="Back to login"
      backButtonHref="/login"
      heroImage="/assets/error.svg"
    />
  );
};
