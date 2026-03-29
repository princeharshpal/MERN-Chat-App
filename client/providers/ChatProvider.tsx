"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Chat, chatService } from "../services/chat.service";
import { Message, messageService } from "../services/message.service";
import { useAuth } from "./AuthProvider";

interface ChatContextType {
  chats: Chat[];
  selectedChat: Chat | null;
  messages: Message[];
  isLoadingChats: boolean;
  isLoadingMessages: boolean;
  setSelectedChat: (chat: Chat | null) => void;
  sendMessageInChat: (content: string) => Promise<void>;
  fetchChats: () => Promise<void>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const { user, socket } = useAuth();
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoadingChats, setIsLoadingChats] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);

  const fetchChats = async () => {
    if (!user) return;
    setIsLoadingChats(true);
    try {
      const data = await chatService.getMyChats();
      if (data.success) {
        setChats(data.chats);
      }
    } catch (err) {
      console.error("Failed to fetch chats", err);
    } finally {
      setIsLoadingChats(false);
    }
  };

  const fetchMessages = async (chatId: string) => {
    setIsLoadingMessages(true);
    try {
      const data = await messageService.getMessages(chatId);
      if (data.success) {
        setMessages(data.messages);
      }
    } catch (err) {
      console.error("Failed to fetch messages", err);
    } finally {
      setIsLoadingMessages(false);
    }
  };

  const sendMessageInChat = async (content: string) => {
    if (!selectedChat) return;
    try {
      const data = await messageService.sendMessage(selectedChat._id, content);
      if (data.success) {
        setMessages((prev) => [...prev, data.message]);
      }
    } catch (err) {
      console.error("Failed to send message", err);
    }
  };

  useEffect(() => {
    fetchChats();
  }, [user]);

  useEffect(() => {
    if (selectedChat) {
      fetchMessages(selectedChat._id);
    } else {
      setMessages([]);
    }
  }, [selectedChat]);

  useEffect(() => {
    if (!socket) return;

    socket.on("NEW_MESSAGE", (message: Message) => {
      if (selectedChat && message.chat === selectedChat._id) {
        setMessages((prev) => [...prev, message]);
      }
      
      setChats((prev) => {
        return prev.map((chat) => {
          if (chat._id === message.chat) {
            return { ...chat, lastMessage: message.content };
          }
          return chat;
        });
      });
    });

    return () => {
      socket.off("NEW_MESSAGE");
    };
  }, [socket, selectedChat]);

  return (
    <ChatContext.Provider
      value={{
        chats,
        selectedChat,
        messages,
        isLoadingChats,
        isLoadingMessages,
        setSelectedChat,
        sendMessageInChat,
        fetchChats,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
};
