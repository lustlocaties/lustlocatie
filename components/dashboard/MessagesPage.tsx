'use client';

import { useEffect, useState, useRef } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/shared/ui/card';
import { ContactCard } from './ContactCard';
import { Button } from '@/components/shared/ui/button';
import { Input } from '@/components/shared/ui/input';
import { Alert, AlertDescription } from '@/components/shared/ui/alert';
import { ScrollArea } from '@/components/shared/ui/scroll-area';
import Image from 'next/image';
import { SendIcon, LoaderIcon } from 'lucide-react';

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

interface Message {
  id: string;
  senderId: string;
  recipientId: string;
  content: string;
  isRead: boolean;
  createdAt: string;
}

export function MessagesPage({ currentUserId }: { currentUserId?: string }) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.id);
    }
  }, [selectedConversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchConversations = async () => {
    try {
      setIsLoading(true);
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
      setConversations(data.conversations || []);

      if (data.conversations?.length > 0) {
        setSelectedConversation(data.conversations[0]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load conversations');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMessages = async (userId: string) => {
    try {
      setError('');

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
      setMessages(data.messages || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load messages');
    }
  };

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

      // Refresh conversations to update last message
      await fetchConversations();
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
    <div className="w-[100vw]">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 space-y-6">
        <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-4 h-[600px]">
      {/* Conversations List */}
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle className="text-lg">Conversations</CardTitle>
          <CardDescription>{conversations.length} conversations</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[520px]">
            {conversations.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <p>No conversations yet</p>
              </div>
            ) : (
              <div className="space-y-1 p-4">
                {conversations.map((conversation) => (
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
        </CardContent>
      </Card>

      {/* Message View */}
      <Card className="lg:col-span-2">
        {selectedConversation ? (
          <>
            <CardHeader>
              <div className="flex items-center gap-3">
                {selectedConversation.avatarUrl && (
                  <div className="relative h-10 w-10">
                    <Image
                      src={selectedConversation.avatarUrl}
                      alt={selectedConversation.name}
                      fill
                      className="rounded-full object-cover"
                    />
                  </div>
                )}
                <div>
                  <CardTitle className="text-lg">{selectedConversation.name}</CardTitle>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              <div className="flex flex-col h-[480px]">
                {error && (
                  <Alert variant="destructive" className="m-4">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {messages.length === 0 ? (
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
                            <p
                              className={`text-xs mt-1 ${
                                message.senderId === currentUserId
                                  ? 'text-primary-100'
                                  : 'text-gray-500'
                              }`}
                            >
                              {new Date(message.createdAt).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                {/* Message Input */}
                <div className="border-t p-4">
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
        <ContactCard />
      </div>
    </div>
  );
}
