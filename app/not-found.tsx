'use client';

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { FallbackImage } from "@/components/ui/fallback-image";

export default function NotFound() {
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
            <FallbackImage 
              src="/images/404-illustration.svg" 
              alt="404 Illustration" 
              className="h-48 w-auto opacity-80"
              hideBroken={true}
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
