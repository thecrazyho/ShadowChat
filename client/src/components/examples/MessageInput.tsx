import MessageInput from "../MessageInput";

export default function MessageInputExample() {
  return (
    <div className="w-full">
      <MessageInput
        onSend={(message, fileUrl, fileType) => console.log("Message sent:", { message, fileUrl, fileType })}
      />
    </div>
  );
}
