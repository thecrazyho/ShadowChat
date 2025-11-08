import Avatar from "../Avatar";

export default function AvatarExample() {
  return (
    <div className="flex items-center gap-6 p-6">
      <Avatar name="Alex Chen" size="sm" online={true} />
      <Avatar name="Sarah Miller" size="md" online={true} />
      <Avatar name="John Doe" size="lg" online={false} />
    </div>
  );
}
