"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Badge,
  Button,
  Input,
  ScrollShadow,
  Spinner,
} from "@heroui/react";
import {
  HiPaperAirplane,
  HiPlusCircle,
  HiFaceSmile,
  HiChevronLeft,
  HiVideoCamera,
  HiPhone,
  HiMagnifyingGlass,
  HiEllipsisVertical,
  HiMicrophone,
  HiChatBubbleLeftRight,
} from "react-icons/hi2";
import { useChat } from "../../providers/ChatProvider";
import { useAuth } from "../../providers/AuthProvider";

export function ChatArea() {
  const { selectedChat, messages, sendMessageInChat, isLoadingMessages, setSelectedChat } =
    useChat();
  const { user } = useAuth();
  const [content, setContent] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!content.trim()) return;
    const msg = content;
    setContent("");
    await sendMessageInChat(msg);
  };

  if (!selectedChat) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-[#0b141a] text-default-400">
        <div className="w-20 h-20 bg-default-100 rounded-full flex items-center justify-center mb-6 opacity-20">
          <HiChatBubbleLeftRight className="text-5xl" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">VibeChat for Web</h2>
        <p className="max-w-md text-center text-sm opacity-60">
          Send and receive messages without keeping your phone online. Use VibeChat on up to 4 linked devices and 1 phone at the same time.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0b141a] overflow-hidden">
      {}
      <header className="h-[60px] bg-[#202c33] px-4 flex items-center justify-between z-10 shrink-0">
        <div className="flex items-center gap-4 min-w-0">
          <Button 
            isIconOnly 
            variant="ghost" 
            size="sm" 
            className="md:hidden text-default-400"
            onClick={() => setSelectedChat(null)}
          >
            <HiChevronLeft className="text-xl" />
          </Button>
          
          <div className="relative shrink-0">
            <img
              src={selectedChat.avatar[0] || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedChat.name || "U")}&background=7c3aed&color=fff&bold=true`}
              alt={selectedChat.name || "U"}
              className="w-10 h-10 rounded-full object-cover"
            />
          </div>
          
          <div className="flex flex-col min-w-0">
            <h3 className="font-semibold text-foreground text-base leading-tight truncate">
              {selectedChat.name}
            </h3>
            <span className="text-xs text-default-400">online</span>
          </div>
        </div>

        <div className="flex items-center gap-4 text-default-400">
          <div className="flex items-center gap-1">
             <Button isIconOnly variant="ghost" size="sm" className="hidden sm:flex">
                <HiVideoCamera className="text-xl" />
              </Button>
              <Button isIconOnly variant="ghost" size="sm" className="hidden sm:flex">
                <HiPhone className="text-xl" />
              </Button>
          </div>
          <div className="h-6 w-[1px] bg-default-200/20 mx-1 hidden sm:block" />
          <Button isIconOnly variant="ghost" size="sm">
            <HiMagnifyingGlass className="text-xl" />
          </Button>
          <Button isIconOnly variant="ghost" size="sm">
            <HiEllipsisVertical className="text-xl" />
          </Button>
        </div>
      </header>

      {}
      <div 
        className="flex-1 overflow-y-auto relative p-4"
        style={{
          backgroundImage: `url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')`,
          backgroundRepeat: 'repeat',
          backgroundSize: '400px',
        }}
      >
        <div className="absolute inset-0 bg-[#0b141a]/95 pointer-events-none" />
        
        <ScrollShadow
          ref={scrollRef}
          className="flex flex-col gap-2 h-full scroll-smooth relative z-10"
          hideScrollBar
        >
          {isLoadingMessages ? (
            <div className="flex-1 flex items-center justify-center">
              <Spinner color="accent" />
            </div>
          ) : (
             messages.map((msg, index) => {
               const isMe = msg.sender === user?._id;
               return (
                 <div
                    key={msg._id}
                    className={`flex flex-col mb-1 ${isMe ? "items-end" : "items-start"}`}
                 >
                    <div
                      className={`relative px-3 py-1.5 rounded-lg text-sm max-w-[85%] sm:max-w-[65%] shadow-sm ${
                        isMe 
                          ? "bg-[#005c4b] text-white rounded-tr-none" 
                          : "bg-[#202c33] text-[#e9edef] rounded-tl-none"
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                      <div className="flex items-center justify-end gap-1 mt-1">
                        <span className="text-[10px] opacity-60">
                           {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {isMe && <span className="text-[10px] opacity-60">✓✓</span>}
                      </div>
                    </div>
                 </div>
               );
             })
          )}
        </ScrollShadow>
      </div>

      {}
      <footer className="bg-[#202c33] p-2 flex items-center gap-2 shrink-0">
        <div className="flex items-center">
           <Button isIconOnly variant="ghost" size="sm" className="text-default-400">
             <HiPlusCircle className="text-2xl" />
           </Button>
           <Button isIconOnly variant="ghost" size="sm" className="text-default-400">
             <HiFaceSmile className="text-2xl" />
           </Button>
        </div>
        
        <form onSubmit={handleSend} className="flex-1 flex items-center gap-2">
          <Input
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Type a message"
            className="w-full bg-[#2a3942] text-sm text-foreground py-2 px-4 rounded-lg outline-none"
          />
          {content ? (
             <Button type="submit" isIconOnly variant="ghost" size="sm" className="text-primary">
                <HiPaperAirplane className="text-2xl" />
             </Button>
          ) : (
            <Button isIconOnly variant="ghost" size="sm" className="text-default-400">
                <HiMicrophone className="text-2xl" />
            </Button>
          )}
        </form>
      </footer>
    </div>
  );
}
