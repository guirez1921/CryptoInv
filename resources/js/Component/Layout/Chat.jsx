import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Minimize2, Maximize2, User, Shield, Clock } from 'lucide-react';
import { router, usePage } from '@inertiajs/react';
import Button from '@/component/UI/Button';
import Card from '@/component/UI/Card';

const FloatingChat = ({ auth, adminUser = null, initialMessages = [] }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState(initialMessages || []);
  const [isTyping, setIsTyping] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // const { auth } = usePage().props;
  const currentUser = auth?.user;

  // Initialize Echo connection
  useEffect(() => {
    // console.log(auth);
    if (window.Echo && currentUser) {
      try {
        // Listen for new messages in user's private channel
        window.Echo.private(`chat.${currentUser.id}`)
          .listen('.message.sent', (e) => {
            setMessages(prev => {
              // Only add if this message id does not already exist
              if (prev.some(msg => msg.id === e.chat.id)) return prev;
              return [...prev, e.chat];
            });
            // console.log('Message received:', e.chat);
            if (!isOpen) {
              setUnreadCount(prev => prev + 1);
            }
            // Play notification sound (optional)
            playNotificationSound();
          })
          .listen('UserTyping', (e) => {
            if (e.user.id !== currentUser.id) {
              setIsTyping(true);
              if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
              }
              typingTimeoutRef.current = setTimeout(() => {
                setIsTyping(false);
              }, 3000);
            }
          });

        setIsConnected(true);
      } catch (error) {
        console.error('Echo connection failed:', error);
        setIsConnected(false);
      }
    }

    return () => {
      if (window.Echo && currentUser) {
        window.Echo.leaveChannel(`chat.${currentUser.id}`);
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [currentUser, isOpen]);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Clear unread count when chat is opened
  useEffect(() => {
    if (isOpen) {
      setUnreadCount(0);
    }
  }, [isOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const playNotificationSound = () => {
    try {
      const audio = new Audio('/sounds/notification.mp3'); // Add notification sound file
      audio.volume = 0.3;
      audio.play().catch(() => { }); // Ignore if sound fails
    } catch (error) {
      // Silent fail if no sound file
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    if (isSending) return; // prevent duplicate sends
    setIsSending(true);

    const tempMessage = {
      id: Date.now(),
      content: message.trim(),
      user: currentUser,
      created_at: new Date().toISOString(),
      sending: true
    };

    setMessages(prev => [...prev, tempMessage]);
    setMessage('');

    try {
      // Send via fetch to avoid navigation and stay on the same page
      const url = route('chat.send');
      const tokenMeta = document.querySelector('meta[name="csrf-token"]');
      const csrf = tokenMeta ? tokenMeta.getAttribute('content') : '';

      const resp = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': csrf,
          'X-Requested-With': 'XMLHttpRequest',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ message: tempMessage.content })
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw err;
      }

      // On success remove temp message and rely on Echo to append the real one
      setMessages(prev => prev.filter(msg => msg.id !== tempMessage.id));
    } catch (error) {
      setMessages(prev => prev.filter(msg => msg.id !== tempMessage.id));
      console.error('Failed to send message:', error);
      // optionally show a toast or set an error state
    }
    finally {
      setIsSending(false);
    }
  };

  const handleTyping = () => {
    if (window.Echo && currentUser) {
      window.Echo.private(`chat.${currentUser.id}`)
        .whisper('typing', {
          user: currentUser
        });
    }
  };

  const toggleChat = () => {
    if (!isOpen) {
      // Load chat history when opening for the first time
      loadChatHistory();
    }
    setIsOpen(!isOpen);
    setIsMinimized(false);
  };

  const loadChatHistory = async () => {
    try {
      const response = await fetch(route('chat.history'));
      const data = await response.json();
      setMessages(data.messages || []);
    } catch (error) {
      console.error('Failed to load chat history:', error);
    }
  };

  const formatMessageTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    if (isToday) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const isAdmin = (user) => {
    return user?.role === 'admin' || user?.is_admin;
  };

  return (
    <>
      {/* Floating Chat Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={toggleChat}
          className={`relative w-14 h-14 rounded-full shadow-lg transition-all duration-300 ${isOpen ? 'bg-red-500 hover:bg-red-600' : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700'
            }`}
        >
          {isOpen ? (
            <X className="w-6 h-6 text-white" />
          ) : (
            <MessageSquare className="w-6 h-6 text-white" />
          )}

          {/* Unread Count Badge */}
          {unreadCount > 0 && !isOpen && (
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-xs font-bold text-white">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            </div>
          )}

          {/* Online Status Indicator */}
          <div className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-white ${isConnected ? 'bg-green-500' : 'bg-gray-500'
            }`}></div>
        </Button>
      </div>

      {/* Chat Window */}
      {isOpen && (
        <div className={`fixed flex flex-col bottom-24 right-6 w-96 bg-gray-800 border border-gray-700 rounded-lg shadow-2xl z-50 transition-all duration-300 ${isMinimized ? 'h-14' : 'h-2/3'
          }`}>
          {/* Chat Header */}
          <div className="flex-none flex items-center justify-between p-4 border-b border-gray-700 bg-gradient-to-r from-cyan-900/50 to-blue-900/50 rounded-t-lg">
            <div className="flex items-center space-x-3">
              <div className="relative">
                {adminUser ? (
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
                    <Shield className="w-4 h-4 text-white" />
                  </div>
                ) : (
                  <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-gray-300" />
                  </div>
                )}
                <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border border-gray-800 ${isConnected ? 'bg-green-500' : 'bg-gray-500'
                  }`}></div>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">
                  {adminUser ? `${adminUser.name} (Admin)` : 'Support Team'}
                </h3>
                <p className="text-xs text-gray-400">
                  {isConnected ? 'Online' : 'Connecting...'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMinimized(!isMinimized)}
                className="text-gray-400 hover:text-white"
              >
                {isMinimized ? (
                  <Maximize2 className="w-4 h-4" />
                ) : (
                  <Minimize2 className="w-4 h-4" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Messages Area */}
              <div className="flex-1 p-4 h-64 overflow-y-auto bg-gray-900/30">
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <MessageSquare className="w-12 h-12 text-gray-500 mb-3" />
                    <p className="text-gray-400 text-sm">Start a conversation</p>
                    <p className="text-gray-500 text-xs mt-1">We're here to help!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((msg, index) => {
                      // Defensive author extraction: server messages sometimes don't include a `user` object
                      const author = msg.user ?? (msg.user_id ? { id: msg.user_id, name: msg.user.name ?? msg.userName ?? 'User' } : { id: null, name: msg.username ?? 'System' });
                      const isOwn = author.id === currentUser?.id;
                      const text = msg.content ?? msg.message ?? msg.body ?? '';

                      return (
                        <div
                          key={msg.id || index}
                          className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`max-w-xs px-3 py-2 rounded-lg ${isOwn
                              ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white'
                              : 'bg-gray-700 text-gray-100'
                            } ${msg.sending ? 'opacity-60' : ''}`}>
                            {!isOwn && (
                              <div className="flex items-center space-x-2 mb-1">
                                <span className="text-xs font-medium text-gray-300">
                                  {isAdmin(author) ? `${author.name} (Admin)` : author.name}
                                </span>
                                {isAdmin(author) && (
                                  <Shield className="w-3 h-3 text-purple-400" />
                                )}
                              </div>
                            )}
                            <p className="text-sm">{text}</p>
                            <div className="flex items-center justify-end mt-1 space-x-1">
                              <Clock className="w-3 h-3 text-gray-400" />
                              <span className="text-xs text-gray-400">
                                {formatMessageTime(msg.created_at)}
                              </span>
                              {msg.sending && (
                                <span className="text-xs text-gray-400">Sending...</span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {/* Typing Indicator */}
                    {isTyping && (
                      <div className="flex justify-start">
                        <div className="bg-gray-700 px-3 py-2 rounded-lg">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          </div>
                        </div>
                      </div>
                    )}

                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>

              {/* Message Input */}
              <div className="flex-none p-4 border-t border-gray-700">
                <form onSubmit={handleSendMessage} className="flex space-x-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={message}
                    onChange={(e) => {
                      setMessage(e.target.value);
                      handleTyping();
                    }}
                    placeholder="Type your message..."
                    className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                  // disabled={!isConnected}
                  />
                  <Button
                    type="submit"
                    size="sm"
                    // disabled={!message.trim() || !isConnected}
                    className="px-3 py-2"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </form>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
};

export default FloatingChat;