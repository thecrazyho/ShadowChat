import { useState } from "react";
import CreateGroupModal from "../CreateGroupModal";
import { Button } from "@/components/ui/button";

export default function CreateGroupModalExample() {
  const [open, setOpen] = useState(false);

  return (
    <div className="p-6">
      <Button onClick={() => setOpen(true)} data-testid="button-open-create-group">
        Create Group
      </Button>
      <CreateGroupModal
        open={open}
        onClose={() => setOpen(false)}
        onCreateGroup={(data) => console.log("Group created:", data)}
      />
    </div>
  );
}
