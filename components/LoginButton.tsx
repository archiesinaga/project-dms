'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import  LoadingSpinner  from '@/components/LoadingSpinner';

export default function LoginButton() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      const result = await signIn('credentials', {
        redirect: false,
      });

      if (result?.error) {
        toast({
          title: "Error",
          description: "Login failed",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "Login successful",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleLogin}
      disabled={isLoading}
      className="w-full"
    >
      {isLoading ? (
        <LoadingSpinner size="sm" text="Signing in..." />
      ) : (
        'Sign In'
      )}
    </Button>
  );
}