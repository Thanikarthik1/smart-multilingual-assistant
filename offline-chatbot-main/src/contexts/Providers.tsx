// src/components/Providers.tsx or src/Providers.tsx (depending on your structure)

import * as React from "react";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { ChatProvider } from "@/contexts/ChatContext";
import { FileUploadProvider } from "@/contexts/FileUploadContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <FileUploadProvider>
        <ChatProvider>{children}</ChatProvider>
      </FileUploadProvider>
    </ThemeProvider>
  );
}
