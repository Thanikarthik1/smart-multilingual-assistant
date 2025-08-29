import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useChatContext } from "@/contexts/ChatContext";
import { ChatSystemModal } from "@/components/Chatbot/ChatSystemModal";

export const ChatHeader = () => {
  const {
    models,
    currentModel,
    setCurrentModel,
    systemMessage,
    setSystemMessage,
    resetChat,
    userLang,
    setUserLang,
  }: any = useChatContext();

  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <div className="flex justify-between items-start gap-4 w-full flex-wrap">
      <div className="flex items-center gap-4 flex-wrap">
        {/* Model Selector */}
        <div>
          <Label htmlFor="model-select" className="text-foreground">
            Model
          </Label>
          <Select value={currentModel} onValueChange={setCurrentModel}>
            <SelectTrigger className="w-48 text-foreground">
              <SelectValue placeholder="Select a model" />
            </SelectTrigger>
            <SelectContent>
              {models?.map((model: any, index: number) => (
                <SelectItem
                  key={index}
                  value={model.model}
                  className="text-foreground"
                >
                  {model.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Language Selector */}
        <div>
          <Label htmlFor="language-select" className="text-foreground">
            Language
          </Label>
          <Select value={userLang} onValueChange={setUserLang}>
            <SelectTrigger className="w-48 text-foreground">
              <SelectValue placeholder="Select language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="eng_Latn">English</SelectItem>
              <SelectItem value="hin_Deva">Hindi</SelectItem>
              <SelectItem value="tel_Telu">Telugu</SelectItem>
              <SelectItem value="tam_Taml">Tamil</SelectItem>
              <SelectItem value="kan_Knda">Kannada</SelectItem>
              <SelectItem value="mal_Mlym">Malayalam</SelectItem>
              <SelectItem value="guj_Gujr">Gujarati</SelectItem>
              <SelectItem value="ben_Beng">Bengali</SelectItem>
              {/* Add more as needed */}
            </SelectContent>
          </Select>
        </div>

        {/* System Prompt Modal */}
        <ChatSystemModal
          dialogOpen={dialogOpen}
          setDialogOpen={setDialogOpen}
          systemMessage={systemMessage}
          setSystemMessage={setSystemMessage}
        />
      </div>

      {/* Reset Button */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          onClick={resetChat}
          className="text-foreground"
        >
          Clear Chat
        </Button>
      </div>
    </div>
  );
};
