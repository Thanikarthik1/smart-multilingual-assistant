import * as React from "react";
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type FormEvent,
  type KeyboardEvent,
  type RefObject,
  useCallback,
  useMemo,
} from "react";

import { useFileUpload } from "@/contexts/FileUploadContext";
import { toast } from "@/hooks/use-toast";
import useLocalStorage from "@/hooks/useLocalStorage";
import { checkFileType, convertImagesToBase64 } from "@/utils/fileUtility";

// Safe port resolution
const PORT =
  import.meta?.env?.VITE_PORT ||
  (typeof process !== "undefined" && process.env?.VITE_PORT) ||
  "5005";

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

interface ChatContextType {
  models: any[];
  prompt: string;
  setPrompt: React.Dispatch<React.SetStateAction<string>>;
  userLang: string;
  setUserLang: React.Dispatch<React.SetStateAction<string>>;
  userPromptPlaceholder: string | null;
  responseStream: string;
  currentModel: any;
  setCurrentModel: React.Dispatch<React.SetStateAction<any>>;
  systemMessage: string;
  setSystemMessage: (message: string) => void;
  responseStreamLoading: boolean;
  conversationHistory: Message[];
  setConversationHistory: React.Dispatch<React.SetStateAction<Message[]>>;
  handleAskPrompt: (event: FormEvent) => Promise<void>;
  handleKeyDown: (event: KeyboardEvent) => void;
  messagesEndRef: RefObject<HTMLDivElement | null>;
  resetChat: () => void;
  handleDataQuery: (query: string) => Promise<void>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const { uploadedFiles, setUploadedFiles } = useFileUpload();

  const [models, setModels] = useState<any[]>([]);
  const [currentModel, setCurrentModel] = useLocalStorage("currentOfflineModel", null);
  const [prompt, setPrompt] = useState("");
  const [userPromptPlaceholder, setUserPromptPlaceholder] = useState<string | null>(null);
  const [responseStream, setResponseStream] = useState("");
  const [responseStreamLoading, setResponseStreamLoading] = useState(false);
  const [systemMessage, setSystemMessage] = useLocalStorage("systemMessage", "You are a helpful assistant.");
  const [conversationHistory, setConversationHistory] = useLocalStorage("conversationHistory", []);
  const [userLang, setUserLang] = useState<string>("eng_Latn");

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const getValidHistory = useCallback(() => {
    return conversationHistory.filter(
      (msg: Message) =>
        msg.role &&
        typeof msg.content === "string" &&
        msg.content.trim().length > 0
    );
  }, [conversationHistory]);

  const handleDataQuery = useCallback(
    async (query: string) => {
      if (!currentModel) {
        toast({ description: "Please select a model." });
        return;
      }

      setResponseStreamLoading(true);
      try {
        const res = await fetch(`http://localhost:${PORT}/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            conversationHistory: getValidHistory(),
            prompt: query,
            model:
              typeof currentModel === "string"
                ? { name: currentModel }
                : currentModel?.name
                ? { name: currentModel.name }
                : { name: "microsoft/phi-2" },
            systemMessage,
            images: [],
            src_lang: userLang,
            tgt_lang: userLang,
          }),
        });

        const data = await res.json();
        console.log("📦 Backend response (handleDataQuery):", data);

        setConversationHistory((prev: Message[]) => [
          ...prev,
          { role: "user", content: query },
          { role: "assistant", content: data.reply },
        ]);
      } catch (err) {
        toast({ description: "Query failed." });
      } finally {
        setResponseStreamLoading(false);
        setUserPromptPlaceholder(null);
        setUploadedFiles([]);
      }
    },
    [currentModel, systemMessage, getValidHistory, userLang, setConversationHistory, setUploadedFiles]
  );

  const handleAskPrompt = useCallback(
    async (event: FormEvent) => {
      event.preventDefault();

      if (!prompt.trim() && uploadedFiles.length === 0) {
        toast({ description: "Please enter a prompt." });
        return;
      }

      if (!currentModel) {
        toast({ description: "Please select a model." });
        return;
      }

      const uploadedImages = uploadedFiles.filter((file: any) => checkFileType(file) === "image");
      const uploadedDocuments = uploadedFiles.filter((file: any) => checkFileType(file) === "document");

      const fileNames = uploadedFiles.length > 0
        ? "\nUploaded Files: " + uploadedFiles.map((f: any) => f.name).join(", ")
        : "";

      const displayPrompt = prompt + fileNames;
      const finalPrompt = prompt;

      setUserPromptPlaceholder(displayPrompt);
      setPrompt("");
      setResponseStream("");
      setResponseStreamLoading(true);

      try {
        const base64Images = uploadedImages.length > 0
          ? await convertImagesToBase64(uploadedImages)
          : [];

        const combinedPrompt = uploadedDocuments.length > 0
          ? uploadedDocuments.map((f: any) => f.content).join("\n") + "\n\n" + finalPrompt
          : finalPrompt;

        const res = await fetch(`http://localhost:${PORT}/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            conversationHistory: getValidHistory(),
            prompt: combinedPrompt,
            model:
              typeof currentModel === "string"
                ? { name: currentModel }
                : currentModel?.name
                ? { name: currentModel.name }
                : { name: "microsoft/phi-2" },
            systemMessage,
            images: base64Images,
            src_lang: userLang,
            tgt_lang: userLang,
          }),
        });

        const data = await res.json();
        console.log("📦 Backend response (handleAskPrompt):", data);

        setConversationHistory((prev: Message[]) => [
          ...prev,
          { role: "user", content: finalPrompt },
          { role: "assistant", content: data.reply },
        ]);
      } catch (error) {
        toast({ description: "Error fetching response." });
      } finally {
        setResponseStreamLoading(false);
        setUserPromptPlaceholder(null);
        setUploadedFiles([]);
      }
    },
    [prompt, uploadedFiles, currentModel, systemMessage, getValidHistory, userLang, setConversationHistory, setUploadedFiles]
  );

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        handleAskPrompt(event as unknown as FormEvent);
      }
    },
    [handleAskPrompt]
  );

  const resetChat = useCallback(() => {
    setConversationHistory([]);
    setUploadedFiles([]);
    setPrompt("");
    setResponseStream("");
    setResponseStreamLoading(false);
  }, [setConversationHistory, setUploadedFiles]);

  useEffect(() => {
    const fetchModels = async () => {
      try {
        const res = await fetch("http://localhost:11434/api/tags");
        const data = await res.json();
        setModels(data.models);
      } catch (error) {
        toast({ description: "Could not load models from Ollama" });
      }
    };
    fetchModels();
  }, []);

  useEffect(() => {
    if (models.length > 0 && !currentModel) {
      setCurrentModel(models[0]);
    }
  }, [models, currentModel, setCurrentModel]);

  useEffect(() => {
    scrollToBottom();
  }, [conversationHistory, responseStream, userPromptPlaceholder, scrollToBottom]);

  const contextValue = useMemo(
    () => ({
      models,
      prompt,
      setPrompt,
      userLang,
      setUserLang,
      userPromptPlaceholder,
      responseStream,
      currentModel,
      setCurrentModel,
      systemMessage,
      setSystemMessage,
      responseStreamLoading,
      conversationHistory,
      setConversationHistory,
      handleAskPrompt,
      handleKeyDown,
      messagesEndRef,
      resetChat,
      handleDataQuery,
    }),
    [
      models,
      prompt,
      userLang,
      userPromptPlaceholder,
      responseStream,
      currentModel,
      systemMessage,
      responseStreamLoading,
      conversationHistory,
      handleAskPrompt,
      handleKeyDown,
      resetChat,
      handleDataQuery,
    ]
  );

  return (
    <ChatContext.Provider value={contextValue}>
      {children}
    </ChatContext.Provider>
  );
}

const useChatContext = (): ChatContextType => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChatContext must be used within a ChatProvider");
  }
  return context;
};

export { useChatContext };
