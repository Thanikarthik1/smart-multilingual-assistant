import ChatComponent from "@/components/Chatbot/ChatComponent";
import { ChatHeader } from "@/components/Chatbot/ChatHeader";

export const MainContent = () => {
  return (
    <div className="flex flex-col flex-1 h-full overflow-hidden">
      <div className="p-4 border-b border-border bg-background">
        <ChatHeader />
      </div>
      <ChatComponent />
    </div>
  );
};
