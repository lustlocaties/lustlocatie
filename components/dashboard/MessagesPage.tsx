'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/shared/ui/dropdown-menu';
import Image from 'next/image';
import { SendIcon, LoaderIcon, PlusIcon, UserIcon, Check, CheckCheck } from 'lucide-react';

interface Conversation {
  id: string;
  name: string;
  avatarUrl?: string;
  lastMessage: {
    content: string;
    createdAt: string;
  };
  unreadCount: number;
}

interface Friend {
  _id: string;
  name: string;
  avatarUrl?: string;
  location?: string;
}

interface Message {
  id: string;
  senderId: string;
  recipientId: string;
  content: string;
  isRead: boolean;
  createdAt: string;
}

export function MessagesPage({ currentUserId }: { currentUserId?: string }) {
  const searchParams = useSearchParams();
  const contactIdFromUrl = searchParams.get('contact');
  
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isRefreshingMessages, setIsRefreshingMessages] = useState(false);
  const [error, setError] = useState('');
  const messageScrollAreaRef = useRef<HTMLDivElement>(null);
  const shouldScrollToBottomRef = useRef(false);
  const lastConversationIdRef = useRef<string | null>(null);

  const fetchConversations = useCallback(async (isBackgroundPoll = false) => {
    try {
      if (!isBackgroundPoll) {
        setIsLoading(true);
      }
      setError('');

      const baseUrl = typeof window !== 'undefined'
        ? window.location.origin
        : process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

      const response = await fetch(`${baseUrl}/api/messages`, {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch conversations');
      }

      const data = await response.json();
      const newConversations = data.conversations || [];

      // Only update state if conversations actually changed - use a more robust comparison
      setConversations(prev => {
        if (prev.length !== newConversations.length) return newConversations;

        // Compare each conversation's essential properties
        const hasChanged = prev.some((conv, idx) => {
          const newConv = newConversations[idx];
          return !newConv ||
                 conv.id !== newConv.id ||
                 conv.name !== newConv.name ||
                 conv.lastMessage?.content !== newConv.lastMessage?.content ||
                 conv.unreadCount !== newConv.unreadCount;
        });

        return hasChanged ? newConversations : prev;
      });

      if (newConversations.length > 0 && !contactIdFromUrl && !selectedConversation) {
        setSelectedConversation(newConversations[0]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load conversations');
    } finally {
      if (!isBackgroundPoll) {
        setIsLoading(false);
      }
    }
  }, [contactIdFromUrl, selectedConversation]);

  const startNewConversation = useCallback(async (contactId: string) => {
    try {
      setError('');

      const baseUrl = typeof window !== 'undefined'
        ? window.location.origin
        : process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

      // Fetch the contact's info
      const response = await fetch(`${baseUrl}/api/contacts`, {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch contact');
      }

      const data = await response.json();
      const contact = (data.contacts as Friend[] | undefined)?.find((c) => c._id === contactId);

      if (!contact) {
        setError('Contact not found');
        return;
      }

      // Create a placeholder conversation
      const newConversation: Conversation = {
        id: contact._id,
        name: contact.name,
        avatarUrl: contact.avatarUrl,
        lastMessage: {
          content: '',
          createdAt: new Date().toISOString(),
        },
        unreadCount: 0,
      };

      setSelectedConversation(newConversation);
      setMessages([]);

      // Add to conversations list if not already there
      if (!conversations.find(c => c.id === contactId)) {
        setConversations(prev => [newConversation, ...prev]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start conversation');
    }
  }, [conversations]);

  const fetchFriends = useCallback(async () => {
    try {
      const baseUrl = typeof window !== 'undefined'
        ? window.location.origin
        : process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

      const response = await fetch(`${baseUrl}/api/contacts`, {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch friends');
      }

      const data = await response.json();
      setFriends(data.contacts || []);
    } catch (err) {
      console.error('Failed to load friends:', err);
    }
  }, []);

  const fetchMessages = useCallback(async (userId: string, isBackgroundPoll = false) => {
    try {
      setError('');
      if (isBackgroundPoll) {
        setIsRefreshingMessages(true);
      }

      const baseUrl = typeof window !== 'undefined'
        ? window.location.origin
        : process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

      const response = await fetch(`${baseUrl}/api/messages/${userId}`, {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch messages');
      }

      const data = await response.json();
      const newMessages = data.messages || [];

      // Only update state if messages actually changed - use more robust comparison
      setMessages(prev => {
        if (prev.length !== newMessages.length) return newMessages;

        // Compare message IDs and read status
        const hasChanged = prev.some((msg, idx) => {
          const newMsg = newMessages[idx];
          return !newMsg ||
                 msg.id !== newMsg.id ||
                 msg.content !== newMsg.content ||
                 msg.isRead !== newMsg.isRead;
        });

        return hasChanged ? newMessages : prev;
      });
    } catch (err) {
      // Only show errors on initial fetch, not on background polls
      if (!isBackgroundPoll) {
        setError(err instanceof Error ? err.message : 'Failed to load messages');
      }
    } finally {
      if (isBackgroundPoll) {
        setIsRefreshingMessages(false);
      }
    }
  }, []);

  useEffect(() => {
    fetchConversations();
    fetchFriends();
  }, [fetchConversations, fetchFriends]);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.id);
    }
  }, [fetchMessages, selectedConversation]);

  useEffect(() => {
    if (!selectedConversation?.id) return;
    if (lastConversationIdRef.current !== selectedConversation.id) {
      lastConversationIdRef.current = selectedConversation.id;
      shouldScrollToBottomRef.current = true;
    }
  }, [selectedConversation]);

  // Handle contact query parameter
  useEffect(() => {
    if (contactIdFromUrl && conversations.length > 0) {
      const conversation = conversations.find(c => c.id === contactIdFromUrl);
      if (conversation) {
        setSelectedConversation(conversation);
      } else {
        // Start new conversation with this contact
        startNewConversation(contactIdFromUrl);
      }
    }
  }, [contactIdFromUrl, conversations, startNewConversation]);

  useEffect(() => {
    if (!shouldScrollToBottomRef.current) return;
    const root = messageScrollAreaRef.current;
    if (!root) return;
    const viewport = root.querySelector('[data-radix-scroll-area-viewport]') as HTMLElement | null;
    if (!viewport) return;

    requestAnimationFrame(() => {
      viewport.scrollTop = viewport.scrollHeight;
      shouldScrollToBottomRef.current = false;
    });
  }, [messages]);

  // Poll for conversation updates
  useEffect(() => {
    const intervalId = setInterval(() => {
      fetchConversations(true); // Pass true to indicate this is a background poll
    }, 30000); // Poll every 30 seconds

    return () => clearInterval(intervalId);
  }, [contactIdFromUrl, fetchConversations]);

  // Poll for new messages in active conversation
  useEffect(() => {
    if (!selectedConversation) return;

    const intervalId = setInterval(() => {
      fetchMessages(selectedConversation.id, true); // Pass true to indicate this is a background poll
    }, 10000); // Poll every 10 seconds

    return () => clearInterval(intervalId);
  }, [fetchMessages, selectedConversation]);


  const handleSendMessage = async () => {
    if (!selectedConversation || !newMessage.trim()) return;

    try {
      setIsSending(true);
      setError('');

      const baseUrl = typeof window !== 'undefined'
        ? window.location.origin
        : process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

      const response = await fetch(`${baseUrl}/api/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          recipientId: selectedConversation.id,
          content: newMessage,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const data = await response.json();

      // Add to local messages
      setMessages((prev) => [...prev, data.message]);
      setNewMessage('');

      // Refresh conversations to update last message (as background update)
      await fetchConversations(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="w-full h-[600px]">
        <CardHeader>
          <CardTitle>Messages</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-center">
            <LoaderIcon className="h-8 w-8 animate-spin mx-auto mb-2" />
            <p className="text-gray-500">Loading conversations...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full">
      <div
        className="w-full grid grid-cols-1 lg:grid-cols-4 gap-4 items-stretch auto-rows-fr"
        style={{ height: '80vh', maxHeight: '800px' }}
      >
      {/* Conversations List */}
      <Card className="lg:col-span-1 h-full min-h-0 flex flex-col">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Conversations</CardTitle>
              <CardDescription>{conversations.length} conversations</CardDescription>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <PlusIcon className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Start New Conversation</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <ScrollArea className="h-64">
                  {friends.length === 0 ? (
                    <div className="px-2 py-4 text-sm text-gray-500 text-center">
                      No friends available
                    </div>
                  ) : (
                    friends.map((friend) => (
                      <DropdownMenuItem
                        key={friend._id}
                        onClick={() => startNewConversation(friend._id)}
                        className="cursor-pointer"
                      >
                        <div className="flex items-center gap-2 w-full">
                          {friend.avatarUrl ? (
                            <div className="relative h-8 w-8 flex-shrink-0">
                              <Image
                                src={friend.avatarUrl}
                                alt={friend.name}
                                fill
                                className="rounded-full object-cover"
                                loading="lazy"
                              />
                            </div>
                          ) : (
                            <div className="h-8 w-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0">
                              <UserIcon className="h-4 w-4 text-primary-600 dark:text-primary-400" />
                            </div>
                          )}
                          <div className="flex-1 truncate">
                            <p className="text-sm font-medium truncate">{friend.name}</p>
                            {friend.location && (
                              <p className="text-xs text-gray-500 truncate">{friend.location}</p>
                            )}
                          </div>
                        </div>
                      </DropdownMenuItem>
                    ))
                  )}
                </ScrollArea>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent className="p-0 flex-1 flex flex-col min-h-0 h-full overflow-hidden">
          <div className="flex-1 min-h-0 h-full overflow-hidden">
            <ScrollArea className="h-full w-full" type="always">
              {conversations.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  <p>No conversations yet</p>
                </div>
              ) : (
                <div className="space-y-1 p-4">{conversations.map((conversation) => (
                  <button
                    key={conversation.id}
                    onClick={() => setSelectedConversation(conversation)}
                    className={`w-full text-left p-3 rounded-lg transition ${
                      selectedConversation?.id === conversation.id
                        ? 'bg-primary-100 dark:bg-slate-800'
                        : 'hover:bg-gray-100 dark:hover:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {conversation.avatarUrl && (
                        <div className="relative h-10 w-10 flex-shrink-0">
                          <Image
                            src={conversation.avatarUrl}
                            alt={conversation.name}
                            fill
                            className="rounded-full object-cover"
                            loading="lazy"
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{conversation.name}</p>
                        <p className="text-xs text-gray-500 truncate">
                          {conversation.lastMessage.content.substring(0, 50)}
                        </p>
                      </div>
                      {conversation.unreadCount > 0 && (
                        <div className="flex-shrink-0 h-5 w-5 rounded-full bg-primary-500 flex items-center justify-center">
                          <span className="text-xs font-semibold text-white">
                            {conversation.unreadCount}
                          </span>
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </ScrollArea>
          </div>
        </CardContent>
      </Card>

      {/* Message View */}
      <Card className="lg:col-span-3 h-full min-h-0 flex flex-col">
        {selectedConversation ? (
          <>
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  {selectedConversation.avatarUrl && (
                    <div className="relative h-10 w-10">
                      <Image
                        src={selectedConversation.avatarUrl}
                        alt={selectedConversation.name}
                        fill
                        className="rounded-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  )}
                  <div>
                    <CardTitle className="text-lg">{selectedConversation.name}</CardTitle>
                  </div>
                </div>
                {isRefreshingMessages && (
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <LoaderIcon className="h-3 w-3 animate-spin" />
                    Refreshing
                  </div>
                )}
              </div>
            </CardHeader>

            <CardContent className="p-0 flex flex-col flex-1 min-h-0 h-full overflow-hidden">
              {error && (
                <Alert variant="destructive" className="m-4">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="flex-1 min-h-0 h-full overflow-hidden">
                <ScrollArea ref={messageScrollAreaRef} className="h-full w-full" type="always">
                  <div className="p-4 space-y-4">{messages.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">
                      <p>No messages yet. Start the conversation!</p>
                    </div>
                  ) : (
                    messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${
                            message.senderId === currentUserId
                              ? 'justify-end'
                              : 'justify-start'
                          }`}
                        >
                          <div
                            className={`max-w-xs px-4 py-2 rounded-lg ${
                              message.senderId === currentUserId
                                ? 'bg-primary-500 text-white rounded-br-none'
                                : 'bg-gray-100 dark:bg-slate-800 text-gray-900 dark:text-gray-100 rounded-bl-none'
                            }`}
                          >
                            <p className="text-sm break-words">{message.content}</p>
                            <div
                              className={`flex items-center justify-between gap-2 mt-1 ${
                                message.senderId === currentUserId
                                  ? 'text-primary-100'
                                  : 'text-gray-500'
                              }`}
                            >
                              <p className="text-xs">
                                {new Date(message.createdAt).toLocaleTimeString()}
                              </p>
                              {message.senderId === currentUserId && (
                                <span className="text-xs flex items-center gap-0.5">
                                  {message.isRead ? (
                                    <CheckCheck className="h-3 w-3" />
                                  ) : (
                                    <Check className="h-3 w-3" />
                                  )}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </div>

              {/* Message Input */}
              <div className="border-t p-4 flex-shrink-0">
                  <div className="flex gap-2">
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      placeholder="Type a message..."
                      disabled={isSending}
                      className="flex-1"
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim() || isSending}
                      size="sm"
                    >
                      {isSending ? (
                        <LoaderIcon className="h-4 w-4 animate-spin" />
                      ) : (
                        <SendIcon className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
            </CardContent>
          </>
        ) : (
          <CardContent className="flex items-center justify-center h-full">
            <p className="text-gray-500">Select a conversation to start messaging</p>
          </CardContent>
        )}
      </Card>
        </div>
    </div>
  );
}
