import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Social } from '@/components/shared/social';
import { Separator } from '@/components/ui/separator';
import Image from 'next/image';
import { Suspense } from 'react';

type CardWrapperProps = React.HTMLAttributes<HTMLDivElement> & {
  headerTitle: string;
  headerDescription: string;
  backButtonLabel: string;
  backButtonHref: string;
  showSocial?: boolean;
  heroImage?: string;
};

export const CardWrapper = (props: CardWrapperProps) => {
  const {
    heroImage,
    headerTitle,
    headerDescription,
    backButtonLabel,
    backButtonHref,
    showSocial,
    children,
    ...rest
  } = props;

  return (
    <Card className="w-[400px] shadow-sm mx-4 md:mx-0" {...rest}>
      <CardHeader className="text-center flex flex-col items-center justify-center gap-y-4">
        {heroImage ? (
          <Image
            src={heroImage}
            alt="Hero Image"
            width={100}
            height={100}
            className="select-none"
          />
        ) : null}
        <div>
          <CardTitle>{headerTitle}</CardTitle>
          <CardDescription>{headerDescription}</CardDescription>
        </div>
      </CardHeader>
      {children ? <CardContent>{children}</CardContent> : null}
      {showSocial ? (
        <>
          <CardFooter className="gap-x-2">
            <Separator className="shrink" />
            <p className="text-sm text-center basis-full">Or connect with</p>
            <Separator className="shrink" />
          </CardFooter>
          <CardFooter>
            <Suspense>
              <Social />
            </Suspense>
          </CardFooter>
        </>
      ) : null}
      <Separator />
      <CardFooter className="py-3">
        <Button variant="link" className="font-normal w-full" size="sm" asChild>
          <Link href={backButtonHref}>{backButtonLabel}</Link>
        </Button>
      </CardFooter>
    </Card>
  );
};
