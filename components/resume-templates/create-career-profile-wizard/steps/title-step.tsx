"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"

// Sample job titles for autocomplete
const jobTitles = [
  "Senior Backend Developer",
  "Senior Frontend Developer",
  "Senior Full Stack Developer",
  "Senior UI/UX Designer",
  "Product Manager",
  "Data Scientist",
  "DevOps Engineer",
  "Machine Learning Engineer",
  "Software Architect",
  "Mobile App Developer",
  "Cloud Solutions Architect",
  "Cybersecurity Analyst",
]

interface TitleStepProps {
  onSelectTitle: (title: string) => void
  initialTitle?: string
}

export function TitleStep({ onSelectTitle, initialTitle = "" }: TitleStepProps) {
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState(initialTitle)
  const [customTitle, setCustomTitle] = useState(jobTitles.includes(initialTitle) ? "" : initialTitle)
  const [submitted, setSubmitted] = useState(!!initialTitle)
  const inputRef = useRef<HTMLInputElement>(null)

  // Only update the parent when the user explicitly submits a value
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      onSelectTitle(value || customTitle)
    }, 500) // 500ms debounce

    return () => clearTimeout(timeoutId)
  }, [value, customTitle, onSelectTitle])

  const handleValueChange = (newValue: string) => {
    setValue(newValue)
  }

  const handleCustomTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomTitle(e.target.value)
  }

  const handleBlur = () => {
    // No validation needed
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-xl font-bold">What job title are you targeting?</h3>
        <p className="text-sm text-gray-500">
          Select a job title from the list or enter a custom one. This will help us tailor your resume.
        </p>
      </div>

      <div className="space-y-4">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" role="combobox" aria-expanded={open} className="w-full justify-between">
              {value ? value : "Select job title..."}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[300px] p-0">
            <Command>
              <CommandInput placeholder="Search job title..." />
              <CommandList>
                <CommandEmpty>
                  <div className="p-2 text-sm">No job title found. You can enter a custom title below.</div>
                </CommandEmpty>
                <CommandGroup>
                  {jobTitles.map((title) => (
                    <CommandItem
                      key={title}
                      value={title}
                      onSelect={(currentValue) => {
                        const newValue = currentValue === value ? "" : currentValue
                        handleValueChange(newValue)
                        setOpen(false)
                      }}
                    >
                      <Check className={cn("mr-2 h-4 w-4", value === title ? "opacity-100" : "opacity-0")} />
                      {title}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        <div className="space-y-2">
          <p className="text-sm text-gray-500">Or enter a custom job title:</p>
          <input
            ref={inputRef}
            type="text"
            value={customTitle}
            onChange={handleCustomTitleChange}
            onBlur={handleBlur}
            placeholder="Enter custom job title..."
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>
      </div>
    </div>
  )
}
