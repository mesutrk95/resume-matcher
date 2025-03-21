import { cn } from "@/lib/utils"

type Message = {
  id: string
  content: string
  role: "user" | "assistant"
  timestamp: Date
}

interface ChatMessageProps {
  message: Message
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user"

  return (
    <div className={cn("ps-2 flex", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cn("max-w-[80%] rounded-lg px-4 py-2", isUser ? "bg-primary text-primary-foreground" : "bg-muted")}
      >
        <div className="text-sm" dangerouslySetInnerHTML={{ __html: message.content || '' }} />
        <p className="mt-1 text-xs opacity-50">
          {message.timestamp.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>
    </div>
  )
}

