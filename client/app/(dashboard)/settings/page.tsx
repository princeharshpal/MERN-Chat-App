"use client";

import React from "react";
import { Button, ScrollShadow, Avatar, Switch, Card } from "@heroui/react";
import {
  IoShieldCheckmarkOutline,
  IoNotificationsOutline,
  IoLanguage,
  IoColorPaletteOutline,
} from "react-icons/io5";
import { FaUserCircle, FaKeyboard } from "react-icons/fa";
import { MdOutlineDataUsage, MdHelpOutline } from "react-icons/md";
import { useTheme } from "next-themes";

const SettingsCategory = ({
  icon,
  title,
  desc,
  isActive,
  onPress,
}: {
  icon: any;
  title: string;
  desc: string;
  isActive?: boolean;
  onPress: () => void;
}) => (
  <div
    onClick={onPress}
    className={`flex items-center gap-3 p-2 cursor-pointer transition-all hover:bg-gray-300/5 ${isActive ? "bg-primary/10 border-r-3 border-primary shadow-sm" : ""}`}
  >
    <div className="text-xl text-default-500 shrink-0">{icon}</div>
    <div className="flex-1 min-w-0 border-b border-divider/30 pb-1">
      <h3 className="font-bold text-sm text-foreground uppercase tracking-tight">
        {title}
      </h3>
      <p className="text-[10px] text-default-400 truncate uppercase tracking-widest opacity-70">
        {desc}
      </p>
    </div>
  </div>
);

const SettingsPage = () => {
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = React.useState("profile");
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => setMounted(true), []);

  return (
    <div className="flex w-full h-full bg-background overflow-hidden font-sans">
      <div className="w-full max-w-[400px] border-r border-divider flex flex-col bg-content1/50 backdrop-blur-md">
        <div className="p-3">
          <h1 className="text-4xl font-bold text-foreground">Settings</h1>
        </div>

        <ScrollShadow className="flex-1 w-full px-1">
          <div className="flex flex-col gap-0.5">
            <SettingsCategory
              icon={<FaUserCircle />}
              title="Profile"
              desc="Account & Avatar"
              isActive={activeTab === "profile"}
              onPress={() => setActiveTab("profile")}
            />
            <SettingsCategory
              icon={<IoShieldCheckmarkOutline />}
              title="Privacy"
              desc="Security & Safety"
              isActive={activeTab === "privacy"}
              onPress={() => setActiveTab("privacy")}
            />
            <SettingsCategory
              icon={<IoNotificationsOutline />}
              title="Notifications"
              desc="Message Tones"
              isActive={activeTab === "notifications"}
              onPress={() => setActiveTab("notifications")}
            />
            <SettingsCategory
              icon={<IoColorPaletteOutline />}
              title="Appearance"
              desc="Theme & UI"
              isActive={activeTab === "appearance"}
              onPress={() => setActiveTab("appearance")}
            />
            <SettingsCategory
              icon={<IoLanguage />}
              title="Language"
              desc="Global System"
              isActive={activeTab === "language"}
              onPress={() => setActiveTab("language")}
            />
            <SettingsCategory
              icon={<MdOutlineDataUsage />}
              title="Storage"
              desc="Data Usage"
              isActive={activeTab === "data"}
              onPress={() => setActiveTab("data")}
            />
            <SettingsCategory
              icon={<FaKeyboard />}
              title="Shortcuts"
              desc="Navigation"
              isActive={activeTab === "shortcuts"}
              onPress={() => setActiveTab("shortcuts")}
            />
            <SettingsCategory
              icon={<MdHelpOutline />}
              title="Help"
              desc="Support Hub"
              isActive={activeTab === "help"}
              onPress={() => setActiveTab("help")}
            />
          </div>
        </ScrollShadow>
      </div>

      <div className="flex-1 flex flex-col bg-background relative overflow-y-auto">
        <div className="max-w-3xl w-full mx-auto p-10 space-y-8 relative z-10">
          {activeTab === "profile" && (
            <section className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
              <h2 className="text-3xl font-bold text-foreground tracking-tight uppercase">
                Profile
              </h2>

              <div className="flex items-center gap-6 p-6 bg-content2/30 border border-divider rounded-3xl backdrop-blur-md shadow-sm">
                <Avatar className="w-20 h-20 text-3xl shadow-lg">
                  <Avatar.Image src="https://ui-avatars.com/api/?background=random&name=Harsh+Pal" />
                  <Avatar.Fallback>HP</Avatar.Fallback>
                </Avatar>
                <div className="space-y-1 flex-1">
                  <h3 className="text-xl font-bold text-foreground uppercase tracking-tight">
                    Harsh Pal
                  </h3>
                  <p className="text-[10px] font-bold text-primary uppercase tracking-widest leading-loose">
                    @harsh_pal • Cluster Admin
                  </p>
                  <Button
                    size="sm"
                    variant="primary"
                    className="mt-3 text-[10px] font-bold rounded-lg px-6 h-8 uppercase tracking-widest shadow-sm"
                  >
                    Edit Neural Link
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Card className="p-4 bg-content1 shadow-sm hover:shadow-md transition-all border border-divider/50 cursor-default">
                  <p className="text-[9px] uppercase font-bold text-primary mb-1 tracking-[0.2em]">
                    Full Name
                  </p>
                  <p className="font-bold text-sm text-foreground">Harsh Pal</p>
                </Card>
                <Card className="p-4 bg-content1 shadow-sm hover:shadow-md transition-all border border-divider/50 cursor-default">
                  <p className="text-[9px] uppercase font-bold text-primary mb-1 tracking-[0.2em]">
                    Neural Tag
                  </p>
                  <p className="font-bold text-sm text-foreground">harsh_pal</p>
                </Card>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-5 bg-content1 border border-divider/50 rounded-2xl shadow-sm">
                  <div>
                    <h4 className="font-bold text-sm text-foreground uppercase tracking-tight">
                      Read Receipts
                    </h4>
                    <p className="text-[10px] text-default-400 font-medium uppercase tracking-widest">
                      Broadcast viewed transmission status
                    </p>
                  </div>
                  <Switch defaultSelected size="sm" />
                </div>
              </div>
            </section>
          )}

          {activeTab === "appearance" && (
            <section className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
              <h2 className="text-3xl font-bold text-foreground tracking-tight uppercase">
                Appearance
              </h2>

              <Card className="p-8 bg-content1 border border-divider/50 rounded-3xl shadow-sm">
                <div className="flex items-center justify-between mb-8">
                  <div className="space-y-1">
                    <h4 className="text-lg font-bold text-foreground uppercase tracking-tight">
                      Dark Frequency
                    </h4>
                    <p className="text-[11px] text-default-400 font-medium uppercase">
                      Switch between ocular modes for better secure interface
                      comfort.
                    </p>
                  </div>
                  {mounted && (
                    <Switch
                      size="md"
                      isSelected={theme === "dark"}
                      onChange={(e: any) =>
                        setTheme(e.target.checked ? "dark" : "light")
                      }
                    />
                  )}
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div
                    onClick={() => setTheme("light")}
                    className={`cursor-pointer rounded-2xl overflow-hidden border-2 transition-all p-3 ${theme === "light" ? "border-primary bg-primary/5 shadow-lg" : "border-divider opacity-50"}`}
                  >
                    <div className="h-20 bg-white rounded-xl shadow-sm mb-3 border border-default-100"></div>
                    <p className="text-center text-[10px] font-bold text-foreground uppercase tracking-widest">
                      Light Frequency
                    </p>
                  </div>
                  <div
                    onClick={() => setTheme("dark")}
                    className={`cursor-pointer rounded-2xl overflow-hidden border-2 transition-all p-3 ${theme === "dark" ? "border-primary bg-primary/5 shadow-lg" : "border-divider opacity-50"}`}
                  >
                    <div className="h-20 bg-[#0a141d] rounded-xl shadow-sm mb-3 border border-white/5"></div>
                    <p className="text-center text-[10px] font-bold text-foreground uppercase tracking-widest">
                      Dark Frequency
                    </p>
                  </div>
                </div>
              </Card>
            </section>
          )}

          {activeTab !== "profile" && activeTab !== "appearance" && (
            <div className="flex flex-col items-center justify-center h-[400px] text-center space-y-4 opacity-40 animate-pulse">
              <div className="p-6 rounded-full bg-primary/10">
                <IoColorPaletteOutline className="text-6xl text-primary" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-foreground uppercase tracking-tighter">
                  {activeTab} Channel
                </h3>
                <p className="text-[11px] font-bold uppercase tracking-widest">
                  Neural segment arriving in future update
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
