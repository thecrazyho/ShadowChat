import { Avatar as AvatarBase, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface AvatarProps {
  src?: string;
  name: string;
  size?: "sm" | "md" | "lg";
  online?: boolean;
}

export default function Avatar({ src, name, size = "md", online }: AvatarProps) {
  const sizeClasses = {
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-16 w-16 text-lg",
  };

  const dotSize = {
    sm: "h-2 w-2",
    md: "h-2.5 w-2.5",
    lg: "h-3 w-3",
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="relative inline-block">
      <AvatarBase className={sizeClasses[size]}>
        <AvatarImage src={src} alt={name} />
        <AvatarFallback className="bg-primary text-primary-foreground font-medium">
          {getInitials(name)}
        </AvatarFallback>
      </AvatarBase>
      {online !== undefined && (
        <span
          className={`absolute bottom-0 right-0 block ${dotSize[size]} rounded-full border-2 border-background ${
            online ? "bg-status-online" : "bg-status-offline"
          }`}
        />
      )}
    </div>
  );
}
