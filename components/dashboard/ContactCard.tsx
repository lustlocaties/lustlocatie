'use client';

import { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/shared/ui/card';
import { Button } from '@/components/shared/ui/button';
import { Input } from '@/components/shared/ui/input';
import { Alert, AlertDescription } from '@/components/shared/ui/alert';
import { ScrollArea } from '@/components/shared/ui/scroll-area';
import Image from 'next/image';
import { MessageCircleIcon, SearchIcon, PlusIcon } from 'lucide-react';
import Link from 'next/link';

interface UserContact {
  _id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  bio?: string;
  location?: string;
  website?: string;
}

export function ContactCard() {
  const [contacts, setContacts] = useState<UserContact[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<UserContact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchContacts();
  }, []);

  useEffect(() => {
    const filtered = contacts.filter(contact =>
      contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.location?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredContacts(filtered);
  }, [searchTerm, contacts]);

  const fetchContacts = async () => {
    try {
      setIsLoading(true);
      const baseUrl = typeof window !== 'undefined'
        ? window.location.origin
        : process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

      const url = `${baseUrl}/api/contacts`;
      console.log('Fetching contacts from:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        credentials: 'include',
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers.get('content-type'));

      if (!response.ok) {
        const text = await response.text();
        console.error('Error response body:', text);
        throw new Error(`HTTP ${response.status}: ${text.substring(0, 100)}`);
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Non-JSON response:', text);
        throw new Error('API returned non-JSON response');
      }

      const data = await response.json();
      console.log('Contacts API response:', data);
      if (!data.ok && data.error) {
        throw new Error(data.error);
      }
      setContacts(data.contacts || []);
    } catch (err) {
      console.error('Fetch error details:', err);
      setError(err instanceof Error ? err.message : 'Failed to load contacts');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Contacts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-500">Loading contacts...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full bg-white/40 dark:bg-slate-900/40 backdrop-blur-sm border-white/30 dark:border-slate-200/10">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <CardTitle className="text-2xl">Contacts</CardTitle>
            <CardDescription>
              {filteredContacts.length} of {contacts.length} contacts
            </CardDescription>
          </div>
        </div>
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search contacts by name, email, or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-white/50 dark:bg-slate-800/50"
          />
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {contacts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-sm">No contacts yet. Start connecting with people!</p>
          </div>
        ) : filteredContacts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-sm">No contacts match your search.</p>
          </div>
        ) : (
          <ScrollArea className="h-96">
            <div className="space-y-2 pr-4">
              {filteredContacts.map((contact) => (
                <div
                  key={contact._id}
                  className="flex items-center justify-between p-3 rounded-lg border border-white/20 dark:border-slate-700/50 hover:bg-primary-50/40 dark:hover:bg-slate-800/40 transition-colors group"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {contact.avatarUrl ? (
                      <div className="relative h-12 w-12 flex-shrink-0">
                        <Image
                          src={contact.avatarUrl}
                          alt={contact.name}
                          fill
                          className="rounded-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="h-12 w-12 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0 text-primary-600 dark:text-primary-400 font-semibold text-sm">
                        {contact.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-slate-900 dark:text-white truncate">
                        {contact.name}
                      </p>
                      {contact.location && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          📍 {contact.location}
                        </p>
                      )}
                      {!contact.location && contact.bio && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {contact.bio}
                        </p>
                      )}
                    </div>
                  </div>
                  <Link href={`/dashboard?section=messages&contact=${contact._id}`}>
                    <Button
                      size="sm"
                      variant="outline"
                      className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <MessageCircleIcon className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}

