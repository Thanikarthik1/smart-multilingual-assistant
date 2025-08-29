import {
  ArrowUp,
  File,
  Paperclip,
  X,
  Image,
  Send,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { cn } from "@/lib/utils";
import { useChatContext } from "@/contexts/ChatContext";
import { useFileUpload } from "@/contexts/FileUploadContext";
import { checkFileType } from "@/utils/fileUtility";

interface FilePreviewProps {
  file: File & { url?: string };
  index: number;
}

export const ChatInput = () => {
  const {
    prompt,
    setPrompt,
    handleAskPrompt,
    responseStreamLoading,
  } = useChatContext();

  const {
    uploadedFiles,
    handleFileUpload,
    removeFile,
    fileInputRef,
  } = useFileUpload();

  const FilePreview = ({ file, index }: FilePreviewProps) => {
    const fileType = checkFileType(file);

    return (
      <HoverCard openDelay={0} closeDelay={0}>
        <HoverCardTrigger asChild>
          <div className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm cursor-pointer bg-muted">
            {fileType === "image" ? (
              <Image className="h-4 w-4 text-muted-foreground" />
            ) : (
              <File className="h-4 w-4 text-muted-foreground" />
            )}
            <span className="max-w-[150px] truncate">{file.name}</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-4 w-4 p-0 text-muted-foreground hover:text-destructive"
              onClick={() => removeFile(index)}
              type="button"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </HoverCardTrigger>
        {fileType === "image" && file.url && (
          <HoverCardContent className="w-80">
            <div className="space-y-2">
              <img
                src={file.url}
                alt={file.name}
                className="rounded-lg w-full h-auto object-cover"
              />
              <p className="text-sm text-muted-foreground">{file.name}</p>
            </div>
          </HoverCardContent>
        )}
      </HoverCard>
    );
  };

  return (
    <div className="sticky bottom-0 z-10 bg-background border-t pt-2 px-4">
      {uploadedFiles.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {uploadedFiles.map((file, index) => (
            <FilePreview key={index} file={file} index={index} />
          ))}
        </div>
      )}

      <div className="flex items-end gap-2 bg-muted rounded-xl p-3">
        <Label
          htmlFor="file-upload"
          className="cursor-pointer hover:bg-muted-foreground/10 p-2 rounded-md"
        >
          <Paperclip className="h-5 w-5 text-muted-foreground" />
          <Input
            id="file-upload"
            type="file"
            multiple
            onChange={handleFileUpload}
            className="hidden"
            ref={fileInputRef}
          />
        </Label>

        <Textarea
          id="prompt"
          placeholder="Type your message here..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              if (!responseStreamLoading && prompt.trim() !== "") {
                handleAskPrompt(e as unknown as React.FormEvent);
              }
            }
          }}
          rows={1}
          className={cn(
            "w-full resize-none border-0 bg-transparent focus:ring-0 text-base",
            "scrollbar-thin scrollbar-thumb-muted-foreground/20"
          )}
        />

        <Button
          size="icon"
          className={cn("h-10 w-10", responseStreamLoading && "animate-pulse")}
          onClick={(e) => handleAskPrompt(e as unknown as React.FormEvent)}
          disabled={responseStreamLoading}
          type="button"
        >
          <Send className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};

export default ChatInput;
