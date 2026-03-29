"use client";

import React, { useState, useEffect } from "react";
import {
  Badge,
  Input,
  ScrollShadow,
  Button,
  Popover,
  Spinner,
  toast,
} from "@heroui/react";
import {
  HiMagnifyingGlass,
  HiEllipsisVertical,
  HiUserPlus,
  HiPlus,
} from "react-icons/hi2";
import { useAuth, User } from "../../providers/AuthProvider";
import { useChat } from "../../providers/ChatProvider";
import { requestService } from "../../services/request.service";
import { chatService } from "../../services/chat.service";

export function SidebarChatList() {
  const { user, socket } = useAuth();
  const { setSelectedChat, selectedChat } = useChat();
  const [friends, setFriends] = useState<User[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [isOpeningChat, setIsOpeningChat] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  interface SearchResult extends User {
    isFriend: boolean;
    pendingRequest: boolean;
  }
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [sendingRequestId, setSendingRequestId] = useState<string | null>(null);

  const fetchFriends = async () => {
    try {
      const data = await requestService.getFriends();
      if (data.success) {
        setFriends(data.friends);
      }
    } catch (err) {
      console.error("Failed to fetch friends", err);
    }
  };

  useEffect(() => {
    fetchFriends();
  }, [user]);

  useEffect(() => {
    if (!socket) return;
    socket.on("getOnlineUsers", (users: string[]) => {
      setOnlineUsers(users);
    });

    return () => {
      socket.off("getOnlineUsers");
    };
  }, [socket]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (!searchQuery.trim()) {
        setSearchResults([]);
        return;
      }
      setIsSearching(true);
      try {
        const data = await requestService.searchUsers(searchQuery);
        if (data.success) {
          setSearchResults(data.users);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsSearching(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const handleSendRequest = async (receiverId: string) => {
    setSendingRequestId(receiverId);
    try {
      const data = await requestService.sendRequest(receiverId);
      if (data.success) {
        toast("Friend request sent!");
        setSearchResults((prev) =>
          prev.map((u) =>
            u._id === receiverId ? { ...u, pendingRequest: true } : u,
          ),
        );
      }
    } catch (err) {
      toast(
        (err as { response?: { data?: { message?: string } } }).response?.data
          ?.message || "Failed to send request",
      );
    } finally {
      setSendingRequestId(null);
    }
  };

  const handleChatSelect = async (friendId: string) => {
    setIsOpeningChat(friendId);
    try {
      const data = await chatService.getOrCreateChat(friendId);
      if (data.success) {
        setSelectedChat(data.chat);
      }
    } catch (err) {
      toast("Failed to open chat");
    } finally {
      setIsOpeningChat(null);
    }
  };

  return (
    <div className="flex flex-col h-full bg-background overflow-hidden border-r border-default-200">
      <div className="p-4 border-b border-default-100 flex items-center justify-between bg-default-50/50">
        <h2 className="text-xl font-bold tracking-tight text-foreground">
          Chats
        </h2>
        <div className="flex items-center gap-2">
          <Popover.Root>
            <Popover.Trigger>
              <Button isIconOnly variant="ghost" size="sm" className="text-default-500">
                <HiPlus className="text-xl" />
              </Button>
            </Popover.Trigger>
            <Popover.Content className="w-80 p-0 border border-default-200 shadow-xl overflow-hidden">
               {/* Search friend content same as before but inside SidebarChatList */}
               <div className="bg-default-50/50 p-4 border-b border-default-200">
                <h4 className="text-sm font-bold tracking-tight mb-3">
                  Find Friends
                </h4>
                <div className="relative group">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-default-400">
                    <HiMagnifyingGlass />
                  </div>
                  <Input
                    autoFocus
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by name..."
                    className="w-full bg-background border border-default-200 rounded-lg py-1.5 pl-10 pr-4 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>
              <ScrollShadow className="max-h-60 p-2">
                {isSearching ? (
                  <div className="flex justify-center p-4">
                    <Spinner size="sm" color="current" />
                  </div>
                ) : searchResults.length === 0 ? (
                  <div className="p-4 text-center text-xs text-default-400">
                    {searchQuery ? "No users found" : "Type a name to search"}
                  </div>
                ) : (
                  searchResults.map((su) => (
                    <div
                      key={su._id}
                      className="flex items-center justify-between p-2 hover:bg-default-100 rounded-lg transition-colors group/item"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <img
                          src={su.avatar?.url || `https://ui-avatars.com/api/?name=${encodeURIComponent(su.name || "U")}&background=7c3aed&color=fff&bold=true`}
                          alt={su.name || "U"}
                          className="w-8 h-8 rounded-full object-cover border border-default-200 shrink-0"
                        />
                        <span className="text-sm font-semibold truncate text-foreground group-hover/item:text-primary transition-colors">
                          {su.name}
                        </span>
                      </div>
                      {su.isFriend ? (
                        <span className="text-[10px] font-bold uppercase text-primary tracking-wider">
                          Friends
                        </span>
                      ) : su.pendingRequest ? (
                        <span className="text-[10px] font-bold uppercase text-default-400 tracking-wider">
                          Pending
                        </span>
                      ) : (
                        <Button
                          isIconOnly
                          size="sm"
                          variant="primary"
                          className="rounded-full shadow-sm hover:scale-110 transition-transform"
                          onPress={() => handleSendRequest(su._id)}
                          isDisabled={sendingRequestId === su._id}
                        >
                          {sendingRequestId === su._id ? (
                            <Spinner size="sm" color="accent" />
                          ) : (
                            <HiUserPlus className="text-lg" />
                          )}
                        </Button>
                      )}
                    </div>
                  ))
                )}
              </ScrollShadow>
            </Popover.Content>
          </Popover.Root>
          <Button isIconOnly variant="ghost" size="sm" className="text-default-500">
            <HiEllipsisVertical className="text-xl" />
          </Button>
        </div>
      </div>

      <div className="p-4 bg-default-50/10">
        <div className="relative group mb-4">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-default-400 group-focus-within:text-primary transition-colors">
            <HiMagnifyingGlass />
          </div>
          <Input
            placeholder="Search conversations..."
            className="w-full bg-background border border-default-200 rounded-xl py-2 pl-10 pr-4 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
          />
        </div>
        
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {["All", "Unread", "Favourites", "Groups"].map((filter) => (
            <button
              key={filter}
              className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                filter === "All"
                  ? "bg-primary/20 text-primary"
                  : "bg-default-100 text-default-500 hover:bg-default-200"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      <ScrollShadow className="flex-1 overflow-y-auto">
        <div className="flex flex-col">
          {friends.map((friend) => (
            <button
              key={friend._id}
              onClick={() => handleChatSelect(friend._id)}
              className={`flex items-center gap-4 p-4 hover:bg-default-100 transition-colors border-b border-default-50 last:border-0 text-left group w-full ${
                selectedChat?.members.includes(friend._id)
                  ? "bg-default-100 border-l-4 border-l-primary"
                  : ""
              }`}
            >
               <div className="relative">
                  {isOpeningChat === friend._id ? (
                    <div className="w-12 h-12 flex items-center justify-center bg-default-100 rounded-full">
                      <Spinner size="sm" color="accent" />
                    </div>
                  ) : (
                    <div className="relative">
                      <img
                        src={friend.avatar?.url || `https://ui-avatars.com/api/?name=${encodeURIComponent(friend.name || "U")}&background=7c3aed&color=fff&bold=true`}
                        alt={friend.name || "U"}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      {onlineUsers.includes(friend._id) && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-success rounded-full border-2 border-background shadow-sm" />
                      )}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-1">
                    <span className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                      {friend.name}
                    </span>
                    <span className="text-[10px] text-default-400 font-medium">10:45 AM</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-default-500 truncate leading-relaxed">
                      Tap to chat with your friend
                    </p>
                    <Badge color="accent" content="2" size="sm" className="border-none" />
                  </div>
                </div>
            </button>
          ))}
        </div>
      </ScrollShadow>
    </div>
  );
}
