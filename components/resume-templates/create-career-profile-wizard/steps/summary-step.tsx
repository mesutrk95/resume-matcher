"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Sparkles } from "lucide-react"

interface SummaryStepProps {
  onSaveSummary: (summary: string) => void
  initialSummary?: string
}

export function SummaryStep({ onSaveSummary, initialSummary = "" }: SummaryStepProps) {
  const [summary, setSummary] = useState(initialSummary)
  const [isGenerating, setIsGenerating] = useState(false)
  const [hasChanged, setHasChanged] = useState(false)

  // Only save when the summary has changed and is not empty
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      onSaveSummary(summary)
    }, 500) // 500ms debounce

    return () => clearTimeout(timeoutId)
  }, [summary, onSaveSummary])

  const handleSummaryChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setSummary(e.target.value)
    setHasChanged(true)
  }

  const handleGenerateAI = async () => {
    setIsGenerating(true)

    // Simulate AI generation with a timeout
    setTimeout(() => {
      const generatedSummary =
        "Experienced professional with a proven track record of delivering high-quality solutions. " +
        "Skilled in collaborating with cross-functional teams to achieve business objectives. " +
        "Passionate about leveraging technology to solve complex problems and drive innovation. " +
        "Committed to continuous learning and staying updated with industry trends and best practices. " +
        "Seeking to utilize my expertise to contribute to a dynamic organization's growth and success."

      setSummary(generatedSummary)
      setHasChanged(true)
      setIsGenerating(false)
    }, 1500)
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-xl font-bold">Professional Summary</h3>
        <p className="text-sm text-gray-500">
          Write a compelling professional summary that highlights your expertise and career goals.
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label htmlFor="summary" className="text-sm font-medium">
              Your professional summary:
            </label>
            <Button
              variant="outline"
              size="sm"
              onClick={handleGenerateAI}
              disabled={isGenerating}
              className="flex items-center gap-1"
            >
              <Sparkles className="h-4 w-4" />
              {isGenerating ? "Generating..." : "Generate with AI"}
            </Button>
          </div>
          <Textarea
            id="summary"
            value={summary}
            onChange={handleSummaryChange}
            placeholder="Write your professional summary here..."
            className="min-h-[200px] resize-none"
          />
          <p className="text-xs text-gray-500">
            Aim for 4-6 sentences that highlight your experience, skills, and career goals.
          </p>
        </div>
      </div>
    </div>
  )
}
