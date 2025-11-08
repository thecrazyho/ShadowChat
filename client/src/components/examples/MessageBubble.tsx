import MessageBubble from "../MessageBubble";

export default function MessageBubbleExample() {
  return (
    <div className="space-y-4 p-6 max-w-2xl">
      <MessageBubble
        id="1"
        content="Hey! How's the project going?"
        timestamp="10:30 AM"
        isSender={false}
        senderName="Alex Chen"
        showAvatar={true}
      />
      <MessageBubble
        id="2"
        content="Going great! Just finished the authentication flow."
        timestamp="10:32 AM"
        isSender={true}
        status="read"
      />
      <MessageBubble
        id="3"
        content="That's awesome! Can you show me a demo?"
        timestamp="10:33 AM"
        isSender={false}
        senderName="Alex Chen"
        showAvatar={true}
      />
      <MessageBubble
        id="4"
        content="Sure, let me set up a meeting for this afternoon."
        timestamp="10:35 AM"
        isSender={true}
        status="delivered"
      />
    </div>
  );
}
