import { Sidebar } from "../../components/chat/Sidebar";
import { ChatArea } from "../../components/chat/ChatArea";

export default function ChatPage() {
  return (
    <div className="flex h-[calc(100vh-64px)] w-full overflow-hidden bg-background">
      <div className="hidden md:flex h-full border-r border-default-200">
        <Sidebar aria-label="Users list" />
      </div>

      <main className="flex-1 flex flex-col h-full min-w-0 bg-default-50/5">
        <ChatArea />
      </main>
    </div>
  );
}
