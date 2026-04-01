"use client";

import React from "react";
import { Avatar, Button, ScrollShadow, Tooltip } from "@heroui/react";
import { RiDonutChartFill, RiChatNewLine } from "react-icons/ri";
import { IoMdMore } from "react-icons/io";
import { FiPlus } from "react-icons/fi";

const StatusItem = ({ name, time, avatar }: { name: string; time: string; avatar?: string }) => (
  <div className="flex items-center gap-3 p-2 cursor-pointer hover:bg-gray-300/5 transition-colors">
    <div className="relative p-0.5 rounded-full border-2 border-primary">
      <Avatar size="md">
        <Avatar.Image src={avatar || `https://i.pravatar.cc/150?u=${name}`} />
        <Avatar.Fallback className="bg-primary/10 text-primary font-bold">{name[0]}</Avatar.Fallback>
      </Avatar>
    </div>
    <div className="flex-1 min-w-0">
      <h3 className="font-bold text-sm text-foreground truncate uppercase tracking-tight">{name}</h3>
      <p className="text-[10px] text-default-400 uppercase tracking-widest opacity-70">{time}</p>
    </div>
  </div>
);

const StatusPage = () => {
  return (
    <div className="flex w-full h-full bg-background overflow-hidden font-sans">
      {/* Sidebar: Status List - Consistent Layout */}
      <div className="w-full max-w-[400px] border-r border-divider flex flex-col bg-content1/50 backdrop-blur-md">
        <div className="p-3 space-y-3">
          <div className="flex items-center justify-between">
            <h1 className="text-4xl font-bold text-foreground">Status</h1>
            <div className="flex gap-1">
              <Button isIconOnly variant="light" radius="full" className="text-xl text-default-500">
                <IoMdMore />
              </Button>
            </div>
          </div>
        </div>

        <ScrollShadow className="flex-1 w-full">
          <div className="p-1">
            <div className="flex items-center gap-3 p-2 cursor-pointer group hover:bg-gray-300/5 transition-all rounded-xl">
              <div className="relative">
                <Avatar.Root size="lg" className="shadow-sm">
                  <Avatar.Image src="https://i.pravatar.cc/150?u=me" />
                  <Avatar.Fallback className="bg-primary/10 text-primary font-bold">ME</Avatar.Fallback>
                </Avatar.Root>
                <div className="absolute bottom-0 right-0 bg-primary rounded-full p-1 border-2 border-background group-hover:scale-110 transition-transform shadow-lg">
                  <FiPlus className="text-white text-[10px]" />
                </div>
              </div>
              <div className="flex-1 border-b border-default-100/50 pb-2">
                <h3 className="font-bold text-sm text-foreground uppercase tracking-tight">My Status</h3>
                <p className="text-[10px] text-default-400 uppercase tracking-widest opacity-70">Tap to update status</p>
              </div>
            </div>
          </div>

          <div className="px-5 py-2 bg-default-50/10">
            <p className="text-[10px] font-bold text-primary uppercase tracking-widest">Recent updates</p>
          </div>

          <div className="flex flex-col px-1">
            <StatusItem name="Darlene Robertson" time="Today at 12:18" />
            <StatusItem name="Theresa Webb" time="Today at 10:45" />
            <StatusItem name="Albert Flores" time="Yesterday at 21:30" />
          </div>
        </ScrollShadow>
      </div>

      {/* Main Area: Status Preview placeholder */}
      <div className="flex-1 flex flex-col items-center justify-center bg-background relative">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://static.whatsapp.net/rsrc.php/v3/y6/r/wa669ae5dbc.png')] bg-repeat"></div>
        
        <div className="relative z-10 flex flex-col items-center max-w-sm text-center px-8 animate-in fade-in slide-in-from-bottom-5 duration-1000">
          <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center mb-10 shadow-inner">
            <RiDonutChartFill className="text-5xl text-primary animate-pulse" />
          </div>
          <h2 className="text-3xl font-bold text-foreground mb-4 tracking-tight uppercase">Status Tracker</h2>
          <div className="w-12 h-0.5 bg-secondary rounded-full mb-6"></div>
          <p className="text-default-400 text-sm font-medium opacity-70 leading-relaxed uppercase tracking-widest">
            Select a contact to witness their 24-hour transmission.
          </p>
        </div>
      </div>
    </div>
  );
};

export default StatusPage;
