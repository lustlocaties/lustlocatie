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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/shared/ui/tabs';
import Image from 'next/image';
import { SearchIcon, UserPlusIcon, CheckIcon, XIcon, ShieldIcon } from 'lucide-react';

interface UserResult {
  _id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  bio?: string;
  location?: string;
}

interface FriendRequest {
  id: string;
  sender?: {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string;
    location?: string;
    bio?: string;
  };
  receiver?: {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string;
    location?: string;
    bio?: string;
  };
  status?: string;
  createdAt: string;
}

interface FindContactsCardProps {
  onFriendAdded?: () => void;
}

export function FindContactsCard({ onFriendAdded }: FindContactsCardProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<UserResult[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<FriendRequest[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<FriendRequest[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingRequests, setIsLoadingRequests] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setIsLoadingRequests(true);
      const baseUrl = typeof window !== 'undefined'
        ? window.location.origin
        : process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

      // Fetch incoming requests
      const incomingRes = await fetch(`${baseUrl}/api/friends/requests`, {
        credentials: 'include',
      });
      if (!incomingRes.ok) throw new Error('Failed to fetch incoming requests');
      const incomingData = await incomingRes.json();
      setIncomingRequests(incomingData.requests);

      // Fetch outgoing requests
      const outgoingRes = await fetch(`${baseUrl}/api/friends/requests/outgoing`, {
        credentials: 'include',
      });
      if (!outgoingRes.ok) throw new Error('Failed to fetch outgoing requests');
      const outgoingData = await outgoingRes.json();
      setOutgoingRequests(outgoingData.requests);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load requests');
    } finally {
      setIsLoadingRequests(false);
    }
  };

  const searchUsers = async () => {
    try {
      setIsSearching(true);
      const baseUrl = typeof window !== 'undefined'
        ? window.location.origin
        : process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

      const response = await fetch(`${baseUrl}/api/users/search?q=${encodeURIComponent(searchTerm)}`, {
        credentials: 'include',
      });

      if (!response.ok) throw new Error('Search failed');

      const data = await response.json();
      setSearchResults(data.users);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    if (searchTerm.length < 2) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(() => {
      searchUsers();
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const sendFriendRequest = async (userId: string) => {
    try {
      const baseUrl = typeof window !== 'undefined'
        ? window.location.origin
        : process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

      const response = await fetch(`${baseUrl}/api/friends/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ receiverId: userId }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to send request');
      }

      // Refresh outgoing requests to show the new one
      await fetchRequests();
      setSuccessMessage('Friend request sent!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to send request';
      setError(message);
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleFriendRequest = async (requestId: string, action: 'accept' | 'reject' | 'block') => {
    try {
      const baseUrl = typeof window !== 'undefined'
        ? window.location.origin
        : process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

      const response = await fetch(`${baseUrl}/api/friends/request/${requestId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ action }),
      });

      if (!response.ok) throw new Error('Failed to update request');

      setIncomingRequests(incomingRequests.filter(r => r.id !== requestId));
      setSuccessMessage(`Friend request ${action}ed!`);
      setTimeout(() => setSuccessMessage(''), 3000);

      // Refresh contacts list when friend request is accepted
      if (action === 'accept' && onFriendAdded) {
        onFriendAdded();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update request');
    }
  };

  return (
    <Card className="w-full bg-white/40 dark:bg-slate-900/40 backdrop-blur-sm border-white/30 dark:border-slate-200/10">
      <CardHeader>
        <CardTitle className="text-2xl">Add Contacts</CardTitle>
        <CardDescription>Search for users and send friend requests</CardDescription>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="search" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="search">Search</TabsTrigger>
            <TabsTrigger value="requests">
              Requests
              {incomingRequests.length > 0 && (
                <span className="ml-2 h-5 w-5 rounded-full bg-red-500 text-xs text-white flex items-center justify-center">
                  {incomingRequests.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {successMessage && (
            <Alert variant="default" className="mt-4 border-green-200 bg-green-50">
              <AlertDescription className="text-green-800">{successMessage}</AlertDescription>
            </Alert>
          )}

          <TabsContent value="search" className="space-y-4">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white/50 dark:bg-slate-800/50"
              />
            </div>

            {isSearching && (
              <div className="text-center py-8 text-gray-500">Searching...</div>
            )}

            {!isSearching && searchResults.length === 0 && searchTerm.length > 0 && (
              <div className="text-center py-8 text-gray-500">No users found</div>
            )}

            {!isSearching && searchResults.length > 0 && (
              <div className="space-y-3">
                {searchResults.map((user) => (
                  <div
                    key={user._id}
                    className="flex items-center justify-between p-3 rounded-lg border border-white/20 dark:border-slate-700/50 hover:bg-primary-50/40 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      {user.avatarUrl ? (
                        <div className="relative h-10 w-10">
                          <Image
                            src={user.avatarUrl}
                            alt={user.name}
                            fill
                            className="rounded-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400 font-semibold text-sm">
                          {user.name.charAt(0)}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="font-medium text-sm">{user.name}</p>
                        {user.location && (
                          <p className="text-xs text-gray-500">📍 {user.location}</p>
                        )}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => sendFriendRequest(user._id)}
                      disabled={outgoingRequests.some(r => r.receiver?.id === user._id)}
                      variant="outline"
                    >
                      {outgoingRequests.some(r => r.receiver?.id === user._id) ? (
                        <>
                          <CheckIcon className="h-4 w-4 mr-1" />
                          Sent
                        </>
                      ) : (
                        <>
                          <UserPlusIcon className="h-4 w-4 mr-1" />
                          Add
                        </>
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="requests" className="space-y-4">
            {isLoadingRequests ? (
              <div className="text-center py-8 text-gray-500">Loading requests...</div>
            ) : incomingRequests.length === 0 && outgoingRequests.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No pending requests</div>
            ) : (
              <div className="space-y-6">
                {/* Incoming Requests */}
                {incomingRequests.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                      <span className="h-2 w-2 bg-red-500 rounded-full"></span>
                      Incoming ({incomingRequests.length})
                    </h3>
                    <div className="space-y-3">
                      {incomingRequests.map((request) => (
                        <div
                          key={request.id}
                          className="flex items-center justify-between p-3 rounded-lg border border-white/20 dark:border-slate-700/50 hover:bg-primary-50/40 dark:hover:bg-slate-800/40 transition-colors"
                        >
                          <div className="flex items-center gap-3 flex-1">
                            {request.sender?.avatarUrl ? (
                              <div className="relative h-10 w-10">
                                <Image
                                  src={request.sender.avatarUrl}
                                  alt={request.sender?.name || ''}
                                  fill
                                  className="rounded-full object-cover"
                                />
                              </div>
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400 font-semibold text-sm">
                                {request.sender?.name?.charAt(0) || '?'}
                              </div>
                            )}
                            <div className="min-w-0">
                              <p className="font-medium text-sm">{request.sender?.name}</p>
                              {request.sender?.location && (
                                <p className="text-xs text-gray-500">📍 {request.sender.location}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleFriendRequest(request.id, 'accept')}
                              variant="default"
                            >
                              <CheckIcon className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleFriendRequest(request.id, 'reject')}
                              variant="outline"
                            >
                              <XIcon className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleFriendRequest(request.id, 'block')}
                              variant="outline"
                            >
                              <ShieldIcon className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Outgoing Requests */}
                {outgoingRequests.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                      <span className="h-2 w-2 bg-blue-500 rounded-full"></span>
                      Outgoing ({outgoingRequests.length})
                    </h3>
                    <div className="space-y-3">
                      {outgoingRequests.map((request) => (
                        <div
                          key={request.id}
                          className="flex items-center justify-between p-3 rounded-lg border border-white/20 dark:border-slate-700/50 bg-blue-50/30 dark:bg-blue-900/10"
                        >
                          <div className="flex items-center gap-3 flex-1">
                            {request.receiver?.avatarUrl ? (
                              <div className="relative h-10 w-10">
                                <Image
                                  src={request.receiver.avatarUrl}
                                  alt={request.receiver?.name || ''}
                                  fill
                                  className="rounded-full object-cover"
                                />
                              </div>
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-semibold text-sm">
                                {request.receiver?.name?.charAt(0) || '?'}
                              </div>
                            )}
                            <div className="min-w-0">
                              <p className="font-medium text-sm">{request.receiver?.name}</p>
                              {request.receiver?.location && (
                                <p className="text-xs text-gray-500">📍 {request.receiver.location}</p>
                              )}
                            </div>
                          </div>
                          <div className="text-xs font-medium text-blue-600 dark:text-blue-400 px-2 py-1 bg-blue-100/50 dark:bg-blue-900/30 rounded">
                            Pending
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
