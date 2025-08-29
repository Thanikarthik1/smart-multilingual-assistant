import * as React from "react";
import { useChatContext } from "@/contexts/ChatContext";
import { Loader2 } from "lucide-react";

// Utility to detect language and return corresponding font class
const getFontClass = (text: string): string => {
  if (/[అ-హ]/.test(text)) return "font-telugu";       // Telugu
  if (/[ಅ-ಹ]/.test(text)) return "font-kannada";      // Kannada
  if (/[க-ஹ]/.test(text)) return "font-tamil";        // Tamil
  if (/[ക-ഹ]/.test(text)) return "font-malayalam";    // Malayalam
  if (/[ਗ-ਹ]/.test(text)) return "font-punjabi";      // Gurmukhi
  if (/[ଅ-ହ]/.test(text)) return "font-oriya";        // Odia
  if (/[અ-હ]/.test(text)) return "font-gujarati";     // Gujarati
  if (/[अ-ह]/.test(text)) return "font-hindi";        // Hindi/Marathi
  if (/[অ-হ]/.test(text)) return "font-bengali";      // Bengali/Assamese
  if (/[ء-ۿ]/.test(text)) return "font-urdu";         // Urdu (Arabic script)
  return "font-default";
};

const ChatComponent: React.FC = () => {
  const {
    prompt,
    setPrompt,
    conversationHistory,
    handleAskPrompt,
    handleKeyDown,
    userPromptPlaceholder,
    responseStream,
    responseStreamLoading,
    messagesEndRef,
  } = useChatContext();

  return (
    <div className="flex flex-col h-full">
      {/* Chat Messages */}
      <div className="flex flex-col flex-1 overflow-y-auto p-4 space-y-4">
        {conversationHistory.map((msg, index) => (
          <div
            key={index}
            className={`max-w-[70%] px-4 py-2 rounded-lg whitespace-pre-line ${getFontClass(msg.content)} ${
              msg.role === "user"
                ? "self-end bg-blue-100 text-black text-right"
                : "self-start bg-gray-800 text-white"
            }`}
          >
            {msg.content}
          </div>
        ))}

        {userPromptPlaceholder && (
          <div className={`self-end bg-blue-100 text-black px-4 py-2 rounded-lg ${getFontClass(userPromptPlaceholder)}`}>
            {userPromptPlaceholder}
          </div>
        )}

        {responseStream && (
          <div className={`self-start bg-gray-800 text-white px-4 py-2 rounded-lg ${getFontClass(responseStream)}`}>
            {responseStream}
          </div>
        )}

        {responseStreamLoading && (
          <div className="self-start bg-gray-800 text-white px-4 py-2 rounded-lg flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Generating response...
          </div>
        )}

        {/* ✅ Fix: Assert non-null ref */}
        <div ref={messagesEndRef as React.RefObject<HTMLDivElement>} />
      </div>

      {/* Input Section */}
      <form
        onSubmit={handleAskPrompt}
        className="border-t border-border bg-background p-4 flex gap-2"
      >
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask your question..."
          className="flex-1 bg-input text-foreground px-4 py-2 rounded-lg border border-border focus:outline-none"
          disabled={responseStreamLoading}
        />
        <button
          type="submit"
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 disabled:opacity-50"
          disabled={responseStreamLoading || !prompt.trim()}
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default ChatComponent;
