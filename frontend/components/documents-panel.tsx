"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { FileText, FileImage, Upload, Check, Loader2, File, MoreVertical, Trash2, Link, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { useAppStore } from "@/lib/store"
import type { Document } from "@/lib/types"
import { toast } from "sonner"

interface DocumentsPanelProps {
  notebookId: string
}

const fileTypeIcons: Record<string, React.ReactNode> = {
  pdf: <FileText className="h-4 w-4 text-red-400" />,
  ppt: <FileImage className="h-4 w-4 text-orange-400" />,
  docx: <File className="h-4 w-4 text-blue-400" />,
  txt: <FileText className="h-4 w-4 text-muted-foreground" />,
  url: <Globe className="h-4 w-4 text-primary" />, // Added URL icon
}

export function DocumentsPanel({ notebookId }: DocumentsPanelProps) {
  const { documents, selectedDocumentId, setSelectedDocument, addDocument, updateDocument, deleteDocument } =
    useAppStore()
  const notebookDocs = documents[notebookId] || []
  const [isDragging, setIsDragging] = useState(false)
  const [uploadingFiles, setUploadingFiles] = useState<{ name: string; progress: number }[]>([])

  const [isAddingUrl, setIsAddingUrl] = useState(false)
  const [urlForm, setUrlForm] = useState({ name: "", url: "" })

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const simulateUpload = useCallback(
    async (file: File) => {
      const fileName = file.name
      const fileExt = fileName.split(".").pop()?.toLowerCase() || "txt"
      const fileType = (["pdf", "ppt", "docx", "txt"].includes(fileExt) ? fileExt : "txt") as Document["fileType"]

      setUploadingFiles((prev) => [...prev, { name: fileName, progress: 0 }])

      for (let i = 0; i <= 100; i += 10) {
        await new Promise((resolve) => setTimeout(resolve, 100))
        setUploadingFiles((prev) => prev.map((f) => (f.name === fileName ? { ...f, progress: i } : f)))
      }

      const docId = `doc${Date.now()}`

      const newDoc: Document = {
        documentId: docId,
        name: fileName,
        fileType,
        pages: Math.floor(Math.random() * 30) + 5,
        status: "processing",
      }

      addDocument(notebookId, newDoc)

      setUploadingFiles((prev) => prev.filter((f) => f.name !== fileName))
      toast.success(`${fileName} uploaded successfully!`)

      setTimeout(() => {
        updateDocument(notebookId, docId, { status: "indexed" })
        toast.success(`${fileName} has been indexed and is ready!`)
      }, 2000)
    },
    [notebookId, addDocument, updateDocument],
  )

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)

      const files = Array.from(e.dataTransfer.files)
      for (const file of files) {
        await simulateUpload(file)
      }
    },
    [simulateUpload],
  )

  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || [])
      for (const file of files) {
        await simulateUpload(file)
      }
      e.target.value = ""
    },
    [simulateUpload],
  )

  const handleAddUrl = () => {
    if (!urlForm.url.trim()) {
      toast.error("Please enter a URL")
      return
    }

    let url = urlForm.url.trim()
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      url = "https://" + url
    }

    const docId = `doc${Date.now()}`
    const name = urlForm.name.trim() || new URL(url).hostname

    const newDoc: Document = {
      documentId: docId,
      name,
      fileType: "url",
      pages: 1,
      status: "indexed",
      url,
    }

    addDocument(notebookId, newDoc)
    toast.success(`Link "${name}" added successfully!`)
    setUrlForm({ name: "", url: "" })
    setIsAddingUrl(false)
  }

  const handleDeleteDocument = (docId: string, docName: string) => {
    deleteDocument(notebookId, docId)
    toast.success(`${docName} deleted`)
  }

  return (
    <div className="h-full flex flex-col bg-card border-r border-border">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <h2 className="font-semibold text-foreground">Documents</h2>
        <p className="text-xs text-muted-foreground mt-1">
          {notebookDocs.length} file{notebookDocs.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Upload Area */}
      <div className="p-3 space-y-2">
        <label
          className={cn(
            "flex flex-col items-center justify-center p-4 border-2 border-dashed rounded-lg cursor-pointer transition-colors",
            isDragging ? "border-primary bg-primary/10" : "border-border hover:border-primary/50 hover:bg-secondary/50",
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          aria-label="Upload documents by dragging or clicking"
        >
          <Upload className={cn("h-6 w-6 mb-2", isDragging ? "text-primary" : "text-muted-foreground")} />
          <span className="text-sm text-muted-foreground text-center">
            Drop files here or <span className="text-primary">browse</span>
          </span>
          <span className="text-xs text-muted-foreground mt-1">PDF, PPT, DOCX, TXT</span>
          <input
            type="file"
            className="hidden"
            accept=".pdf,.ppt,.pptx,.doc,.docx,.txt"
            multiple
            onChange={handleFileSelect}
          />
        </label>

        <Dialog open={isAddingUrl} onOpenChange={setIsAddingUrl}>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full gap-2 bg-transparent">
              <Link className="h-4 w-4" />
              Add Link / Website
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Website Link</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="url">Website URL</Label>
                <Input
                  id="url"
                  placeholder="https://example.com/article"
                  value={urlForm.url}
                  onChange={(e) => setUrlForm((prev) => ({ ...prev, url: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Display Name (optional)</Label>
                <Input
                  id="name"
                  placeholder="Article Title"
                  value={urlForm.name}
                  onChange={(e) => setUrlForm((prev) => ({ ...prev, name: e.target.value }))}
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button onClick={handleAddUrl}>Add Link</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Uploading Files */}
      {uploadingFiles.length > 0 && (
        <div className="px-3 space-y-2">
          {uploadingFiles.map((file) => (
            <div key={file.name} className="p-2 rounded-md bg-secondary/50">
              <div className="flex items-center gap-2 mb-1">
                <Loader2 className="h-3 w-3 animate-spin text-primary" />
                <span className="text-xs text-foreground truncate flex-1">{file.name}</span>
              </div>
              <Progress value={file.progress} className="h-1" />
            </div>
          ))}
        </div>
      )}

      {/* Document List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        {notebookDocs.map((doc) => (
          <div role="button"
            key={doc.documentId}
            onClick={() => setSelectedDocument(doc.documentId)}
            className={cn(
              "w-full flex items-center gap-3 p-2.5 rounded-md text-left transition-colors",
              selectedDocumentId === doc.documentId
                ? "bg-primary/20 border border-primary/30"
                : "hover:bg-secondary/70 border border-transparent",
            )}
            aria-label={`Select ${doc.name}`}
            aria-pressed={selectedDocumentId === doc.documentId}
          >
            <div className="flex-shrink-0">{fileTypeIcons[doc.fileType] || fileTypeIcons.txt}</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-foreground truncate">{doc.name}</p>
              <p className="text-xs text-muted-foreground">
                {doc.fileType === "url" ? "Web Link" : `${doc.pages} pages`}
              </p>
            </div>
            <div className="flex items-center gap-1">
              <Badge
                variant={doc.status === "indexed" ? "default" : "secondary"}
                className={cn(
                  "text-xs",
                  doc.status === "indexed"
                    ? "bg-success/20 text-success border-success/30"
                    : "bg-warning/20 text-warning border-warning/30",
                )}
              >
                {doc.status === "indexed" ? (
                  <Check className="h-3 w-3 mr-1" />
                ) : (
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                )}
                {doc.status === "indexed" ? "Ready" : "Processing"}
              </Badge>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => e.stopPropagation()}>
                    <MoreVertical className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDeleteDocument(doc.documentId, doc.name)
                    }}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        ))}

        {notebookDocs.length === 0 && (
          <div className="text-center py-8 text-muted-foreground text-sm">
            <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
            No documents yet
          </div>
        )}
      </div>
    </div>
  )
}
