"use client";

import React, { useState } from "react";
import {
  HiChatBubbleLeftRight,
  HiUserGroup,
  HiUserCircle,
  HiStar,
  HiArchiveBox,
  HiCog6Tooth,
} from "react-icons/hi2";
import { useAuth } from "../../providers/AuthProvider";
import { useChat } from "../../providers/ChatProvider";
import { Tooltip, Avatar } from "@heroui/react";

export function SideNav() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("chat");

  const menuItems = [
    { id: "chat", icon: HiChatBubbleLeftRight, label: "Chats" },
    { id: "friends", icon: HiUserGroup, label: "Friends" },
    { id: "starred", icon: HiStar, label: "Starred" },
    { id: "archive", icon: HiArchiveBox, label: "Archive" },
  ];

  return (
    <aside className="hidden h-full w-[60px] flex-col items-center border-r border-default-200 bg-default-100/50 py-4 sm:flex shrink-0">
      <div className="flex flex-col gap-6">
        {menuItems.map((item) => (
          <div key={item.id} title={item.label}>
            <button
              onClick={() => setActiveTab(item.id)}
              className={`p-2 rounded-lg transition-colors relative ${
                activeTab === item.id
                  ? "text-primary bg-primary/10"
                  : "text-default-400 hover:text-default-600 hover:bg-default-200/50"
              }`}
            >
              <item.icon className="text-2xl" />
              {activeTab === item.id && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 bg-primary rounded-r-full" />
              )}
            </button>
          </div>
        ))}
      </div>

      <div className="mt-auto flex flex-col gap-6 items-center">
        <div title="Settings">
          <button className="p-2 text-default-400 hover:text-default-600 hover:bg-default-200/50 rounded-lg transition-colors">
            <HiCog6Tooth className="text-2xl" />
          </button>
        </div>

        <div title={user?.name || "Profile"}>
          <button className="p-0.5 rounded-full border-2 border-transparent hover:border-primary transition-all">
            <img
              src={user?.avatar?.url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || "U")}&background=7c3aed&color=fff&bold=true`}
              alt={user?.name || "U"}
              className="w-8 h-8 rounded-full object-cover cursor-pointer"
            />
          </button>
        </div>
      </div>
    </aside>
  );
}
