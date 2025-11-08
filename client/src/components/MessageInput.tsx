import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Paperclip, Image as ImageIcon, Send, X } from "lucide-react";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface MessageInputProps {
  onSend: (message: string, fileUrl?: string, fileType?: string) => void;
}

export default function MessageInput({ onSend }: MessageInputProps) {
  const [message, setMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = (file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Maximum file size is 10MB",
        variant: "destructive",
      });
      return;
    }
    setSelectedFile(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim() && !selectedFile) return;

    setIsUploading(true);

    try {
      let fileUrl: string | undefined;
      let fileType: string | undefined;

      if (selectedFile) {
        const uploadResult = await api.uploadFile(selectedFile);
        fileUrl = uploadResult.fileUrl;
        fileType = uploadResult.fileType;
      }

      onSend(message.trim() || `Sent ${selectedFile?.name}`, fileUrl, fileType);
      setMessage("");
      setSelectedFile(null);
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload file",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 p-4 border-t border-border">
      {selectedFile && (
        <div className="flex items-center gap-2 p-2 bg-muted rounded-lg">
          <Paperclip className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm flex-1 truncate">{selectedFile.name}</span>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => setSelectedFile(null)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
      <div className="flex items-center gap-2">
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
          accept=".pdf,.doc,.docx,.txt"
        />
        <input
          ref={imageInputRef}
          type="file"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
          accept="image/*"
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => fileInputRef.current?.click()}
          data-testid="button-attach-file"
          disabled={isUploading}
        >
          <Paperclip className="h-5 w-5" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => imageInputRef.current?.click()}
          data-testid="button-attach-image"
          disabled={isUploading}
        >
          <ImageIcon className="h-5 w-5" />
        </Button>
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1"
          data-testid="input-message"
          disabled={isUploading}
        />
        <Button
          type="submit"
          size="icon"
          disabled={(!message.trim() && !selectedFile) || isUploading}
          data-testid="button-send"
        >
          <Send className="h-5 w-5" />
        </Button>
      </div>
    </form>
  );
}
