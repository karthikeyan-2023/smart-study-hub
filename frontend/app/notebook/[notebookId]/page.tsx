"use client"

import { useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AppHeader } from "@/components/app-header"
import { AuthGuard } from "@/components/auth-guard"
import { DocumentsPanel } from "@/components/documents-panel"
import { DocumentViewer } from "@/components/document-viewer"
import { ChatPanel } from "@/components/chat-panel"
import { useAppStore } from "@/lib/store"

export default function NotebookPage() {
  const params = useParams()
  const router = useRouter()
  const notebookId = params.notebookId as string

  const { notebooks, setCurrentNotebook, currentNotebook } = useAppStore()
  const notebook = notebooks.find((n) => n.id === notebookId)

  useEffect(() => {
    if (notebook) {
      setCurrentNotebook(notebook)
    }
    return () => setCurrentNotebook(null)
  }, [notebook, setCurrentNotebook])

  if (!notebook) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-foreground mb-2">Notebook not found</h2>
            <Button onClick={() => router.push("/dashboard")}>Back to Dashboard</Button>
          </div>
        </div>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard>
      <div className="h-screen flex flex-col bg-background">
        <AppHeader />

        {/* Sub-header with notebook info */}
        <div className="flex items-center gap-3 px-4 py-2 border-b border-border bg-card">
          <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard")} aria-label="Back to dashboard">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-semibold text-foreground truncate">{notebook.title}</h1>
            <p className="text-xs text-muted-foreground">{notebook.subject}</p>
          </div>
        </div>

        {/* Three-column layout */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left: Documents Panel */}
          <div className="w-64 flex-shrink-0 hidden md:block">
            <DocumentsPanel notebookId={notebookId} />
          </div>

          {/* Center: Document Viewer */}
          <div className="flex-1 min-w-0">
            <DocumentViewer notebookId={notebookId} />
          </div>

          {/* Right: Chat Panel */}
          <div className="w-96 flex-shrink-0 hidden lg:block">
            <ChatPanel notebookId={notebookId} />
          </div>
        </div>
      </div>
    </AuthGuard>
  )
}
