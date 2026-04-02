"use client";

import React, { useEffect, useState } from "react";
import {
  Avatar,
  Button,
  Tabs,
  ScrollShadow,
  InputGroup,
  Chip,
  Spinner,
} from "@heroui/react";
import {
  FiUserPlus,
  FiUserCheck,
  FiSearch,
  FiArrowRight,
} from "react-icons/fi";
import { RiUserReceivedLine } from "react-icons/ri";
import {
  getFriends,
  getRequests,
  sendRequest,
  respondToRequest,
  getPossibleConnections,
} from "@/src/services/connection.service";
import { getAvatarUrl } from "@/src/utils/avatar";
import { useAppDispatch, useAppSelector } from "@/src/store/hooks";
import {
  setFriends,
  setPendingRequests,
  setPossibleConnections,
} from "@/src/store/slices/connectionSlice";
import toast from "react-hot-toast";

const FriendsPage = () => {
  const dispatch = useAppDispatch();
  const { friends, pendingRequests, possibleConnections } = useAppSelector(
    (state) => state.connection,
  );
  const [activeView, setActiveView] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const PRIMARY_COLOR = "#7B4B94";

  const fetchData = async (showLoading = true) => {
    if (showLoading) setIsLoading(true);
    try {
      const [fri, req, pos] = await Promise.all([
        getFriends(),
        getRequests(),
        getPossibleConnections(),
      ]);
      if (fri.success) dispatch(setFriends(fri.data));
      if (req.success) dispatch(setPendingRequests(req.data));
      if (pos.success) dispatch(setPossibleConnections(pos.data));
    } catch (error) {
      console.error(error);
    } finally {
      if (showLoading) setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData(true);
  }, []);

  const handleAction = async (action: string, id: string, status?: string) => {
    setProcessingId(id);
    try {
      const data =
        action === "request"
          ? await sendRequest(id)
          : await respondToRequest({ connectionId: id, status: status! });

      if (data.success) {
        toast.success(data.message || "Action successful");
        fetchData(false);
        if (action === "respond") setActiveView(null);
      } else {
        toast.error(data.message || "Action failed");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Action failed");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="flex w-full h-full bg-background overflow-hidden font-sans">
      <div className="w-full max-w-[420px] border-r border-divider flex flex-col bg-content1/50 backdrop-blur-md transition-all duration-300">
        <div className="space-y-3">
          <h1 className="text-4xl font-bold text-foreground px-3 pt-3">
            Friends
          </h1>

          <div className="px-3">
            <InputGroup
              fullWidth
              className="overflow-hidden rounded-2xl transition-all border border-transparent focus-within:border-primary focus-within:ring-1 focus-within:ring-primary shadow-sm bg-content2/30"
            >
              <InputGroup.Prefix className="px-4">
                <FiSearch className="text-xl text-default-400 group-focus-within:text-primary transition-colors" />
              </InputGroup.Prefix>
              <InputGroup.Input
                placeholder="GLOBAL DISCOVERY"
                className="outline-none border-none text-[10px] font-bold uppercase tracking-widest placeholder:text-default-400"
              />
            </InputGroup>
          </div>

          <Tabs variant="secondary" className="w-full">
            <Tabs.ListContainer>
              <Tabs.List aria-label="Networking Options">
                <Tabs.Tab
                  id="friends"
                  className="data-[selected=true]:text-primary font-bold uppercase text-[10px] tracking-widest"
                >
                  <FiUserCheck className="text-lg mr-2" />
                  <span>Friends</span>
                  <Tabs.Indicator className="bg-primary" />
                </Tabs.Tab>

                <Tabs.Tab
                  id="requests"
                  className="data-[selected=true]:text-primary font-bold uppercase text-[10px] tracking-widest"
                >
                  <RiUserReceivedLine className="text-lg mr-2" />
                  <span className="mr-1">Requests</span>
                  {pendingRequests.length > 0 && (
                    <Chip
                      size="sm"
                      variant="soft"
                      color="warning"
                      className="text-[9px] h-4 font-bold uppercase shadow-sm"
                    >
                      {pendingRequests.length}
                    </Chip>
                  )}
                  <Tabs.Indicator className="bg-primary" />
                </Tabs.Tab>

                <Tabs.Tab
                  id="discover"
                  className="data-[selected=true]:text-primary font-bold uppercase text-[10px] tracking-widest"
                >
                  <FiSearch className="text-lg mr-2" />
                  <span>Discover</span>
                  <Tabs.Indicator className="bg-primary" />
                </Tabs.Tab>
              </Tabs.List>
            </Tabs.ListContainer>

            <Tabs.Panel id="friends" className="p-1 pt-2">
              <div className="space-y-1">
                {isLoading ? (
                  <div className="flex items-center justify-center p-20">
                    <Spinner size="xl" style={{ color: PRIMARY_COLOR }} />
                  </div>
                ) : friends.length > 0 ? (
                  friends.map((friend: any) => (
                    <div
                      key={friend._id}
                      onClick={() =>
                        setActiveView({ type: "friend", data: friend })
                      }
                      className="flex items-center gap-3 border-b border-divider/50 p-2 hover:bg-primary/5 transition-all cursor-pointer group"
                    >
                      <Avatar.Root
                        size="md"
                        className="shrink-0 shadow-sm transition-all"
                      >
                        <Avatar.Image
                          src={getAvatarUrl(friend.profilePic, friend.fullName)}
                        />
                        <Avatar.Fallback className="bg-primary/10 text-default-500 font-bold uppercase">
                          {friend.fullName[0]}
                        </Avatar.Fallback>
                      </Avatar.Root>

                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-sm text-foreground truncate uppercase group-hover:text-primary transition-colors">
                          {friend.fullName}
                        </h3>

                        <div className="flex items-center gap-1.5 mt-0.5">
                          <div className="w-2 h-2 rounded-full bg-success animate-pulse shadow-sm"></div>
                          <span className="text-[10px] text-success font-bold tracking-widest uppercase opacity-70">
                            Active Now
                          </span>
                        </div>
                      </div>

                      <FiArrowRight className="text-default-300 group-hover:text-primary transition-all" />
                    </div>
                  ))
                ) : (
                  <div className="p-16 text-center text-default-400">
                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-50 italic">
                      No connections found.
                    </p>
                  </div>
                )}
              </div>
            </Tabs.Panel>

            <Tabs.Panel id="requests" className="p-0 pt-2">
              <div className="space-y-1">
                {isLoading ? (
                  <div className="flex items-center justify-center p-20">
                    <Spinner
                      size="md"
                      color="accent"
                      style={{ color: PRIMARY_COLOR }}
                    />
                  </div>
                ) : pendingRequests.length > 0 ? (
                  pendingRequests.map((req: any) => (
                    <div
                      key={req._id}
                      className="flex gap-3 border-b border-divider/50 p-2 hover:bg-primary/5 transition-all"
                    >
                      <Avatar.Root size="md" className="shrink-0 shadow-sm">
                        <Avatar.Image
                          src={getAvatarUrl(
                            req.sender.profilePic,
                            req.sender.fullName,
                          )}
                        />
                        <Avatar.Fallback className="bg-primary/10 text-default-500 font-bold uppercase">
                          {req.sender.fullName[0]}
                        </Avatar.Fallback>
                      </Avatar.Root>

                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-sm text-foreground truncate uppercase">
                          {req.sender.fullName}
                        </h3>
                        <p className="text-[9px] text-primary font-bold tracking-widest uppercase opacity-70 mt-0.5">
                          Pending Request
                        </p>
                      </div>

                      <div className="flex gap-1.5">
                        <Button
                          size="sm"
                          variant="primary"
                          className="text-white font-bold rounded-xl px-4 h-8 text-[9px] uppercase tracking-wider"
                          onClick={() =>
                            handleAction("respond", req._id, "accepted")
                          }
                        >
                          Accept
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="bg-default-100/50 text-default-600 font-bold rounded-xl px-4 h-8 text-[9px] uppercase tracking-wider hover:bg-danger hover:text-white transition-all shadow-sm"
                          onClick={() =>
                            handleAction("respond", req._id, "rejected")
                          }
                        >
                          Reject
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-16 text-center text-default-400 italic">
                    <p className="font-bold uppercase tracking-widest opacity-50 text-[10px]">
                      No pending transmissions.
                    </p>
                  </div>
                )}
              </div>
            </Tabs.Panel>

            <Tabs.Panel id="discover" className="p-0 pt-2">
              <div className="space-y-1">
                {isLoading ? (
                  <div className="flex items-center justify-center p-20">
                    <Spinner
                      size="md"
                      color="accent"
                      style={{ color: PRIMARY_COLOR }}
                    />
                  </div>
                ) : (
                  possibleConnections.map((user: any) => (
                    <div
                      key={user._id}
                      onClick={() =>
                        setActiveView({ type: "discover", data: user })
                      }
                      className="flex gap-3 border-b border-divider/50 p-2 hover:bg-primary/5 cursor-pointer transition-all group"
                    >
                      <Avatar.Root
                        size="md"
                        className="shrink-0 shadow-sm transition-all"
                      >
                        <Avatar.Image
                          src={getAvatarUrl(user.profilePic, user.fullName)}
                        />
                        <Avatar.Fallback className="bg-primary/10 text-default-500 font-bold uppercase">
                          {user.fullName[0]}
                        </Avatar.Fallback>
                      </Avatar.Root>

                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-sm text-foreground truncate uppercase group-hover:text-primary transition-colors">
                          {user.fullName}
                        </h3>

                        <p className="text-[9px] text-default-500 font-bold tracking-widest uppercase opacity-70 mt-0.5">
                          New Suggestion
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="primary"
                        className="text-black hover:bg-accent font-bold rounded-xl transition-transform active:scale-95 shadow-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAction("request", user._id);
                        }}
                      >
                        Add
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </Tabs.Panel>
          </Tabs>
        </div>
      </div>

      {/* Main Detail View - Modern Minimal Soft Accents */}
      <div className="flex-1 flex flex-col items-center justify-center bg-background relative overflow-hidden text-center transition-all">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://static.whatsapp.net/rsrc.php/v3/y6/r/wa669ae5dbc.png')] bg-repeat"></div>

        {activeView ? (
          <div className="relative z-10 w-full max-w-md bg-content1/20 border border-divider rounded-3xl p-10 backdrop-blur-3xl flex flex-col items-center text-center shadow-xl mx-12 animate-in zoom-in-95 duration-500 transition-all">
            <Avatar.Root className="w-32 h-32 mb-8 border-4 border-primary shadow-xl p-1 bg-background">
              <Avatar.Image
                src={getAvatarUrl(
                  activeView.type === "request"
                    ? activeView.data.sender.profilePic
                    : activeView.data.profilePic,
                  activeView.type === "request"
                    ? activeView.data.sender.fullName
                    : activeView.data.fullName,
                )}
              />
              <Avatar.Fallback className="text-5xl text-primary font-bold bg-primary/10 uppercase">
                {
                  (activeView.type === "request"
                    ? activeView.data.sender.fullName
                    : activeView.data.fullName)[0]
                }
              </Avatar.Fallback>
            </Avatar.Root>

            <h2 className="text-4xl font-bold text-foreground mb-4 tracking-tighter uppercase font-outline-1">
              {activeView.type === "request"
                ? activeView.data.sender.fullName
                : activeView.data.fullName}
            </h2>
            <div className="w-16 h-1 bg-secondary rounded-full mb-8 shadow-sm"></div>

            <p className="text-default-500 text-sm mb-12 leading-relaxed font-bold opacity-80 px-4 uppercase tracking-tighter">
              A nexus connect identified. Start sharing encrypted communication
              with this user immediately.
            </p>

            <div className="w-full flex gap-4 transition-all">
              {activeView.type === "friend" && (
                <Button
                  fullWidth
                  className="h-16 text-lg bg-primary text-white font-bold rounded-2xl shadow-lg shadow-primary/20 flex items-center justify-center transition-all hover:scale-[1.02] active:scale-95 uppercase tracking-widest"
                >
                  Send Transmission
                </Button>
              )}
              {activeView.type === "request" && (
                <>
                  <Button
                    fullWidth
                    className="h-16 text-lg font-bold rounded-2xl bg-primary text-white shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95 uppercase tracking-widest"
                    onClick={() =>
                      handleAction("respond", activeView.data._id, "accepted")
                    }
                  >
                    Accept Link
                  </Button>
                  <Button
                    fullWidth
                    className="h-16 text-lg font-bold rounded-2xl bg-default-100 text-foreground transition-all hover:bg-danger hover:text-white active:scale-95 uppercase tracking-widest"
                    onClick={() =>
                      handleAction("respond", activeView.data._id, "rejected")
                    }
                  >
                    Terminate
                  </Button>
                </>
              )}
              {activeView.type === "discover" && (
                <Button
                  fullWidth
                  className="h-16 text-lg font-bold rounded-2xl bg-primary text-white shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95 uppercase tracking-widest"
                  onClick={() => handleAction("request", activeView.data._id)}
                >
                  Request Link
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="relative z-10 flex flex-col items-center max-w-sm text-center px-12 animate-in fade-in slide-in-from-bottom-12 duration-1000">
            <div className="w-24 h-24 rounded-3xl bg-primary/10 flex items-center justify-center mb-10 shadow-inner">
              <FiUserPlus className="text-6xl text-primary" />
            </div>
            <h2 className="text-4xl font-bold text-foreground mb-4 tracking-tighter uppercase font-outline-1">
              Network
            </h2>
            <div className="w-12 h-0.5 bg-secondary rounded-full mb-6 shadow-sm"></div>
            <p className="text-default-500 text-sm leading-relaxed font-bold opacity-70 uppercase tracking-widest">
              Establish connections and manage transmission requests in your
              nexus grid.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FriendsPage;
