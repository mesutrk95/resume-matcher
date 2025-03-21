"use client";

import type React from "react";
import { useState, useRef, useEffect } from "react";
import { Send } from "lucide-react";
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
import { JobResume } from "@prisma/client";
import { ResumeContent } from "@/types/resume";
import { BlobProvider } from "@react-pdf/renderer";
import { ResumeDocument } from "../job-resumes/resume-document";

type Message = {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
};

export function ChatInterface({
  jobResume,
  resume,
}: {
  jobResume: JobResume;
  resume: ResumeContent;
}) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: "Hello! How can I assist you today?",
      role: "assistant",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [shareResume, setShareResume] = useState(true);
  const [shareJD, setShareJD] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (pdfBlob: Blob | null) => {
    if (!inputValue.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      role: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    let formData;
    if (shareResume && pdfBlob) {
      const file = new File([pdfBlob], "resume.pdf", {
        type: "application/pdf",
      });
      formData = new FormData();
      formData.append("file", file);
    }

    const resp = await askCustomQuestionFromAI(
      jobResume.id,
      inputValue,
      shareJD,
      formData
    );

    const aiMessage: Message = {
      id: (Date.now() + 1).toString(),
      content: resp.result,
      role: "assistant",
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, aiMessage]);
    setIsLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent, blob: Blob | null) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(blob);
    }
  };

  return (
    <Card className="w-full h-full flex flex-col justify-stretch">
      <CardHeader className="shrink-0 flex flex-row items-center gap-5 space-y-0 p-4">
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
            id="share-resume"
            checked={shareJD}
            onCheckedChange={setShareJD}
          />
          <Label htmlFor="share-resume">Share Job Description</Label>
        </div>
      </CardHeader>
      <CardContent className="flex-auto h-0 pt-6 p-2">
        <ScrollArea className="h-full pr-4">
          <div className="flex flex-col space-y-4">
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
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
      <CardFooter className="shrink-0 p-4 flex flex-col gap-3">
        <div className="flex w-full items-center space-x-2">
          <BlobProvider document={<ResumeDocument resume={resume} />}>
            {({ blob, url, loading, error }) => {
              // if (error) {
              //   return <div>Error: {error}</div>;
              // }

              return (
                <>
                  <Input
                    placeholder="Type your message..."
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, blob)}
                    disabled={isLoading}
                    className="flex-1"
                  />
                  <Button
                    size="icon"
                    onClick={() => handleSendMessage(blob)}
                    disabled={isLoading || !inputValue.trim()}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </>
              );
            }}
          </BlobProvider>
        </div>
        {/* <div className="flex items-center space-x-2 self-end">
          <Switch
            id="share-resume"
            checked={shareResume}
            onCheckedChange={setShareResume}
          />
          <Label
            htmlFor="share-resume"
            className="text-sm text-muted-foreground"
          >
            Share Resume PDF
          </Label>
        </div> */}
      </CardFooter>
    </Card>
  );
}
