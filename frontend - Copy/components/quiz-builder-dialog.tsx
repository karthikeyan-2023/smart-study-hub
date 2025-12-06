"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Brain, Zap, Hash } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { useAppStore } from "@/lib/store"
import type { Quiz, QuizQuestion } from "@/lib/types"
import { toast } from "sonner"

interface QuizBuilderDialogProps {
  notebookId: string
  trigger?: React.ReactNode
}

const difficultyColors = {
  easy: "text-success",
  medium: "text-warning",
  hard: "text-destructive",
}

export function QuizBuilderDialog({ notebookId, trigger }: QuizBuilderDialogProps) {
  const router = useRouter()
  const { createQuiz, setCurrentQuiz } = useAppStore()
  const [open, setOpen] = useState(false)
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("medium")
  const [numQuestions, setNumQuestions] = useState([5])
  const [isGenerating, setIsGenerating] = useState(false)

  const generateMockQuestions = (count: number, diff: string): QuizQuestion[] => {
    const questionTemplates = [
      {
        type: "mcq" as const,
        questionText: "Which of the following best describes this concept?",
        options: [
          { id: "a", text: "A technique to increase model complexity" },
          { id: "b", text: "A method to prevent overfitting by adding penalty terms" },
          { id: "c", text: "A way to speed up training" },
          { id: "d", text: "None of the above" },
        ],
        correctOptionId: "b",
        explanation: "This is the correct answer because it accurately describes the fundamental concept.",
      },
      {
        type: "tf" as const,
        questionText: "Increasing the number of features always improves model performance.",
        options: [
          { id: "true", text: "True" },
          { id: "false", text: "False" },
        ],
        correctOptionId: "false",
        explanation: "Adding more features can lead to overfitting and the curse of dimensionality.",
      },
      {
        type: "mcq" as const,
        questionText: "What is the primary purpose of cross-validation?",
        options: [
          { id: "a", text: "To increase training speed" },
          { id: "b", text: "To estimate model performance on unseen data" },
          { id: "c", text: "To reduce dataset size" },
          { id: "d", text: "To eliminate all bias" },
        ],
        correctOptionId: "b",
        explanation: "Cross-validation helps estimate how well a model will generalize to independent data.",
      },
      {
        type: "tf" as const,
        questionText: "A model with high variance typically performs well on training data but poorly on test data.",
        options: [
          { id: "true", text: "True" },
          { id: "false", text: "False" },
        ],
        correctOptionId: "true",
        explanation: "High variance indicates overfitting, where the model memorizes training data.",
      },
      {
        type: "mcq" as const,
        questionText: "Which regularization technique can drive feature coefficients to exactly zero?",
        options: [
          { id: "a", text: "L2 (Ridge)" },
          { id: "b", text: "L1 (Lasso)" },
          { id: "c", text: "Dropout" },
          { id: "d", text: "Batch normalization" },
        ],
        correctOptionId: "b",
        explanation: "L1 regularization can shrink coefficients to zero, effectively performing feature selection.",
      },
    ]

    return Array.from({ length: count }, (_, i) => ({
      ...questionTemplates[i % questionTemplates.length],
      questionId: `q${Date.now()}-${i}`,
      source: { documentId: "doc1", page: Math.floor(Math.random() * 20) + 1 },
    }))
  }

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsGenerating(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))

    const questions = generateMockQuestions(numQuestions[0], difficulty)
    const quiz: Quiz = {
      quizId: `quiz${Date.now()}`,
      notebookId,
      difficulty,
      questions,
      createdAt: new Date(),
    }

    createQuiz(quiz)
    setCurrentQuiz(quiz)

    toast.success("Quiz generated successfully!")
    setOpen(false)
    setIsGenerating(false)

    router.push(`/quiz/${quiz.quizId}`)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="secondary" className="gap-2">
            <Brain className="h-4 w-4" />
            Generate Quiz
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            Generate Quiz
          </DialogTitle>
          <DialogDescription>Create a quiz based on your study materials.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleGenerate} className="space-y-5">
          {/* Difficulty */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Difficulty
            </Label>
            <div className="flex gap-2">
              {(["easy", "medium", "hard"] as const).map((d) => (
                <Button
                  key={d}
                  type="button"
                  variant={difficulty === d ? "default" : "outline"}
                  size="sm"
                  className={difficulty === d ? "" : difficultyColors[d]}
                  onClick={() => setDifficulty(d)}
                >
                  {d.charAt(0).toUpperCase() + d.slice(1)}
                </Button>
              ))}
            </div>
          </div>

          {/* Number of Questions */}
          <div className="space-y-3">
            <Label className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Hash className="h-4 w-4" />
                Questions
              </span>
              <span className="text-primary font-medium">{numQuestions[0]}</span>
            </Label>
            <Slider value={numQuestions} onValueChange={setNumQuestions} min={3} max={15} step={1} className="w-full" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>3</span>
              <span>15</span>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isGenerating}>
              {isGenerating ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Generating...
                </span>
              ) : (
                "Generate Quiz"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
