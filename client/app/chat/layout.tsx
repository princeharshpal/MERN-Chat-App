"use client";

import React, { useState } from "react";
import { SideNav } from "../../components/chat/SideNav";
import { SidebarChatList } from "../../components/chat/SidebarChatList";
import { useChat } from "../../providers/ChatProvider";

const ChatLayout = ({ children }: { children: React.ReactNode }) => {
  const { selectedChat } = useChat();

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      {}
      <SideNav />

      {}
      <div
        className={`${
          selectedChat ? "hidden md:flex" : "flex"
        } h-full w-full md:w-[350px] border-r border-default-200 bg-background flex-col shrink-0`}
      >
        <SidebarChatList />
      </div>

      {}
      <main
        className={`${
          selectedChat ? "flex" : "hidden md:flex"
        } flex-1 h-full min-w-0 bg-default-50/5 relative`}
      >
        {children}
      </main>
    </div>
  );
};

export default ChatLayout;
