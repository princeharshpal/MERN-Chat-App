"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Avatar,
  Button,
  Chip,
  ScrollShadow,
  Input,
  Modal,
  Badge,
  Spinner,
  Popover,
  Dropdown,
  Tooltip,
  Checkbox,
  CheckboxGroup,
} from "@heroui/react";
import { RiChatNewLine, RiReplyLine, RiShareForwardLine } from "react-icons/ri";
import { FiSearch, FiPaperclip, FiMic } from "react-icons/fi";
import { BsEmojiSmile, BsCameraVideo, BsSearch } from "react-icons/bs";
import {
  MdEdit,
  MdDelete,
  MdStarBorder,
  MdPushPin,
  MdInbox,
  MdLink,
  MdReply,
  MdInfo,
} from "react-icons/md";
import { IoMdCopy } from "react-icons/io";
import { getMessages, getChatMeta } from "@/src/services/message.service";
import { getFriends } from "@/src/services/connection.service";
import { getGroups, createGroup } from "@/src/services/group.service";
import { getAvatarUrl } from "@/src/utils/avatar";
import { useAppSelector, useAppDispatch } from "@/src/store/hooks";
import { connectSocket, getSocket } from "@/src/lib/socket";
import axiosInstance from "@/src/lib/axios";
import {
  addMessage,
  deleteMessage,
  setMessages,
  updateMessage,
  updateReactions,
  setLoading,
  clearMessages,
} from "@/src/store/slices/messageSlice";
import { setOnlineUsers } from "@/src/store/slices/authSlice";
import { IoMdMore } from "react-icons/io";
import moment from "moment";
import MessageItem from "./MessageItem";

const ChatItem = ({
  friend,
  isActive,
  onClick,
  hasStory,
  unreadCount,
  isOnline,
  lastMessage,
  isTyping,
}: {
  friend: any;
  isActive?: boolean;
  onClick: () => void;
  hasStory?: boolean;
  unreadCount?: number;
  isOnline?: boolean;
  lastMessage?: {
    text?: string;
    image?: string;
    senderId?: string;
    createdAt?: string;
  };
  isTyping?: boolean;
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
        <Avatar.Image
          src={
            friend.isGroup
              ? friend.profilePic
              : getAvatarUrl(friend.profilePic, friend.fullName)
          }
        />
        <Avatar.Fallback className="bg-primary/10 text-primary font-bold">
          {friend.fullName?.[0]}
        </Avatar.Fallback>
      </Avatar.Root>
      {isOnline && (
        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-success rounded-full border-2 border-background z-10"></div>
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
          {lastMessage?.createdAt
            ? moment(lastMessage.createdAt).format("LT")
            : ""}
        </span>
      </div>
      <div className="flex justify-between items-center">
        <p className="text-[11px] text-default-500 truncate font-medium opacity-80 tracking-tighter max-w-[180px]">
          {isTyping ? (
            <span className="text-primary italic">typing...</span>
          ) : lastMessage?.image ? (
            "📷 Photo"
          ) : lastMessage?.text ? (
            lastMessage.text
          ) : (
            "Start a conversation"
          )}
        </p>
        <div className="flex items-center gap-1.5">
          {unreadCount && unreadCount > 0 ? (
            <div className="bg-secondary text-white text-[9px] font-bold min-w-[16px] h-4 flex items-center justify-center rounded-full px-1 shadow-sm">
              {unreadCount > 9 ? "9+" : unreadCount}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  </div>
);

const Page = () => {
  const dispatch = useAppDispatch();
  const [activeChat, setActiveChat] = useState<any>(null);
  const [message, setMessage] = useState("");
  const [friends, setFriends] = useState<any[]>([]);
  const { messages, isLoading: isLoadingMessages } = useAppSelector(
    (state) => state.messages,
  );
  const [seenAt, setSeenAt] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [isLoadingFriends, setIsLoadingFriends] = useState(true);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [replyingTo, setReplyingTo] = useState<any>(null);
  const [chatMeta, setChatMeta] = useState<
    Record<string, { lastMessage: any; unreadCount: number }>
  >({});
  const [typingUsers, setTypingUsers] = useState<Record<string, boolean>>({});
  const [filter, setFilter] = useState<"all" | "unread" | "groups">("all");
  const [groups, setGroups] = useState<any[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const onCreateModalOpen = () => setIsCreateModalOpen(true);
  const onCreateModalOpenChange = (val?: boolean) =>
    setIsCreateModalOpen(val ?? !isCreateModalOpen);
  const [groupName, setGroupName] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimerRef = useRef<any>(null);
  const editInputRef = useRef<HTMLInputElement>(null);
  const { user, onlineUsers, isCheckingAuth } = useAppSelector(
    (state) => state.auth,
  );

  const PRIMARY_COLOR = "#7B4B94";

  const activeChatRef = useRef<any>(null);
  useEffect(() => {
    activeChatRef.current = activeChat;
  }, [activeChat]);

  useEffect(() => {
    if (!user?._id) return;
    const socket = connectSocket(user._id);

    socket.on("connect", () => {
      console.log("[Socket] Connected:", socket.id);
    });

    socket.on("connect_error", (error) => {
      console.error("[Socket] Connection error:", error);
    });

    socket.on("getOnlineUsers", (users: string[]) => {
      dispatch(setOnlineUsers(users));
    });

    socket.on("newMessage", (msg: any) => {
      dispatch(addMessage(msg));

      const friendId =
        msg.groupId ||
        (msg.senderId === user._id ? msg.receiverId : msg.senderId);

      setChatMeta((prev) => {
        const existing = prev[friendId] || {
          lastMessage: null,
          unreadCount: 0,
        };
        const isActiveChat = activeChatRef.current?._id === friendId;
        return {
          ...prev,
          [friendId]: {
            lastMessage: {
              text: msg.text,
              image: msg.image,
              senderId: msg.senderId,
              createdAt: msg.createdAt,
            },
            unreadCount:
              msg.senderId !== user._id && !isActiveChat
                ? existing.unreadCount + 1
                : existing.unreadCount,
          },
        };
      });

      if (
        !msg.groupId &&
        msg.senderId !== user._id &&
        activeChatRef.current?._id === msg.senderId
      ) {
        socket.emit("markAsSeen", { senderId: msg.senderId });
      }
    });

    socket.on("messageSaved", (msg: any) => {
      dispatch(
        updateMessage({
          messageId: msg.tempId,
          text: msg.text,
          isEdited: false,
          newId: msg._id,
        }),
      );
    });

    socket.on("messageSeen", ({ receiverId, seenAt: seenTime }: any) => {
      setSeenAt(seenTime);
    });

    socket.on("messageEdited", ({ messageId, text }: any) => {
      dispatch(updateMessage({ messageId, text, isEdited: true }));
    });

    socket.on("messageUnsent", ({ messageId }: any) => {
      dispatch(deleteMessage(messageId));
    });

    socket.on("messageReactionUpdate", ({ messageId, userId, emoji }: any) => {
      dispatch(updateReactions({ messageId, userId, emoji }));
    });

    socket.on("userTyping", ({ senderId, groupId }: any) => {
      const targetId = groupId || senderId;
      setTypingUsers((prev) => ({ ...prev, [targetId]: true }));
    });

    socket.on("userStopTyping", ({ senderId, groupId }: any) => {
      const targetId = groupId || senderId;
      setTypingUsers((prev) => ({ ...prev, [targetId]: false }));
    });

    return () => {
      socket.off("getOnlineUsers");
      socket.off("newMessage");
      socket.off("messageSaved");
      socket.off("messageSeen");
      socket.off("messageEdited");
      socket.off("messageUnsent");
      socket.off("messageReactionUpdate");
      socket.off("userTyping");
      socket.off("userStopTyping");
    };
  }, [user?._id, dispatch]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoadingFriends(true);
      const [friendsRes, groupsRes] = await Promise.all([
        getFriends(),
        getGroups(),
      ]);

      if (friendsRes.success) {
        setFriends(friendsRes.data);
      }
      if (groupsRes.success) {
        const normalizedGroups = groupsRes.data.map((g: any) => ({
          ...g,
          fullName: g.name,
          profilePic: g.groupIcon || "",
          isGroup: true,
        }));
        setGroups(normalizedGroups);

        const socket = getSocket();
        if (socket) {
          normalizedGroups.forEach((g: any) => {
            socket.emit("joinGroup", { groupId: g._id });
          });
        }
      }
      setIsLoadingFriends(false);

      try {
        const metaRes = await getChatMeta();
        if (metaRes.success) {
          setChatMeta(metaRes.data);
        }
      } catch (err) {
        console.error("Failed to fetch chat meta:", err);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (!activeChat) return;
    const fetchMessages = async () => {
      dispatch(clearMessages());
      dispatch(setLoading(true));
      const data = await getMessages(activeChat._id);
      if (data.success) {
        dispatch(setMessages(data.data));
        const lastSeen = [...data.data]
          .reverse()
          .find((m: any) => m.senderId === user?._id && m.isSeen);
        setSeenAt(lastSeen?.seenAt || null);
      }
      dispatch(setLoading(false));
    };
    fetchMessages();

    const socket = getSocket();
    if (socket) {
      socket.emit("markAsSeen", { senderId: activeChat._id });
    }
    setChatMeta((prev) => ({
      ...prev,
      [activeChat._id]: {
        ...prev[activeChat._id],
        unreadCount: 0,
      },
    }));
  }, [activeChat, dispatch, user?._id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (editingMessageId && editInputRef.current) {
      editInputRef.current.focus();
    }
  }, [editingMessageId]);

  const handleSendMessage = () => {
    if (!message.trim()) return;
    let socket = getSocket();
    if (!socket?.connected) {
      if (user?._id) socket = connectSocket(user._id);
    }
    if (!socket?.connected) return;

    const tempId = Date.now().toString();

    const optimisticMsg: any = {
      _id: tempId,
      tempId: tempId,
      senderId: user?._id,
      text: message.trim(),
      createdAt: new Date().toISOString(),
      isSeen: false,
      updatedAt: new Date().toISOString(),
    };

    if (activeChat.isGroup) {
      optimisticMsg.groupId = activeChat._id;
    } else {
      optimisticMsg.receiverId = activeChat._id;
    }

    if (replyingTo) {
      optimisticMsg.replyTo = {
        _id: replyingTo._id,
        text: replyingTo.text,
        senderId: replyingTo.senderId,
      };
    }

    dispatch(addMessage(optimisticMsg));

    socket.emit("sendMessage", {
      receiverId: !activeChat.isGroup ? activeChat._id : undefined,
      groupId: activeChat.isGroup ? activeChat._id : undefined,
      text: message.trim(),
      tempId: tempId,
      createdAt: new Date().toISOString(),
      senderId: user?._id,
      replyTo: replyingTo?._id,
    });

    setMessage("");
    setReplyingTo(null);
    setSeenAt(null);
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    socket.emit("stopTyping", { receiverId: activeChat._id });
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim() || selectedMembers.length < 2) return;
    setIsCreatingGroup(true);
    try {
      const res = await createGroup({
        name: groupName,
        members: selectedMembers,
        description: "",
      });
      if (res.success) {
        const newGroup = {
          ...res.data,
          fullName: res.data.name,
          profilePic: res.data.groupIcon || "",
          isGroup: true,
        };
        setGroups((prev) => [...prev, newGroup]);
        onCreateModalOpenChange();
        setGroupName("");
        setSelectedMembers([]);
        getSocket()?.emit("joinGroup", { groupId: res.data._id });
      }
    } catch (err) {
      console.error("Failed to create group:", err);
    } finally {
      setIsCreatingGroup(false);
    }
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
            createdAt: new Date().toISOString(),
            senderId: user?._id,
          });
        }
      }
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleEditMessage = (messageId: string, text: string) => {
    dispatch(updateMessage({ messageId, text, isEdited: true }));
    getSocket()?.emit("editMessage", {
      messageId,
      text,
      receiverId: !activeChat.isGroup ? activeChat._id : undefined,
      groupId: activeChat.isGroup ? activeChat._id : undefined,
    });
    setEditingMessageId(null);
    setEditText("");
  };

  const handleUnsendMessage = (messageId: string) => {
    dispatch(deleteMessage(messageId));
    getSocket()?.emit("unsendMessage", {
      messageId,
      receiverId: !activeChat.isGroup ? activeChat._id : undefined,
      groupId: activeChat.isGroup ? activeChat._id : undefined,
    });
  };

  const handleAddReaction = (messageId: string, emoji: string) => {
    dispatch(updateReactions({ messageId, userId: user._id, emoji }));
    getSocket()?.emit("addReaction", {
      messageId,
      emoji,
      receiverId: activeChat._id,
    });
  };

  const handleCopyMessage = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      console.log("Message copied to clipboard");
    });
  };

  const handleStartEdit = (msg: any) => {
    setEditingMessageId(msg._id);
    setEditText(msg.text || "");
  };

  const handleStartReply = (msg: any) => {
    setReplyingTo(msg);
  };

  const lastSentMessageIndex = [...messages].reverse().findIndex((m) => {
    const sender = typeof m.senderId === "object" ? (m.senderId as any)._id : m.senderId;
    return sender === user?._id;
  });
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
              <Dropdown placement="bottom-end">
                <Dropdown.Trigger>
                  <Button
                    isIconOnly
                    variant="ghost"
                    className="text-xl text-default-500"
                  >
                    <IoMdMore />
                  </Button>
                </Dropdown.Trigger>
                <Dropdown.Popover>
                  <Dropdown.Menu aria-label="Chat Actions">
                    <Dropdown.Item key="new_chat">New Chat</Dropdown.Item>
                    <Dropdown.Item key="new_group" onPress={() => onCreateModalOpen()}>
                      New Group
                    </Dropdown.Item>
                    <Dropdown.Item key="settings">Settings</Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown.Popover>
              </Dropdown>
            </div>
          </div>

          <div className="h-12 overflow-hidden bg-content2/30 rounded-2xl transition-all border border-transparent focus-within:border-primary shadow-sm group flex items-center">
            <div className="px-4">
              <FiSearch className="text-default-400 group-focus-within:text-primary transition-colors text-lg" />
            </div>
            <input
              placeholder="Search chats"
              className="outline-none border-none text-xs font-bold uppercase tracking-widest placeholder:text-default-400 bg-transparent w-full"
            />
          </div>

          <div className="flex gap-2">
            <Chip
              color={filter === "all" ? "warning" : "default"}
              variant={filter === "all" ? "solid" : "flat"}
              className="font-bold uppercase text-[10px] cursor-pointer"
              onClick={() => setFilter("all")}
            >
              All
            </Chip>
            <Chip
              color={filter === "unread" ? "warning" : "default"}
              variant={filter === "unread" ? "solid" : "flat"}
              className="font-bold uppercase text-[10px] cursor-pointer"
              onClick={() => setFilter("unread")}
            >
              Unread
            </Chip>
            <Chip
              color={filter === "groups" ? "warning" : "default"}
              variant={filter === "groups" ? "solid" : "flat"}
              className="font-bold uppercase text-[10px] cursor-pointer"
              onClick={() => setFilter("groups")}
            >
              Groups
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
            (() => {
              const displayList = [
                ...friends.map((f) => ({ ...f, type: "private" })),
                ...groups.map((g) => ({ ...g, type: "group" })),
              ].filter((item) => {
                if (filter === "unread")
                  return (chatMeta[item._id]?.unreadCount || 0) > 0;
                if (filter === "groups") return item.type === "group";
                return true;
              });

              return displayList.map((item, i) => (
                <ChatItem
                  key={item._id}
                  friend={item}
                  isActive={activeChat?._id === item._id}
                  onClick={() => setActiveChat(item)}
                  hasStory={item.type === "private" && (i === 0 || i === 2)}
                  unreadCount={chatMeta[item._id]?.unreadCount || 0}
                  isOnline={
                    item.type === "private"
                      ? onlineUsers.includes(item._id)
                      : false
                  }
                  lastMessage={chatMeta[item._id]?.lastMessage}
                  isTyping={typingUsers[item._id] || false}
                />
              ));
            })()
          )}
        </ScrollShadow>
      </div>

      <div className="flex-1 flex flex-col relative w-full bg-background">
        {activeChat ? (
          <>
            <header className="h-16 border-b border-divider bg-content1/80 backdrop-blur-md flex items-center justify-between px-6 z-20 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Avatar.Root className="shadow-sm">
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

                  {onlineUsers.includes(activeChat._id) && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-success rounded-full border-2 border-background"></div>
                  )}
                </div>

                <div>
                  <h2 className="text-sm font-bold text-foreground">
                    {activeChat.fullName}
                  </h2>
                  {typingUsers[activeChat._id] ? (
                    <p className="text-[10px] text-primary italic animate-pulse">
                      typing...
                    </p>
                  ) : onlineUsers.includes(activeChat._id) ? (
                    <p className="text-[10px] text-success">online</p>
                  ) : null}
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

            <div className="flex-1 overflow-y-auto space-y-3 bg-background flex flex-col w-full">
              {isLoadingMessages ? (
                <div className="z-10 flex-1 flex flex-col items-center justify-center h-full">
                  <Spinner size="xl" style={{ color: PRIMARY_COLOR }} />
                </div>
              ) : (
                <div className="relative z-10 flex-1 flex flex-col space-y-2 p-3">
                  {messages.map((msg: any, idx: number) => (
                    <MessageItem
                      key={msg._id || msg.tempId || idx}
                      msg={msg}
                      user={user}
                      activeChat={activeChat}
                      isMe={(msg.senderId?._id || msg.senderId) === user?._id}
                      isLastSent={idx === lastSentMessagePos}
                      seenAt={seenAt}
                      onReply={handleStartReply}
                      onEdit={handleStartEdit}
                      onUnsend={handleUnsendMessage}
                      onCopy={handleCopyMessage}
                      onReaction={handleAddReaction}
                      isEditing={editingMessageId === msg._id}
                      editText={editText}
                      setEditText={setEditText}
                      onSaveEdit={handleEditMessage}
                      onCancelEdit={() => {
                        setEditingMessageId(null);
                        setEditText("");
                      }}
                      editInputRef={editInputRef}
                    />
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            <footer className="bg-content1/90 backdrop-blur-3xl border-t border-divider flex flex-col">
              {replyingTo && (
                <div className="px-4 pt-3 pb-1 flex items-center gap-2">
                  <div className="flex-1 bg-default-100 border-l-3 border-primary rounded-lg px-3 py-2 text-sm">
                    <p className="text-[10px] text-primary font-bold uppercase tracking-wider mb-0.5">
                      Replying to{" "}
                      {replyingTo.senderId === user?._id
                        ? "yourself"
                        : activeChat.fullName}
                    </p>
                    <p className="text-default-500 truncate text-xs">
                      {replyingTo.text || "[Image]"}
                    </p>
                  </div>
                  <Button
                    isIconOnly
                    size="sm"
                    variant="ghost"
                    className="text-default-400"
                    onPress={() => setReplyingTo(null)}
                  >
                    ✕
                  </Button>
                </div>
              )}

              <div className="p-4 flex items-center gap-3">
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
                    color="default"
                    placeholder={
                      replyingTo ? "Type your reply..." : "Type a message..."
                    }
                    className="w-full bg-content2/50 rounded-xl"
                    value={message}
                    onChange={(e) => {
                      setMessage(e.target.value);
                      const socket = getSocket();
                      if (socket && activeChat) {
                        socket.emit("typing", {
                          receiverId: !activeChat.isGroup
                            ? activeChat._id
                            : undefined,
                          groupId: activeChat.isGroup
                            ? activeChat._id
                            : undefined,
                        });
                        if (typingTimerRef.current)
                          clearTimeout(typingTimerRef.current);
                        typingTimerRef.current = setTimeout(() => {
                          socket.emit("stopTyping", {
                            receiverId: !activeChat.isGroup
                              ? activeChat._id
                              : undefined,
                            groupId: activeChat.isGroup
                              ? activeChat._id
                              : undefined,
                          });
                        }, 2000);
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                      if (e.key === "Escape") {
                        setReplyingTo(null);
                      }
                    }}
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
              </div>
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

      <Modal isOpen={isCreateModalOpen} onOpenChange={onCreateModalOpenChange}>
        <Modal.Backdrop>
          <Modal.Container>
            <Modal.Dialog className="sm:max-w-[400px] bg-content1">
              <Modal.CloseTrigger />
              <Modal.Header>
                <Modal.Heading className="font-bold">
                  Create New Group
                </Modal.Heading>
              </Modal.Header>
              <Modal.Body>
                <div className="space-y-4 pt-2">
                  <Input
                    label="Group Name"
                    placeholder="Enter group name"
                    variant="bordered"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                  />
                  <div className="space-y-2">
                    <p className="text-sm font-bold text-default-600">
                      Select Members (Min 2 friends)
                    </p>
                    <ScrollShadow className="max-h-[200px]">
                      <CheckboxGroup
                        value={selectedMembers}
                        onChange={(vals: any) => setSelectedMembers(vals)}
                      >
                        {friends.map((friend) => (
                          <Checkbox key={friend._id} value={friend._id}>
                            <div className="flex items-center gap-2">
                              <Avatar.Root size="sm">
                                <Avatar.Image
                                  src={
                                    friend.isGroup
                                      ? friend.profilePic
                                      : getAvatarUrl(
                                          friend.profilePic,
                                          friend.fullName,
                                        )
                                  }
                                />
                                <Avatar.Fallback className="bg-primary/10 text-primary font-bold">
                                  {friend.fullName?.[0]}
                                </Avatar.Fallback>
                              </Avatar.Root>
                              <span className="text-sm">{friend.fullName}</span>
                            </div>
                          </Checkbox>
                        ))}
                      </CheckboxGroup>
                    </ScrollShadow>
                  </div>
                </div>
              </Modal.Body>
              <Modal.Footer>
                <Button
                  variant="light"
                  onPress={() => onCreateModalOpenChange(false)}
                >
                  Cancel
                </Button>
                <Button
                  color="warning"
                  onPress={handleCreateGroup}
                  isLoading={isCreatingGroup}
                  isDisabled={!groupName.trim() || selectedMembers.length < 2}
                  className="font-bold"
                >
                  Create Group
                </Button>
              </Modal.Footer>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>
    </div>
  );
};

export default Page;
