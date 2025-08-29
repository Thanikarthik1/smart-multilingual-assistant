import * as React from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/components/ui/sidebar";
import { Plus, Settings, User } from "lucide-react";
import { useMediaQuery } from "react-responsive";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useChatContext } from "@/contexts/ChatContext";

export const AppSidebar = () => {
  const isMobile = useMediaQuery({ maxWidth: 768 });
  const { resetChat, conversationHistory } = useChatContext();

  const previousChats = conversationHistory
    .filter((msg) => msg.role === "user")
    .slice(-10)
    .reverse();

  return (
    <Sidebar
      className="top-16 shrink-0 border-r h-screen flex flex-col"
      variant={isMobile ? "floating" : "sidebar"}
      collapsible={isMobile ? "offcanvas" : "icon"}
    >
      <SidebarContent className="flex flex-col h-full">
        {/* New Chat Button */}
        <div className="p-4">
          <Button className="w-full" variant="secondary" onClick={resetChat}>
            <Plus className="mr-2" size={16} />
            New Chat
          </Button>
        </div>

        {/* Scrollable Chat History */}
        <ScrollArea className="flex-1 px-4">
          <SidebarGroup>
            <SidebarGroupLabel className="text-xs text-muted-foreground mb-2">
              Recent Chats
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {previousChats.map((chat, index) => (
                  <SidebarMenuItem key={index}>
                    <SidebarMenuButton asChild>
                      <a href="#">
                        <span className="truncate">{chat.content}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </ScrollArea>

        {/* Profile/Settings */}
        <div className="p-4 border-t">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <a href="#">
                  <User className="mr-2" size={16} />
                  Profile
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <a href="#">
                  <Settings className="mr-2" size={16} />
                  Settings
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </div>
      </SidebarContent>
    </Sidebar>
  );
};
