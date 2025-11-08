import ChatHeader from "../ChatHeader";

export default function ChatHeaderExample() {
  return (
    <div className="w-full">
      <ChatHeader
        name="Alex Chen"
        status="online"
        online={true}
        onBack={() => console.log("Back clicked")}
      />
    </div>
  );
}
