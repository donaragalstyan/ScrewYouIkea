"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, Volume2, Loader2 } from "lucide-react"

export function VoiceAssistantInput() {
  const [question, setQuestion] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!question.trim() || isGenerating) return

    setIsGenerating(true)

    // Simulate API call to generate audio response
    setTimeout(() => {
      setIsGenerating(false)
      setIsPlaying(true)

      // Use Web Speech API for text-to-speech
      const utterance = new SpeechSynthesisUtterance(
        `Here's the answer to your question about ${question}: This step requires you to align the parts carefully before securing them with the provided screws.`,
      )
      utterance.rate = 0.9
      utterance.pitch = 1
      utterance.onend = () => {
        setIsPlaying(false)
      }
      window.speechSynthesis.speak(utterance)

      setQuestion("")
    }, 1500)
  }

  return (
    <div className="border-t border-border bg-card p-4">
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <div className="relative flex-1">
          <Input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask a question about this assembly step..."
            disabled={isGenerating || isPlaying}
            className="pr-10 bg-background text-foreground placeholder:text-muted-foreground border-2 border-secondary focus:border-primary"
          />
          {isPlaying && (
            <Volume2 className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 animate-pulse text-primary" />
          )}
        </div>
        <Button
          type="submit"
          disabled={!question.trim() || isGenerating || isPlaying}
          className="bg-secondary text-secondary-foreground hover:bg-secondary/90"
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Thinking...
            </>
          ) : (
            <>
              <Send className="mr-2 h-4 w-4" />
              Ask
            </>
          )}
        </Button>
      </form>
      {isPlaying && (
        <p className="mt-2 text-xs text-muted-foreground flex items-center gap-2">
          <Volume2 className="h-3 w-3 animate-pulse" />
          Playing audio response...
        </p>
      )}
    </div>
  )
}
