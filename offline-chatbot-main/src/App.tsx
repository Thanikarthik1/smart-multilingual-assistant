import * as React from "react";
import { ApplicationShell } from "@/components/layout/ApplicationShell";
import { ChatProvider } from "@/contexts/ChatContext";
import { FileUploadProvider } from "@/contexts/FileUploadContext";

function App() {
  return (
    <div className="h-screen w-screen overflow-hidden">
      <FileUploadProvider>
        <ChatProvider>
          <ApplicationShell />
        </ChatProvider>
      </FileUploadProvider>
    </div>
  );
}

export default App;
