import Avatar from "./Avatar";
import { Check, CheckCheck, FileText, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MessageBubbleProps {
  id: string;
  content: string;
  timestamp: string;
  isSender: boolean;
  senderName?: string;
  senderAvatar?: string;
  status?: "sent" | "delivered" | "read";
  showAvatar?: boolean;
  fileUrl?: string;
  fileType?: string;
}

export default function MessageBubble({
  content,
  timestamp,
  isSender,
  senderName,
  senderAvatar,
  status,
  showAvatar = false,
  fileUrl,
  fileType,
}: MessageBubbleProps) {
  const isImage = fileType?.startsWith("image/");
  const isFile = fileUrl && !isImage;

  return (
    <div className={`flex gap-2 ${isSender ? "flex-row-reverse" : "flex-row"}`}>
      {showAvatar && !isSender && (
        <div className="shrink-0">
          <Avatar name={senderName || "User"} src={senderAvatar} size="sm" />
        </div>
      )}
      <div className={`flex flex-col ${isSender ? "items-end" : "items-start"} max-w-lg`}>
        {showAvatar && !isSender && (
          <span className="text-xs text-muted-foreground mb-1 px-1">{senderName}</span>
        )}
        <div
          className={`rounded-2xl overflow-hidden ${
            isSender
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-foreground"
          }`}
        >
          {isImage && fileUrl && (
            <img
              src={fileUrl}
              alt="Shared image"
              className="max-w-sm rounded-lg"
              loading="lazy"
            />
          )}
          {isFile && fileUrl && (
            <div className="flex items-center gap-3 px-4 py-3">
              <FileText className="h-8 w-8 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{content}</p>
                <p className="text-xs opacity-70">Attachment</p>
              </div>
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 shrink-0"
                asChild
              >
                <a href={fileUrl} download target="_blank" rel="noopener noreferrer">
                  <Download className="h-4 w-4" />
                </a>
              </Button>
            </div>
          )}
          {!fileUrl && content && (
            <div className="px-4 py-2">
              <p className="text-sm break-words">{content}</p>
            </div>
          )}
          {fileUrl && isImage && content && (
            <div className="px-4 py-2">
              <p className="text-sm break-words">{content}</p>
            </div>
          )}
        </div>
        <div className="flex items-center gap-1 mt-1 px-1">
          <span className="text-xs text-muted-foreground">{timestamp}</span>
          {isSender && status && (
            <span className="text-muted-foreground">
              {status === "sent" && <Check className="h-3 w-3" />}
              {status === "delivered" && <CheckCheck className="h-3 w-3" />}
              {status === "read" && <CheckCheck className="h-3 w-3 text-primary" />}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
