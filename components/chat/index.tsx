"use client";

import type React from "react";
import { useState, useRef, useEffect } from "react";
import { Send, MessageSquare, Eraser } from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ChatMessage } from "./chat-message";
import { askCustomQuestionFromAI } from "@/actions/job-resume";
import type { JobResume } from "@prisma/client";
import type { ResumeContent } from "@/types/resume";
import { pdf } from "@react-pdf/renderer";
import { ResumeDocument } from "../job-resumes/resume-document";
import { toast } from "sonner";
import { randomNDigits } from "@/lib/utils";
import { ContentWithMeta } from "./types";
import ErrorBoundary from "../shared/error-boundary";

// Predefined questions
const PREDEFINED_QUESTIONS = [
  "Why do you think you are the best fit for this job?",
  "What did you do in the past that you can proud yourself",
  "What were the last hard moments and how did you handle them",
  "What are your key strengths for this position?",
  "How does your experience align with this role?",
  "Give me a good professional summary for the resume",
  "Give me a cover letter",
];

const INITIAL_MESSAGE = {
  id: "1",
  parts: [{ text: "Hello! How can I assist you today?" }],
  role: "model",
  timestamp: new Date(),
} as ContentWithMeta;

const blob2base64 = (pdfBlob: Blob) => {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(pdfBlob);

    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

export function ChatInterface({
  jobResume,
  resume,
}: {
  jobResume: JobResume;
  resume: ResumeContent;
}) {
  const [messages, setMessages] = useState<ContentWithMeta[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [shareResume, setShareResume] = useState(true);
  const [shareJD, setShareJD] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
      inline: "nearest",
    });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const addMessage = (message: ContentWithMeta) => {
    setMessages((prev) => {
      const msgs = [...prev, message];
      localStorage.setItem(
        "ai-conversation-" + jobResume.id,
        JSON.stringify(msgs)
      );
      return msgs;
    });
  };

  useEffect(() => {
    const chatsStr = localStorage.getItem("ai-conversation-" + jobResume.id);

    if (chatsStr) {
      const messages = JSON.parse(chatsStr) as ContentWithMeta[];
      setMessages(messages.slice(0, 30));
    } else {
      addMessage(INITIAL_MESSAGE);
    }
  }, []);

  // Check if chat is just starting (only has the initial greeting)
  const isChatStarting =
    messages.length <= 1 &&
    messages[0]?.role === "model" &&
    messages[0]?.parts?.[0]?.text === "Hello! How can I assist you today?";

  const handleSendMessage = async (customQuestion?: string) => {
    try {
      const questionToSend = customQuestion || inputValue;
      if (!questionToSend.trim()) return;

      // Add user message
      const userMessage: ContentWithMeta = {
        parts: [{ text: questionToSend }],
        id: randomNDigits(),
        timestamp: new Date(),
        role: "user",
      };

      addMessage(userMessage);
      if (!customQuestion) setInputValue("");
      setIsLoading(true);

      let file = null;
      if (shareResume) {
        const pdfBlob = await pdf(
          <ResumeDocument resume={resume} skipFont={true} />
        ).toBlob();
        file = await blob2base64(pdfBlob!);
      }
      const newMessages = await askCustomQuestionFromAI(
        jobResume.id,
        questionToSend,
        file,
        shareJD,
        messages.filter((m) => m.id !== "1")
      );
      setMessages(newMessages.updatedHistory);
      localStorage.setItem(
        "ai-conversation-" + jobResume.id,
        JSON.stringify(newMessages.updatedHistory)
      );
    } catch (ex) {
      toast.error(ex?.toString() || "Something went wrong");
    }
    setIsLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handlePredefinedQuestion = (question: string) => {
    handleSendMessage(question);
  };
  const clearChat = () => {
    localStorage.removeItem("ai-conversation-" + jobResume.id);
    setMessages([INITIAL_MESSAGE]);
  };
  return (
    <Card className="w-full  flex flex-col   ">
      <CardHeader className=" flex flex-row items-center gap-5 space-y-0 p-4 border-b">
        <div className="flex items-center space-x-2">
          <Switch
            id="share-resume"
            checked={shareResume}
            onCheckedChange={setShareResume}
          />
          <Label htmlFor="share-resume">Share My Resume</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            id="share-jd"
            checked={!!jobResume.jobId && shareJD}
            onCheckedChange={setShareJD}
            disabled={!jobResume.jobId}
          />
          <Label htmlFor="share-jd">Share Job Description</Label>
        </div>
      </CardHeader>
      <CardContent className="pt-6 px-2 py-0">
        <ScrollArea className="h-[400px] pr-4 relative">
          <div className="flex flex-col space-y-4 py-4">
            {messages.map((message, index) => (
              <ErrorBoundary
                key={message.id + index}
                fallback={<div>Error! Something went wrong.</div>}
              >
                <ChatMessage message={message} />
              </ErrorBoundary>
            ))}
            {isLoading && (
              <div className="flex justify-center">
                <div className="animate-pulse text-muted-foreground">
                  AI is thinking...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter className="shrink-0 p-4 flex flex-col border-t">
        <>
          {isChatStarting && (
            <div className="w-full mb-3">
              <h3 className="text-sm font-medium mb-4 text-muted-foreground">
                Popular questions to get started:
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {PREDEFINED_QUESTIONS.map((question, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="justify-start h-auto py-3 px-4 text-left text-xs"
                    onClick={() => handlePredefinedQuestion(question)}
                    disabled={isLoading}
                  >
                    <MessageSquare className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="truncate">{question}</span>
                  </Button>
                ))}
              </div>
            </div>
          )}
          <div className="flex w-full items-center space-x-2">
            <Button size="icon" variant={"outline"} onClick={clearChat}>
              <Eraser className="h-4 w-4" />
            </Button>
            <Input
              placeholder="Type your message..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => handleKeyDown(e)}
              disabled={isLoading}
              className="flex-1"
              autoFocus={false}
            />
            <Button
              size="icon"
              onClick={() => handleSendMessage()}
              disabled={isLoading || !inputValue.trim()}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </>
      </CardFooter>
    </Card>
  );
}
