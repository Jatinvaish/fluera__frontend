'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function CallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const success = searchParams.get('success');
  const error = searchParams.get('error');
  const platform = searchParams.get('platform');

  useEffect(() => {
    if (success === 'true') {
      setTimeout(() => {
        router.push('/dashboard/social-platforms');
      }, 2000);
    }
  }, [success, router]);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="p-3 rounded-full bg-destructive/10">
                <XCircle className="h-12 w-12 text-destructive" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">Connection Failed</h2>
                <p className="text-sm text-muted-foreground mt-2">
                  {decodeURIComponent(error)}
                </p>
              </div>
              <Button onClick={() => router.push('/dashboard/social-platforms')}>
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (success === 'true') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="p-3 rounded-full bg-green-500/10">
                <CheckCircle2 className="h-12 w-12 text-green-500" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">Successfully Connected!</h2>
                <p className="text-sm text-muted-foreground mt-2">
                  Your {platform} account has been connected. Redirecting...
                </p>
              </div>
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}
