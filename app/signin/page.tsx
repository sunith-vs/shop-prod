"use client";

import { useState, Suspense } from "react";
import { createClient } from "@/lib/supabase/client";
import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

function SignInContent() {
  const [isGoogleLoading, setIsGoogleLoading] = useState<boolean>(false);
  const supabase = createClient();
  const searchParams = useSearchParams();
  const next = searchParams.get("next");

  async function signInWithGoogle() {
    setIsGoogleLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback${
            next ? `?next=${encodeURIComponent(next)}` : ""
          }`,
        },
      });

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGoogleLoading(false);
    }
  }

  return (
    <div className="container max-w-lg flex flex-col items-center justify-center min-h-[600px] gap-6">
      <div className="flex flex-col gap-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          Welcome back
        </h1>
        <p className="text-sm text-muted-foreground">
          Choose your preferred sign in method
        </p>
      </div>
      <Button
        variant="outline"
        type="button"
        disabled={isGoogleLoading}
        onClick={signInWithGoogle}
        className="w-full"
      >
        {isGoogleLoading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Icons.google className="mr-2 h-4 w-4" />
        )}{" "}
        Continue with Google
      </Button>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={
      <div className="container max-w-lg flex flex-col items-center justify-center min-h-[600px]">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    }>
      <SignInContent />
    </Suspense>
  );
}
