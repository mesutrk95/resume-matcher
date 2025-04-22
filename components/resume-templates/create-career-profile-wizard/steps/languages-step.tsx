"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Plus, Trash } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface Language {
  id: string
  language: string
  proficiency: string
}

interface LanguagesStepProps {
  onSaveLanguages: (languages: Language[]) => void
  initialLanguages?: Language[]
}

// Sample languages list
const languagesList = [
  "English",
  "Spanish",
  "French",
  "German",
  "Chinese",
  "Japanese",
  "Korean",
  "Russian",
  "Arabic",
  "Portuguese",
  "Italian",
  "Dutch",
  "Hindi",
  "Turkish",
  "Swedish",
  "Polish",
  "Vietnamese",
  "Thai",
  "Greek",
  "Hebrew",
]

// Proficiency levels with colors
const proficiencyLevels = [
  { value: "Basic", color: "bg-gray-200 text-gray-800" },
  { value: "Intermediate", color: "bg-blue-200 text-blue-800" },
  { value: "Fluent", color: "bg-green-200 text-green-800" },
  { value: "Native", color: "bg-purple-200 text-purple-800" },
]

export function LanguagesStep({ onSaveLanguages, initialLanguages = [] }: LanguagesStepProps) {
  // Initialize with Fluent English if no initial languages
  const [languages, setLanguages] = useState<Language[]>(() => {
    if (initialLanguages.length > 0) {
      return initialLanguages
    }

    return [
      {
        id: "1",
        language: "English",
        proficiency: "Fluent",
      },
    ]
  })

  // Auto-save when languages change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      onSaveLanguages(languages)
    }, 500) // 500ms debounce

    return () => clearTimeout(timeoutId)
  }, [languages, onSaveLanguages])

  const addLanguage = () => {
    setLanguages([
      ...languages,
      {
        id: Date.now().toString(),
        language: "",
        proficiency: "",
      },
    ])
  }

  const removeLanguage = (id: string) => {
    setLanguages(languages.filter((lang) => lang.id !== id))
  }

  const updateLanguage = (id: string, field: keyof Language, value: string) => {
    setLanguages(languages.map((lang) => (lang.id === id ? { ...lang, [field]: value } : lang)))
  }

  // Get the appropriate badge color based on proficiency level
  const getProficiencyColor = (proficiency: string) => {
    const level = proficiencyLevels.find((level) => level.value === proficiency)
    return level?.color || "bg-gray-100 text-gray-800"
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-xl font-bold">Languages</h3>
        <p className="text-sm text-gray-500">Add languages you speak and your proficiency level.</p>
      </div>

      <div className="space-y-4">
        {languages.map((language) => (
          <Card key={language.id} className="overflow-hidden">
            <CardContent className="p-0">
              <div className="flex items-center justify-between p-4 bg-gray-50 border-b">
                <Select
                  value={language.language}
                  onValueChange={(value) => updateLanguage(language.id, "language", value)}
                >
                  <SelectTrigger className="w-full border-0 bg-transparent focus:ring-0 px-0">
                    <SelectValue placeholder="Select a language" />
                  </SelectTrigger>
                  <SelectContent>
                    {languagesList.map((lang) => (
                      <SelectItem key={lang} value={lang}>
                        {lang}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeLanguage(language.id)}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0"
                  disabled={languages.length === 1}
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </div>

              <div className="p-4">
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {proficiencyLevels.map((level) => (
                    <Badge
                      key={level.value}
                      className={`${language.proficiency === level.value ? level.color : "bg-gray-100 text-gray-500"} 
                                hover:bg-opacity-80 cursor-pointer px-3 py-1 whitespace-nowrap`}
                      onClick={() => updateLanguage(language.id, "proficiency", level.value)}
                    >
                      {level.value}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Button type="button" variant="outline" onClick={addLanguage} className="w-full mt-4">
        <Plus className="h-4 w-4 mr-2" />
        Add Another Language
      </Button>

      {/* Display selected languages summary */}
      {languages.some((lang) => lang.language && lang.proficiency) && (
        <div className="mt-6 p-4   rounded-lg">
          <h4 className="text-sm font-bold mb-2">Your Languages</h4>
          <div className="flex flex-wrap gap-2">
            {languages
              .filter((lang) => lang.language && lang.proficiency)
              .map((lang) => (
                <Badge key={lang.id} className={`${getProficiencyColor(lang.proficiency)} px-3 py-1`}>
                  {lang.language} ({lang.proficiency})
                </Badge>
              ))}
          </div>
        </div>
      )}
    </div>
  )
}
