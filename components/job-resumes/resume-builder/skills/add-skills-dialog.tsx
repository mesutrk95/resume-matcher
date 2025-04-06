"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
 
type AddSkillsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (skills: string[], category: string) => void;
  categories: string[];
  selectedCategory: string | null;
};

export function AddSkillsDialog({ open, onOpenChange, onSave, categories }: AddSkillsDialogProps) {
  const [skills, setSkills] = useState("")
  const [category, setCategory] = useState(categories[0] || "")
  const [newCategory, setNewCategory] = useState("")
  const [isAddingNewCategory, setIsAddingNewCategory] = useState(false)

  const handleSubmit = () => {
    const skillsList = skills
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0)

    if (skillsList.length > 0) {
      onSave(skillsList, isAddingNewCategory ? newCategory : category)
      setSkills("")
      setCategory(categories[0] || "")
      setNewCategory("")
      setIsAddingNewCategory(false)
    }
  }

  const handleCategorySelect = (value: string) => {
    if (value === "new") {
      setIsAddingNewCategory(true)
    } else {
      setCategory(value)
      setIsAddingNewCategory(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Skills</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Skills (separate by comma)</label>
            <Textarea
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              placeholder="e.g. JavaScript, React, Node.js"
              rows={3}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground mt-1">Enter multiple skills separated by commas</p>
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Category</label>
            {isAddingNewCategory ? (
              <div className="flex gap-2">
                <Input
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="Enter new category"
                  className="flex-1"
                />
                <Button variant="outline" size="sm" onClick={() => setIsAddingNewCategory(false)}>
                  Cancel
                </Button>
              </div>
            ) : (
              <Select onValueChange={handleCategorySelect} value={category || ""}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                  <SelectItem value="new">+ Add new category</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!skills.trim() || (!category && !newCategory)}>
            Add Skills
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

