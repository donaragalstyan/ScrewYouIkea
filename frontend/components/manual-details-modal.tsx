"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Sparkles } from 'lucide-react'

interface ManualDetailsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  fileName: string
  onGenerate: (manualName: string) => void
}

export function ManualDetailsModal({ open, onOpenChange, fileName, onGenerate }: ManualDetailsModalProps) {
  const [nameOption, setNameOption] = useState<"filename" | "custom">("filename")
  const [customName, setCustomName] = useState("")

  const handleGenerate = () => {
    const manualName = nameOption === "filename" ? fileName : customName
    if (manualName.trim()) {
      onGenerate(manualName)
      // Reset state
      setNameOption("filename")
      setCustomName("")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-primary flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-secondary" />
            Manual Details
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">Tell us what this assembly manual is for</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <RadioGroup value={nameOption} onValueChange={(value) => setNameOption(value as "filename" | "custom")}>
            <div className="flex items-start space-x-3 rounded-lg border border-border p-4 hover:bg-secondary/5 transition-colors">
              <RadioGroupItem value="filename" id="filename" className="mt-1" />
              <div className="flex-1">
                <Label htmlFor="filename" className="text-primary font-medium cursor-pointer">
                  Use filename
                </Label>
                <p className="text-sm text-muted-foreground mt-1 break-all">{fileName}</p>
              </div>
            </div>

            <div className="flex items-start space-x-3 rounded-lg border border-border p-4 hover:bg-secondary/5 transition-colors">
              <RadioGroupItem value="custom" id="custom" className="mt-1" />
              <div className="flex-1 space-y-2">
                <Label htmlFor="custom" className="text-primary font-medium cursor-pointer">
                  Enter custom name
                </Label>
                <Input
                  id="custom-input"
                  placeholder="e.g., IKEA Billy Bookcase"
                  value={customName}
                  onChange={(e) => {
                    setCustomName(e.target.value)
                    setNameOption("custom")
                  }}
                  className="bg-background/50 border-border text-foreground placeholder:text-muted-foreground"
                />
              </div>
            </div>
          </RadioGroup>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="border-border text-foreground">
            Cancel
          </Button>
          <Button
            variant="secondary"
            onClick={handleGenerate}
            disabled={nameOption === "custom" && !customName.trim()}
            className="gap-2"
          >
            <Sparkles className="h-4 w-4" />
            Generate
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
