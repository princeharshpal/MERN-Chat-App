"use client";

import React, { useState } from "react";
import {
  Header,
  Link,
  Button,
  Popover,
  Badge,
  Spinner,
  toast,
} from "@heroui/react";
import { ThemeToggle } from "./ThemeToggle";
import {
  HiChatBubbleLeftRight,
  HiBell,
  HiCheck,
  HiXMark,
} from "react-icons/hi2";
import { useAuth } from "../providers/AuthProvider";
import { requestService } from "../services/request.service";
import { useRouter, usePathname } from "next/navigation";

export function Navbar() {
  const { user, pendingRequests, logoutContext, acceptRequestInContext } =
    useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isAccepting, setIsAccepting] = useState<string | null>(null);

  if (pathname === "/chat") {
    return null;
  }

  const handleLogout = async () => {
    await logoutContext();
    router.push("/");
  };

  const handleAcceptRequest = async (requestId: string) => {
    setIsAccepting(requestId);
    try {
      const data = await requestService.acceptRequest(requestId);
      if (data.success) {
        toast("Friend request accepted!");
        acceptRequestInContext(requestId);
      }
    } catch (err) {
      toast("Failed to accept request");
    } finally {
      setIsAccepting(null);
    }
  };

  return (
    <Header className="sticky top-0 z-50 w-full border-b border-default-200 bg-background/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="flex items-center gap-2 transition-opacity hover:opacity-80"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-foreground text-background">
              <HiChatBubbleLeftRight className="text-2xl" />
            </div>
            <span className="text-xl font-bold tracking-tight text-foreground">
              VibeChat
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 border-l border-default-200 pl-4">
            <ThemeToggle />

            {!user ? (
              <Button
                size="sm"
                variant="outline"
                className="font-semibold hidden sm:flex border-default-200 text-foreground hover:bg-default-100"
                onPress={() => router.push("/")}
              >
                Sign In
              </Button>
            ) : (
              <div className="flex items-center gap-4 ml-2">
                <Popover.Root>
                  <Popover.Trigger>
                    <Button
                      isIconOnly
                      variant="ghost"
                      size="sm"
                      className="relative text-default-600"
                    >
                      <div className="relative">
                        <HiBell className="text-xl" />
                        {pendingRequests.length > 0 && (
                          <div className="absolute top-0 right-0 -mt-1 -mr-1 flex h-4 w-4 items-center justify-center rounded-full bg-danger text-[10px] font-bold text-white">
                            {pendingRequests.length}
                          </div>
                        )}
                      </div>
                    </Button>
                  </Popover.Trigger>
                  <Popover.Content className="w-80 p-4">
                    <h4 className="text-sm font-bold tracking-tight mb-4">
                      Pending Requests
                    </h4>
                    {pendingRequests.length === 0 ? (
                      <p className="text-xs text-default-400">
                        No new requests right now.
                      </p>
                    ) : (
                      <div className="flex flex-col gap-3">
                        {pendingRequests.map((req) => (
                          <div
                            key={req._id}
                            className="flex items-center justify-between bg-default-50 p-2 rounded-lg"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <img
                                src={req.sender?.avatar?.url || `https://ui-avatars.com/api/?name=${encodeURIComponent(req.sender?.name || "U")}&background=7c3aed&color=fff&bold=true`}
                                alt={req.sender?.name || "U"}
                                className="w-8 h-8 rounded-full object-cover shrink-0"
                              />
                              <span className="text-sm font-semibold truncate text-foreground">
                                {req.sender?.name}
                              </span>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              <Button
                                isIconOnly
                                size="sm"
                                variant="primary"
                                className="min-w-8 w-8 h-8 font-bold"
                                onPress={() => handleAcceptRequest(req._id)}
                                isDisabled={isAccepting === req._id}
                              >
                                {isAccepting === req._id ? (
                                  <Spinner size="sm" />
                                ) : (
                                  <HiCheck className="text-lg" />
                                )}
                              </Button>
                              <Button
                                isIconOnly
                                size="sm"
                                variant="outline"
                                className="min-w-8 w-8 h-8 border-default-200"
                              >
                                <HiXMark className="text-lg" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </Popover.Content>
                </Popover.Root>

                <Popover.Root>
                  <Popover.Trigger>
                    <button className="flex items-center gap-2 hover:opacity-80 transition-opacity outline-none">
                      <img
                        src={user?.avatar?.url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || "U")}&background=7c3aed&color=fff&bold=true`}
                        alt={user?.name || "U"}
                        className="w-8 h-8 rounded-full object-cover border-2 border-background shadow-sm hover:ring-2 hover:ring-accent/20 transition-all"
                      />
                    </button>
                  </Popover.Trigger>
                  <Popover.Content className="p-2 w-48">
                    <div className="px-3 py-2 border-b border-default-100 mb-1">
                      <p className="text-sm font-bold truncate">{user.name}</p>
                      <p className="text-xs text-default-500 truncate">
                        {user.email}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-sm"
                      onPress={() => router.push("/chat")}
                    >
                      Chat
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-sm text-danger hover:bg-danger/10"
                      onPress={handleLogout}
                    >
                      Logout
                    </Button>
                  </Popover.Content>
                </Popover.Root>
              </div>
            )}
          </div>
        </div>
      </div>
    </Header>
  );
}
