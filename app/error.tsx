'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error);
  }, [error]);

  // For all errors, we'll show a consistent page not found message

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">404</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-xl font-semibold">Page Not Found</p>
          <p className="text-muted-foreground">
            The page you are looking for doesn&apos;t exist or has been moved.
          </p>
          <div className="w-full flex justify-center">
            <img 
              src="/images/404-illustration.svg" 
              alt="404 Illustration" 
              className="h-48 w-auto opacity-80"
              onError={(e) => {
                // Fallback if the image doesn't exist
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button asChild>
            <Link href="/">
              Return to Home
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
