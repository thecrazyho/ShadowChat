import { useState } from "react";
import UserSearchModal from "../UserSearchModal";
import { Button } from "@/components/ui/button";

export default function UserSearchModalExample() {
  const [open, setOpen] = useState(false);

  return (
    <div className="p-6">
      <Button onClick={() => setOpen(true)} data-testid="button-open-search">
        Open User Search
      </Button>
      <UserSearchModal
        open={open}
        onClose={() => setOpen(false)}
        onSelectUser={(user) => console.log("Selected user:", user)}
      />
    </div>
  );
}
