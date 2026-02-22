'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Alert, AlertDescription, AlertTitle } from '@/components/shared/ui/alert';
import { Button } from '@/components/shared/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/shared/ui/card';
import { Input } from '@/components/shared/ui/input';
import { Label } from '@/components/shared/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/shared/ui/tabs';

type AuthTab = 'login' | 'register';

type AuthResult = {
  ok: boolean;
  error?: string;
};

const initialLoginForm = {
  email: '',
  password: '',
};

const initialRegisterForm = {
  name: '',
  email: '',
  password: '',
};

export function AuthPanel({ initialTab = 'login' }: { initialTab?: AuthTab }) {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<AuthTab>(initialTab);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [loginForm, setLoginForm] = useState(initialLoginForm);
  const [registerForm, setRegisterForm] = useState(initialRegisterForm);

  useEffect(() => {
    let isMounted = true;

    const checkSession = async () => {
      try {
        const baseUrl = typeof window !== 'undefined' 
          ? window.location.origin 
          : process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
        
        const response = await fetch(`${baseUrl}/api/auth/me`, {
          method: 'GET',
          credentials: 'include',
        });

        if (!isMounted) {
          return;
        }

        if (response.ok) {
          router.replace('/');
          router.refresh();
          return;
        }
      } catch {
      } finally {
        if (isMounted) {
          setIsCheckingSession(false);
        }
      }
    };

    checkSession();

    return () => {
      isMounted = false;
    };
  }, [router]);

  const actionText = useMemo(() => {
    if (activeTab === 'login') {
      return isSubmitting ? 'Inloggen...' : 'Inloggen';
    }

    return isSubmitting ? 'Account aanmaken...' : 'Account aanmaken';
  }, [activeTab, isSubmitting]);

  const clearError = () => {
    if (errorMessage) {
      setErrorMessage('');
    }
  };

  const submitAuth = async (endpoint: '/api/auth/login' | '/api/auth/register', payload: object) => {
    const baseUrl = typeof window !== 'undefined' 
      ? window.location.origin 
      : process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    
    const response = await fetch(`${baseUrl}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const result = (await response.json()) as AuthResult;

    if (!response.ok || !result.ok) {
      return {
        success: false,
        error: result.error ?? 'Er ging iets mis. Probeer opnieuw.',
      };
    }

    return { success: true, error: '' };
  };

  const onLoginSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    clearError();

    try {
      const result = await submitAuth('/api/auth/login', loginForm);

      if (!result.success) {
        setErrorMessage(result.error);
        return;
      }

      router.push('/');
      router.refresh();
    } catch {
      setErrorMessage('Inloggen is mislukt. Probeer opnieuw.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const onRegisterSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    clearError();

    try {
      const result = await submitAuth('/api/auth/register', registerForm);

      if (!result.success) {
        setErrorMessage(result.error);
        return;
      }

      router.push('/');
      router.refresh();
    } catch {
      setErrorMessage('Registreren is mislukt. Probeer opnieuw.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isCheckingSession) {
    return (
      <section className="w-full max-w-md px-4 sm:px-6">
        <Card>
          <CardHeader>
            <CardTitle>Controleren...</CardTitle>
            <CardDescription>Sessie wordt gecontroleerd.</CardDescription>
          </CardHeader>
        </Card>
      </section>
    );
  }

  return (
    <section className="w-full max-w-md px-4 sm:px-6">
      <Card>
        <CardHeader>
          <CardTitle>Welkom bij Lustlocaties</CardTitle>
          <CardDescription>Log in of maak een account aan.</CardDescription>
        </CardHeader>

        <CardContent>
          <Tabs
            value={activeTab}
            onValueChange={(value) => {
              setActiveTab(value as AuthTab);
              clearError();
            }}
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Inloggen</TabsTrigger>
              <TabsTrigger value="register">Registreren</TabsTrigger>
            </TabsList>

            {errorMessage ? (
              <Alert variant="destructive" className="mt-4">
                <AlertTitle>Actie mislukt</AlertTitle>
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            ) : null}

            <TabsContent value="login" className="mt-4">
              <form className="space-y-4" onSubmit={onLoginSubmit}>
                <div className="space-y-2">
                  <Label htmlFor="login-email">E-mail</Label>
                  <Input
                    id="login-email"
                    type="email"
                    required
                    autoComplete="email"
                    value={loginForm.email}
                    onChange={(event) =>
                      setLoginForm((current) => ({
                        ...current,
                        email: event.target.value,
                      }))
                    }
                    placeholder="jij@voorbeeld.nl"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="login-password">Wachtwoord</Label>
                  <Input
                    id="login-password"
                    type="password"
                    required
                    minLength={8}
                    autoComplete="current-password"
                    value={loginForm.password}
                    onChange={(event) =>
                      setLoginForm((current) => ({
                        ...current,
                        password: event.target.value,
                      }))
                    }
                    placeholder="••••••••"
                  />
                </div>

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {actionText}
                </Button>
              </form>

              <Button
                type="button"
                variant="secondary"
                className="mt-4 w-full"
                onClick={() => router.push('/')}
              >
                Terug naar home
              </Button>
            </TabsContent>

            <TabsContent value="register" className="mt-4">
              <form className="space-y-4" onSubmit={onRegisterSubmit}>
                <div className="space-y-2">
                  <Label htmlFor="register-name">Naam</Label>
                  <Input
                    id="register-name"
                    type="text"
                    required
                    minLength={2}
                    maxLength={100}
                    autoComplete="name"
                    value={registerForm.name}
                    onChange={(event) =>
                      setRegisterForm((current) => ({
                        ...current,
                        name: event.target.value,
                      }))
                    }
                    placeholder="Jouw naam"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-email">E-mail</Label>
                  <Input
                    id="register-email"
                    type="email"
                    required
                    autoComplete="email"
                    value={registerForm.email}
                    onChange={(event) =>
                      setRegisterForm((current) => ({
                        ...current,
                        email: event.target.value,
                      }))
                    }
                    placeholder="jij@voorbeeld.nl"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-password">Wachtwoord</Label>
                  <Input
                    id="register-password"
                    type="password"
                    required
                    minLength={8}
                    maxLength={128}
                    autoComplete="new-password"
                    value={registerForm.password}
                    onChange={(event) =>
                      setRegisterForm((current) => ({
                        ...current,
                        password: event.target.value,
                      }))
                    }
                    placeholder="Minimaal 8 tekens"
                  />
                </div>

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {actionText}
                </Button>
              </form>

              <Button
                type="button"
                variant="secondary"
                className="mt-4 w-full"
                onClick={() => router.push('/')}
              >
                Terug naar home
              </Button>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </section>
  );
}
