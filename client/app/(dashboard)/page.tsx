"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Avatar,
  Button,
  Chip,
  ScrollShadow,
  Input,
  InputGroup,
  Spinner,
} from "@heroui/react";
import { RiChatNewLine } from "react-icons/ri";
import { IoMdMore } from "react-icons/io";
import { FiSearch, FiPaperclip, FiMic } from "react-icons/fi";
import { BsEmojiSmile, BsCameraVideo, BsSearch } from "react-icons/bs";
import { IoCheckmarkDoneSharp } from "react-icons/io5";
import { getMessages } from "@/src/services/message.service";
import { getFriends } from "@/src/services/connection.service";
import { getAvatarUrl } from "@/src/utils/avatar";
import { useAppSelector } from "@/src/store/hooks";
import { connectSocket, getSocket } from "@/src/lib/socket";
import axiosInstance from "@/src/lib/axios";

const ChatItem = ({
  friend,
  isActive,
  onClick,
  hasStory,
  unreadCount,
}: {
  friend: any;
  isActive?: boolean;
  onClick: () => void;
  hasStory?: boolean;
  unreadCount?: number;
}) => (
  <div
    onClick={onClick}
    className={`flex items-center gap-3 p-2 cursor-pointer transition-all hover:bg-gray-300/5 ${
      isActive ? "shadow-sm border-l-3 border-primary bg-primary/10" : ""
    }`}
  >
    <div className="relative group">
      <Avatar.Root
        size="md"
        className={`shrink-0 transition-transform group-hover:scale-105 ${hasStory ? "border-2 border-accent p-0.5" : ""}`}
      >
        <Avatar.Image src={getAvatarUrl(friend.profilePic, friend.fullName)} />
        <Avatar.Fallback className="bg-primary/10 text-primary font-bold">
          {friend.fullName[0]}
        </Avatar.Fallback>
      </Avatar.Root>
      {hasStory && (
        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-accent rounded-full border-2 border-background"></div>
      )}
    </div>

    <div className="flex-1 min-w-0">
      <div className="flex justify-between items-center mb-1">
        <h3
          className={`font-bold text-sm truncate uppercase tracking-tight ${isActive ? "text-primary" : "text-foreground"}`}
        >
          {friend.fullName}
        </h3>
        <span
          className={`text-[9px] ${unreadCount ? "text-secondary font-bold" : "text-default-400"}`}
        >
          12:18
        </span>
      </div>
      <div className="flex justify-between items-center">
        <p className="text-[11px] text-default-500 truncate font-medium opacity-80 uppercase tracking-tighter">
          {unreadCount ? "Newly received message..." : "See you later!"}
        </p>
        <div className="flex items-center gap-1.5">
          {unreadCount ? (
            <div className="bg-secondary text-white text-[9px] font-bold min-w-[16px] h-4 flex items-center justify-center rounded-full px-1 shadow-sm">
              {unreadCount}
            </div>
          ) : (
            <IoCheckmarkDoneSharp className="text-primary/60 text-xs" />
          )}
        </div>
      </div>
    </div>
  </div>
);

const Page = () => {
  const [activeChat, setActiveChat] = useState<any>(null);
  const [message, setMessage] = useState("");
  const [friends, setFriends] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [seenAt, setSeenAt] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [isLoadingFriends, setIsLoadingFriends] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAppSelector((state) => state.auth);

  const PRIMARY_COLOR = "#7B4B94";

  useEffect(() => {
    if (!user?._id) return;
    const socket = connectSocket(user._id);

    socket.on("newMessage", (msg: any) => {
      setMessages((prev) => [...prev, msg]);
    });

    socket.on("messageSaved", (msg: any) => {
      setMessages((prev) => {
        const exists = prev.find((m) => m._id === msg._id);
        if (exists) return prev;
        const withoutOptimistic = prev.filter((m) => m._tempId !== msg._tempId);
        return [...withoutOptimistic, msg];
      });
    });

    socket.on("messageSeen", ({ receiverId, seenAt: seenTime }: any) => {
      setSeenAt(seenTime);
      setMessages((prev) =>
        prev.map((m) =>
          m.senderId === user._id && m.receiverId === receiverId && !m.isSeen
            ? { ...m, isSeen: true, seenAt: seenTime }
            : m,
        ),
      );
    });

    return () => {
      socket.off("newMessage");
      socket.off("messageSaved");
      socket.off("messageSeen");
    };
  }, [user?._id]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoadingFriends(true);
      const friendsRes = await getFriends();
      if (friendsRes.success) {
        setFriends(friendsRes.data);
        if (friendsRes.data.length > 0) setActiveChat(friendsRes.data[0]);
      }
      setIsLoadingFriends(false);
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (!activeChat) return;
    const fetchMessages = async () => {
      setMessages([]); // Clear previous messages to avoid flash
      setIsLoadingMessages(true);
      const data = await getMessages(activeChat._id);
      if (data.success) {
        setMessages(data.data);
        const lastSeen = [...data.data]
          .reverse()
          .find((m: any) => m.senderId === user?._id && m.isSeen);
        setSeenAt(lastSeen?.seenAt || null);
      }
      setIsLoadingMessages(false);
    };
    fetchMessages();

    const socket = getSocket();
    if (socket) {
      socket.emit("markAsSeen", { senderId: activeChat._id });
    }
  }, [activeChat]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = () => {
    if (!message.trim()) return;
    const socket = getSocket();
    if (!socket) return;

    socket.emit("sendMessage", {
      receiverId: activeChat._id,
      text: message.trim(),
    });

    const optimisticMsg = {
      _tempId: Date.now().toString(),
      senderId: user?._id,
      receiverId: activeChat._id,
      text: message.trim(),
      createdAt: new Date().toISOString(),
      isSeen: false,
    };
    setMessages((prev) => [...prev, optimisticMsg]);
    setMessage("");
    setSeenAt(null);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const socket = getSocket();
    if (!socket) return;

    setUploading(true);
    try {
      const formData = new FormData();
      for (let i = 0; i < files.length; i++) {
        formData.append("attachments", files[i]);
      }
      const response = await axiosInstance.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data.success) {
        const urls: string[] = response.data.data.urls || [
          response.data.data.url,
        ];
        for (const url of urls) {
          socket.emit("sendMessage", {
            receiverId: activeChat._id,
            image: url,
          });
          const optimisticMsg = {
            _tempId: Date.now().toString() + url,
            senderId: user?._id,
            receiverId: activeChat._id,
            image: url,
            createdAt: new Date().toISOString(),
            isSeen: false,
          };
          setMessages((prev) => [...prev, optimisticMsg]);
        }
      }
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const lastSentMessageIndex = [...messages]
    .reverse()
    .findIndex((m) => m.senderId === user?._id);
  const lastSentMessagePos =
    lastSentMessageIndex >= 0 ? messages.length - 1 - lastSentMessageIndex : -1;

  return (
    <div className="flex w-full h-full bg-background overflow-hidden font-sans">
      <input
        type="file"
        multiple
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileUpload}
      />

      <div className="w-full max-w-[400px] border-r border-divider flex flex-col bg-content1/50 backdrop-blur-md transition-all duration-300">
        <div className="p-3 space-y-3">
          <div className="flex items-center justify-between">
            <h1 className="text-4xl font-bold text-foreground">Chats</h1>

            <div className="flex gap-1">
              <Button
                isIconOnly
                variant="ghost"
                className="text-xl text-default-500"
              >
                <IoMdMore />
              </Button>
            </div>
          </div>

          <InputGroup
            fullWidth
            className="h-12 overflow-hidden bg-content2/30 rounded-2xl transition-all border border-transparent focus-within:border-primary shadow-sm group"
          >
            <InputGroup.Prefix className="px-4">
              <FiSearch className="text-default-400 group-focus-within:text-primary transition-colors text-lg" />
            </InputGroup.Prefix>
            <InputGroup.Input
              placeholder="Search chats"
              className="outline-none border-none text-xs font-bold uppercase tracking-widest placeholder:text-default-400"
            />
          </InputGroup>

          <div className="flex gap-2">
            <Chip
              color="warning"
              variant="soft"
              className="font-bold uppercase text-[10px]"
            >
              All
            </Chip>
            <Chip
              color="warning"
              variant="soft"
              className="font-bold uppercase text-[10px]"
            >
              Unread
            </Chip>
          </div>
        </div>

        <ScrollShadow className="flex-1 w-full">
          {isLoadingFriends ? (
            <div className="flex items-center justify-center p-20">
              <Spinner
                size="xl"
                color="current"
                style={{ color: PRIMARY_COLOR }}
              />
            </div>
          ) : (
            friends.map((friend, i) => (
              <ChatItem
                key={friend._id}
                friend={friend}
                isActive={activeChat?._id === friend._id}
                onClick={() => setActiveChat(friend)}
                hasStory={i === 0 || i === 2}
                unreadCount={i === 1 ? 2 : 0}
              />
            ))
          )}
        </ScrollShadow>
      </div>

      <div className="flex-1 flex flex-col relative w-full bg-background">
        {activeChat ? (
          <>
            <header className="h-16 border-b border-divider bg-content1/80 backdrop-blur-md flex items-center justify-between px-6 z-20 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Avatar.Root size="sm" className="shadow-sm">
                    <Avatar.Image
                      src={getAvatarUrl(
                        activeChat.profilePic,
                        activeChat.fullName,
                      )}
                    />
                    <Avatar.Fallback className="text-primary font-bold">
                      {activeChat.fullName[0]}
                    </Avatar.Fallback>
                  </Avatar.Root>

                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-success rounded-full border-2 border-background"></div>
                </div>

                <div>
                  <h2 className="text-sm font-bold text-foreground">
                    {activeChat.fullName}
                  </h2>

                  <p className="text-[10px] text-success font-bold uppercase tracking-widest opacity-80">
                    Online Now
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <Button
                  isIconOnly
                  variant="ghost"
                  style={{ color: PRIMARY_COLOR }}
                >
                  <BsCameraVideo className="text-xl" />
                </Button>

                <Button
                  isIconOnly
                  variant="ghost"
                  className="text-default-400 hover:text-primary"
                >
                  <BsSearch className="text-xl" />
                </Button>

                <Button
                  isIconOnly
                  variant="ghost"
                  className="text-default-400 hover:text-primary"
                >
                  <IoMdMore className="text-xl" />
                </Button>
              </div>
            </header>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-background relative flex flex-col w-full">
              <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none bg-[url('https://static.whatsapp.net/rsrc.php/v3/y6/r/wa669ae5dbc.png')] bg-repeat"></div>

              {isLoadingMessages ? (
                <div className="relative z-10 flex-1 flex flex-col items-center justify-center h-full">
                  <Spinner
                    size="xl"
                    style={{ color: PRIMARY_COLOR }}
                  />
                </div>
              ) : (
                <div className="relative z-10 w-full flex flex-col space-y-4">
                  {messages.map((msg: any, idx: number) => {
                    const isMe = msg.senderId !== activeChat._id;
                    const isLastSent = idx === lastSentMessagePos;

                    return (
                      <div
                        key={msg._id || msg._tempId}
                        className={`flex flex-col ${isMe ? "items-end" : "items-start"} w-full animate-in fade-in slide-in-from-bottom-2 duration-300`}
                      >
                        <div className="flex items-center gap-1">
                          {!isMe && (
                            <Avatar size="sm" className="self-end mb-1">
                              <Avatar.Image
                                src={getAvatarUrl(
                                  activeChat.profilePic,
                                  activeChat.fullName,
                                )}
                              />
                              <Avatar.Fallback className="text-primary font-bold">
                                {activeChat.fullName[0]}
                              </Avatar.Fallback>
                            </Avatar>
                          )}

                          <div
                            className={`${
                              isMe
                                ? "bg-primary text-white rounded-xl shadow-md"
                                : "bg-soft text-black rounded-xl shadow-sm"
                            } p-2 max-w-[80%] md:max-w-[70%] text-[10px] uppercase font-bold tracking-tight shadow-sm`}
                          >
                            {msg.image && (
                              <img
                                src={msg.image}
                                alt="attachment"
                                className="max-w-full rounded-xl mb-1 max-h-64 object-cover"
                              />
                            )}
                            {msg.text && (
                              <p className="text-sm leading-relaxed font-medium whitespace-pre-wrap">
                                {msg.text}
                              </p>
                            )}
                            <div className="flex items-center justify-end gap-1.5 mt-1 opacity-60">
                              <span className="text-[9px] font-bold uppercase">
                                {new Date(msg.createdAt).toLocaleTimeString(
                                  [],
                                  { hour: "2-digit", minute: "2-digit" },
                                )}
                              </span>
                              {isMe && (
                                <IoCheckmarkDoneSharp
                                  className={`text-xs ${msg.isSeen ? "text-primary" : "text-white/60"}`}
                                />
                              )}
                            </div>
                          </div>
                        </div>

                        {isMe && isLastSent && seenAt && (
                          <p className="text-[9px] text-default-400 mt-1 mr-1 font-medium italic">
                            Seen at{" "}
                            {new Date(seenAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        )}
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            <footer className="p-4 bg-content1/90 backdrop-blur-3xl border-t border-divider flex items-center gap-3">
              <Button
                isIconOnly
                variant="ghost"
                className="text-default-400 text-xl hover:text-primary transition-colors"
              >
                <BsEmojiSmile />
              </Button>
              <Button
                isIconOnly
                variant="ghost"
                className="text-default-400 text-xl hover:text-primary transition-colors"
                onPress={() => fileInputRef.current?.click()}
                isLoading={uploading}
              >
                <FiPaperclip />
              </Button>
              <div className="flex-1 relative flex items-center">
                <Input
                  variant="primary"
                  color="default"
                  placeholder="Type a message..."
                  className="w-full bg-content2/50 rounded-xl"
                  classNames={{
                    input: "outline-none",
                    inputWrapper:
                      "border-transparent focus-within:border-primary",
                  }}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyUp={(e) => e.key === "Enter" && handleSendMessage()}
                />
              </div>
              <Button
                isIconOnly
                className={`transition-all duration-300 active:scale-90 ${message ? "bg-primary text-white shadow-lg shadow-primary/20" : "bg-transparent text-default-400"}`}
                onPress={handleSendMessage}
              >
                {message ? (
                  <RiChatNewLine className="text-xl" />
                ) : (
                  <FiMic className="text-xl" />
                )}
              </Button>
            </footer>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center bg-background p-10 animate-in fade-in zoom-in-95 duration-1000">
            <div className="w-20 h-20 rounded-3xl bg-primary/5 flex items-center justify-center mb-8 shadow-inner shadow-primary/10">
              <RiChatNewLine className="text-4xl text-primary animate-pulse" />
            </div>

            <h2 className="text-4xl font-bold text-foreground tracking-tight">
              Nexus Chat
            </h2>

            <div className="w-12 h-0.5 bg-secondary rounded-full my-4"></div>

            <p className="text-default-400 text-sm font-medium opacity-70 text-center max-w-xs leading-relaxed uppercase tracking-widest">
              Pick a conversation or start a new one to begin your secure
              experience.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Page;
