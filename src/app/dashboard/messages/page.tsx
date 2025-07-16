'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Send, Search, MoreVertical, Phone, Video, Paperclip, Smile } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { MessageService } from '@/services/messageService';
import { formatDate, formatRelativeTime, getErrorMessage } from '@/utils';
import { Message, Conversation } from '@/types';

function MessagesContent() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadConversations();
  }, [user]);

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation);
    }
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadConversations = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Mock conversations for demo
      const mockConversations: Conversation[] = [
        {
          id: '1',
          participants: [user.id, 'user1'],
          bookingId: 'booking1',
          lastMessage: 'Thank you for the excellent service!',
          lastMessageAt: { toDate: () => new Date(Date.now() - 3600000) } as any,
          unreadCount: { [user.id]: 0, user1: 1 },
          createdAt: { toDate: () => new Date(Date.now() - 86400000) } as any,
          updatedAt: { toDate: () => new Date(Date.now() - 3600000) } as any,
        },
        {
          id: '2',
          participants: [user.id, 'user2'],
          bookingId: 'booking2',
          lastMessage: 'What time works best for you?',
          lastMessageAt: { toDate: () => new Date(Date.now() - 7200000) } as any,
          unreadCount: { [user.id]: 2, user2: 0 },
          createdAt: { toDate: () => new Date(Date.now() - 172800000) } as any,
          updatedAt: { toDate: () => new Date(Date.now() - 7200000) } as any,
        },
        {
          id: '3',
          participants: [user.id, 'user3'],
          lastMessage: 'I\'ll be there at 2 PM',
          lastMessageAt: { toDate: () => new Date(Date.now() - 14400000) } as any,
          unreadCount: { [user.id]: 0, user3: 0 },
          createdAt: { toDate: () => new Date(Date.now() - 259200000) } as any,
          updatedAt: { toDate: () => new Date(Date.now() - 14400000) } as any,
        },
      ];
      
      setConversations(mockConversations);
      if (mockConversations.length > 0 && !selectedConversation) {
        setSelectedConversation(mockConversations[0].id);
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (conversationId: string) => {
    try {
      // Mock messages for demo
      const mockMessages: Message[] = [
        {
          id: '1',
          conversationId,
          senderId: conversationId === '1' ? 'user1' : user.id,
          content: 'Hi! I saw your cleaning service listing. Are you available this weekend?',
          type: 'text',
          isRead: true,
          createdAt: { toDate: () => new Date(Date.now() - 86400000) } as any,
        },
        {
          id: '2',
          conversationId,
          senderId: conversationId === '1' ? user.id : 'user2',
          content: 'Yes, I have availability on Saturday and Sunday. What time would work best for you?',
          type: 'text',
          isRead: true,
          createdAt: { toDate: () => new Date(Date.now() - 82800000) } as any,
        },
        {
          id: '3',
          conversationId,
          senderId: conversationId === '1' ? 'user1' : user.id,
          content: 'Saturday morning around 10 AM would be perfect. How long does a typical cleaning take?',
          type: 'text',
          isRead: true,
          createdAt: { toDate: () => new Date(Date.now() - 79200000) } as any,
        },
        {
          id: '4',
          conversationId,
          senderId: conversationId === '1' ? user.id : 'user2',
          content: 'For a standard 3-bedroom house, it usually takes about 2-3 hours. I\'ll bring all the necessary supplies.',
          type: 'text',
          isRead: conversationId !== '1',
          createdAt: { toDate: () => new Date(Date.now() - 3600000) } as any,
        },
      ];
      
      setMessages(mockMessages);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || !user) return;

    try {
      const messageContent = newMessage.trim();
      setNewMessage('');

      // Add message optimistically to UI
      const tempMessage: Message = {
        id: `temp-${Date.now()}`,
        conversationId: selectedConversation,
        senderId: user.id,
        content: messageContent,
        type: 'text',
        isRead: false,
        createdAt: { toDate: () => new Date() } as any,
      };

      setMessages(prev => [...prev, tempMessage]);

      // In real app: await MessageService.sendMessage(selectedConversation, user.id, messageContent);
      console.log('Sending message:', messageContent);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Mock user data
  const mockUsers: Record<string, any> = {
    user1: { 
      displayName: 'Sarah Johnson', 
      businessName: 'CleanPro Services',
      photoURL: null,
      isOnline: true 
    },
    user2: { 
      displayName: 'Mike Wilson', 
      businessName: 'Expert Plumbing',
      photoURL: null,
      isOnline: false 
    },
    user3: { 
      displayName: 'Emily Davis', 
      businessName: 'FitLife Training',
      photoURL: null,
      isOnline: true 
    },
  };

  const getOtherParticipant = (conversation: Conversation) => {
    const otherUserId = conversation.participants.find(id => id !== user?.id);
    return otherUserId ? mockUsers[otherUserId] : null;
  };

  const selectedConversationData = conversations.find(c => c.id === selectedConversation);
  const otherUser = selectedConversationData ? getOtherParticipant(selectedConversationData) : null;

  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-8rem)] flex">
        {/* Conversations List */}
        <div className="w-1/3 border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <h1 className="text-xl font-bold text-gray-900 mb-4">Messages</h1>
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations..."
              leftIcon={<Search className="h-4 w-4" />}
            />
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-4 space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="animate-pulse flex space-x-3">
                    <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : conversations.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <p>No conversations yet</p>
              </div>
            ) : (
              conversations
                .filter(conversation => {
                  if (!searchQuery) return true;
                  const otherUser = getOtherParticipant(conversation);
                  return otherUser?.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         otherUser?.businessName?.toLowerCase().includes(searchQuery.toLowerCase());
                })
                .map((conversation) => {
                  const otherUser = getOtherParticipant(conversation);
                  const unreadCount = conversation.unreadCount[user?.id || ''] || 0;
                  
                  return (
                    <div
                      key={conversation.id}
                      onClick={() => setSelectedConversation(conversation.id)}
                      className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                        selectedConversation === conversation.id ? 'bg-blue-50 border-blue-200' : ''
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-white">
                              {otherUser?.displayName?.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          {otherUser?.isOnline && (
                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {otherUser?.businessName || otherUser?.displayName}
                            </p>
                            {conversation.lastMessageAt && (
                              <p className="text-xs text-gray-500">
                                {formatRelativeTime(conversation.lastMessageAt.toDate())}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center justify-between">
                            <p className="text-sm text-gray-500 truncate">
                              {conversation.lastMessage}
                            </p>
                            {unreadCount > 0 && (
                              <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-500 rounded-full">
                                {unreadCount}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {selectedConversation && otherUser ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-white">
                        {otherUser.displayName?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    {otherUser.isOnline && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {otherUser.businessName || otherUser.displayName}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {otherUser.isOnline ? 'Online' : 'Offline'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm">
                    <Phone className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Video className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => {
                  const isOwn = message.senderId === user?.id;
                  
                  return (
                    <div
                      key={message.id}
                      className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        isOwn 
                          ? 'bg-primary text-white' 
                          : 'bg-gray-100 text-gray-900'
                      }`}>
                        <p className="text-sm">{message.content}</p>
                        <p className={`text-xs mt-1 ${
                          isOwn ? 'text-blue-100' : 'text-gray-500'
                        }`}>
                          {formatDate(message.createdAt.toDate(), 'p')}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-gray-200">
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm">
                    <Paperclip className="h-4 w-4" />
                  </Button>
                  <div className="flex-1">
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Type a message..."
                      className="border-0 focus:ring-0"
                    />
                  </div>
                  <Button variant="ghost" size="sm">
                    <Smile className="h-4 w-4" />
                  </Button>
                  <Button 
                    onClick={sendMessage}
                    disabled={!newMessage.trim()}
                    size="sm"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Send className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Select a conversation
                </h3>
                <p className="text-gray-500">
                  Choose a conversation from the list to start messaging
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

export default function MessagesPage() {
  return (
    <ProtectedRoute allowedRoles={['customer', 'service_provider']}>
      <MessagesContent />
    </ProtectedRoute>
  );
}
