import { Navbar } from "@/components/layout/Navbar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { MainContent } from "@/components/layout/MainContent";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/toaster";

export const ApplicationShell = () => {
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="h-screen w-screen flex flex-col">
        <Navbar />
        <div className="flex flex-1 overflow-hidden">
          <AppSidebar />
          <div className="flex-1 flex flex-col overflow-hidden">
            <MainContent />
          </div>
        </div>
        <Toaster />
      </div>
    </SidebarProvider>
  );
};
