"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";

export default function HomePage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      router.push("/dashboard");
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (user) {
    return null;
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">Pivelabs</CardTitle>
          <CardDescription className="text-center">
            AI-powered article generation platform
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col space-y-2">
            <Link href="/signin">
              <Button className="w-full">Sign In</Button>
            </Link>
            <Link href="/signup">
              <Button variant="outline" className="w-full">
                Create Account
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
