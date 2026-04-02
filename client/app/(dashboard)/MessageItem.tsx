"use client";

import React, { useState } from "react";
import {
  Avatar,
  Button,
  Chip,
  Popover,
  Toolbar,
  ToggleButtonGroup,
  ToggleButton,
} from "@heroui/react";
import { IoMdMore, IoMdCopy } from "react-icons/io";
import { MdReply, MdEdit, MdDelete, MdInfo } from "react-icons/md";
import moment from "moment";
import { getAvatarUrl } from "@/src/utils/avatar";

interface MessageItemProps {
  msg: any;
  user: any;
  activeChat: any;
  isMe: boolean;
  isLastSent: boolean;
  seenAt: string | null;
  onReply: (msg: any) => void;
  onEdit: (msg: any) => void;
  onUnsend: (id: string) => void;
  onCopy: (text: string) => void;
  onReaction: (id: string, emoji: string) => void;
  isEditing: boolean;
  editText: string;
  setEditText: (text: string) => void;
  onSaveEdit: (id: string, text: string) => void;
  onCancelEdit: () => void;
  editInputRef: React.RefObject<HTMLInputElement | null>;
}

const MessageItem = ({
  msg,
  user,
  activeChat,
  isMe,
  isLastSent,
  seenAt,
  onReply,
  onEdit,
  onUnsend,
  onCopy,
  onReaction,
  isEditing,
  editText,
  setEditText,
  onSaveEdit,
  onCancelEdit,
  editInputRef,
}: MessageItemProps) => {
  const [isMainOpen, setIsMainOpen] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  const handleAction = (action: () => void) => {
    action();
    setIsMainOpen(false);
    setIsMoreOpen(false);
  };

  return (
    <div key={msg._id || msg.tempId}>
      <p
        className={`text-[10px] text-gray-400 ${isMe ? "text-right mr-2" : "text-left ml-8"}`}
      >
        {moment(msg.createdAt).format("LT")}
        {msg.isEdited && (
          <span className="ml-1 italic opacity-60">(edited)</span>
        )}
        {isMe && isLastSent && seenAt && (
          <span className="ml-2 text-primary font-semibold">
            Seen {moment(seenAt).format("LT")}
          </span>
        )}
      </p>

      {/* Reply context preview */}
      {msg.replyTo && (
        <div
          className={`flex ${isMe ? "justify-end" : "justify-start"} ${!isMe ? "ml-8" : "mr-2"}`}
        >
          <div className="text-[10px] bg-default-100 border-l-2 border-primary rounded px-2 py-1 mb-0.5 max-w-[60%] truncate opacity-70">
            <span className="font-semibold">
              {msg.replyTo.senderId === user?._id ? "You" : activeChat.fullName}
            </span>
            : {msg.replyTo.text}
          </div>
        </div>
      )}

      <div className={`flex gap-1 ${isMe ? "justify-end" : "justify-start"}`}>
        {!isMe && (
          <Avatar className="w-6 h-6">
            <Avatar.Image
              src={getAvatarUrl(activeChat?.profilePic, activeChat?.fullName)}
            />
          </Avatar>
        )}

        {/* Inline Edit Mode */}
        {isEditing ? (
          <div className="flex items-center gap-2 max-w-[70%]">
            <input
              ref={editInputRef}
              type="text"
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  onSaveEdit(msg._id, editText);
                } else if (e.key === "Escape") {
                  onCancelEdit();
                }
              }}
              className="bg-content2 text-foreground px-3 py-2 rounded-xl text-sm outline-none border border-primary focus:ring-1 focus:ring-primary w-full"
            />
            <Button
              size="sm"
              className="bg-primary text-white"
              onPress={() => onSaveEdit(msg._id, editText)}
            >
              Save
            </Button>
            <Button size="sm" variant="ghost" onPress={onCancelEdit}>
              Cancel
            </Button>
          </div>
        ) : (
          <Popover isOpen={isMainOpen} onOpenChange={setIsMainOpen}>
            <Popover.Trigger>
              <div
                className={`relative inline-block p-2 rounded-xl cursor-pointer ${
                  isMe
                    ? "bg-primary text-white"
                    : "bg-accent-foreground text-black"
                }`}
              >
                {msg.image && (
                  <img
                    src={msg.image}
                    alt="attachment"
                    className="max-w-[240px] rounded-lg mb-1"
                  />
                )}
                {msg.text}

                {/* Reaction markers */}
                {msg.reactions?.length > 0 && (
                  <div className="absolute -bottom-3 -left-1 flex flex-wrap gap-0.5 z-10">
                    {msg.reactions.map((r: any, rIdx: number) => (
                      <Chip
                        key={rIdx}
                        size="sm"
                        variant="soft"
                        className="p-0 h-5 min-w-[20px] bg-content2 shadow-sm border border-divider"
                      >
                        <span className="text-[10px]">{r.emoji}</span>
                      </Chip>
                    ))}
                  </div>
                )}
              </div>
            </Popover.Trigger>

            <Popover.Content placement="top" className="overflow-hidden">
              <Toolbar aria-label="Message actions">
                <ToggleButtonGroup>
                  {["👍", "❤️", "😂", "😢", "😡"].map((emoji) => (
                    <ToggleButton
                      key={emoji}
                      isIconOnly
                      aria-label={emoji}
                      id={`reaction-${msg._id}-${emoji}`}
                      onPress={() =>
                        handleAction(() => onReaction(msg._id, emoji))
                      }
                    >
                      {emoji}
                    </ToggleButton>
                  ))}

                  <Popover isOpen={isMoreOpen} onOpenChange={setIsMoreOpen}>
                    <Popover.Trigger>
                      <Button variant="ghost" className="rounded-none">
                        <IoMdMore />
                      </Button>
                    </Popover.Trigger>

                    <Popover.Content>
                      <Popover.Dialog className="p-1 flex flex-col w-full">
                        <Button
                          className="w-full justify-start"
                          variant="ghost"
                          onPress={() => handleAction(() => onReply(msg))}
                        >
                          <MdReply /> Reply
                        </Button>

                        {isMe && (
                          <Button
                            className="w-full justify-start"
                            variant="ghost"
                            onPress={() => handleAction(() => onEdit(msg))}
                          >
                            <MdEdit /> Edit
                          </Button>
                        )}

                        {isMe && (
                          <Button
                            className="w-full justify-start text-danger"
                            variant="ghost"
                            onPress={() =>
                              handleAction(() => onUnsend(msg._id))
                            }
                          >
                            <MdDelete /> Unsend
                          </Button>
                        )}

                        <Button
                          className="w-full justify-start"
                          variant="ghost"
                          onPress={() =>
                            handleAction(() => onCopy(msg.text || ""))
                          }
                        >
                          <IoMdCopy /> Copy
                        </Button>

                        <Button
                          className="w-full justify-start"
                          variant="ghost"
                        >
                          <MdInfo /> Info
                        </Button>
                      </Popover.Dialog>
                    </Popover.Content>
                  </Popover>
                </ToggleButtonGroup>
              </Toolbar>
            </Popover.Content>
          </Popover>
        )}
      </div>
    </div>
  );
};

export default MessageItem;
