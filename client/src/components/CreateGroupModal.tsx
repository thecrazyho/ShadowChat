import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Users, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CreateGroupModalProps {
  open: boolean;
  onClose: () => void;
  onCreateGroup: (data: { name: string; inviteCode: string }) => void;
}

export default function CreateGroupModal({ open, onClose, onCreateGroup }: CreateGroupModalProps) {
  const [groupName, setGroupName] = useState("");
  const [step, setStep] = useState<"create" | "success">("create");
  const [inviteCode, setInviteCode] = useState("");
  const { toast } = useToast();

  const handleCreate = () => {
    if (groupName.trim()) {
      const code = Math.random().toString(36).substring(2, 10).toUpperCase();
      setInviteCode(code);
      setStep("success");
      onCreateGroup({ name: groupName, inviteCode: code });
    }
  };

  const handleClose = () => {
    setStep("create");
    setGroupName("");
    setInviteCode("");
    onClose();
  };

  const copyInviteCode = () => {
    navigator.clipboard.writeText(inviteCode);
    toast({
      title: "Copied!",
      description: "Invite code copied to clipboard",
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        {step === "create" ? (
          <>
            <DialogHeader>
              <DialogTitle>Create Group Chat</DialogTitle>
              <DialogDescription>Create a new group and invite members</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex justify-center">
                <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center">
                  <Users className="h-12 w-12 text-primary" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="groupName">Group Name</Label>
                <Input
                  id="groupName"
                  placeholder="Enter group name"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  data-testid="input-group-name"
                />
              </div>
              <Button
                onClick={handleCreate}
                className="w-full"
                disabled={!groupName.trim()}
                data-testid="button-create-group"
              >
                Create Group
              </Button>
            </div>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Group Created!</DialogTitle>
              <DialogDescription>Share this invite code with members</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">Group: {groupName}</p>
                <div className="bg-muted rounded-lg p-4">
                  <p className="text-xs text-muted-foreground mb-2">Invite Code</p>
                  <p className="text-2xl font-mono font-semibold tracking-wider" data-testid="text-invite-code">
                    {inviteCode}
                  </p>
                </div>
              </div>
              <Button
                onClick={copyInviteCode}
                variant="outline"
                className="w-full"
                data-testid="button-copy-code"
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy Invite Code
              </Button>
              <Button onClick={handleClose} className="w-full" data-testid="button-done">
                Done
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
