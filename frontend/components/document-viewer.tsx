"use client"

import { useState, useEffect, useRef } from "react"
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Search, FileText, X, ExternalLink, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { useAppStore } from "@/lib/store"

interface DocumentViewerProps {
  notebookId: string
}

export function DocumentViewer({ notebookId }: DocumentViewerProps) {
  const { documents, selectedDocumentId, highlightedPage, highlightedSnippet, setHighlight } = useAppStore()
  const notebookDocs = documents[notebookId] || []
  const selectedDoc = notebookDocs.find((d) => d.documentId === selectedDocumentId)

  const [currentPage, setCurrentPage] = useState(1)
  const [zoom, setZoom] = useState(100)
  const [searchQuery, setSearchQuery] = useState("")
  const [showSearch, setShowSearch] = useState(false)
  const [isLoadingUrl, setIsLoadingUrl] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    if (highlightedPage && selectedDoc) {
      setCurrentPage(Math.min(highlightedPage, selectedDoc.pages))
      setTimeout(() => {
        contentRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })
      }, 100)
    }
  }, [highlightedPage, selectedDoc])

  useEffect(() => {
    if (selectedDoc?.fileType === "url" && selectedDoc.url) {
      setIsLoadingUrl(true)
    }
  }, [selectedDoc])

  const totalPages = selectedDoc?.pages || 1

  const handlePrevPage = () => setCurrentPage((p) => Math.max(1, p - 1))
  const handleNextPage = () => setCurrentPage((p) => Math.min(totalPages, p + 1))

  const handleZoomIn = () => setZoom((z) => Math.min(200, z + 25))
  const handleZoomOut = () => setZoom((z) => Math.max(50, z - 25))

  const clearHighlight = () => setHighlight(null, null)

  const generatePageContent = (pageNum: number) => {
    const loremParagraphs = [
      "Machine learning is a subset of artificial intelligence that enables systems to learn and improve from experience without being explicitly programmed. It focuses on developing algorithms that can access data and use it to learn for themselves.",
      "Supervised learning uses labeled datasets to train algorithms to classify data or predict outcomes accurately. Common applications include spam filtering, image recognition, and recommendation systems.",
      "Overfitting occurs when a model learns the detail and noise in the training data to the extent that it negatively impacts the performance of the model on new data.",
      "Regularization is a technique used to reduce overfitting by adding a penalty term to the loss function. L1 (Lasso) and L2 (Ridge) are the most common types of regularization.",
      "Neural networks are computing systems inspired by biological neural networks that constitute animal brains.",
      "Deep learning is part of a broader family of machine learning methods based on artificial neural networks with representation learning.",
    ]

    return loremParagraphs[(pageNum - 1) % loremParagraphs.length]
  }

  if (!selectedDoc) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-background text-muted-foreground">
        <FileText className="h-16 w-16 mb-4 opacity-30" />
        <p className="text-lg font-medium">No document selected</p>
        <p className="text-sm mt-1">Select a document from the panel to view its contents</p>
      </div>
    )
  }

  if (selectedDoc.fileType === "url" && selectedDoc.url) {
    return (
      <div className="h-full flex flex-col bg-background">
        {/* URL Toolbar */}
        <div className="flex items-center justify-between gap-2 p-2 border-b border-border bg-card">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <span className="text-sm font-medium text-foreground truncate">{selectedDoc.name}</span>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" className="gap-1" onClick={() => setIsLoadingUrl(true)}>
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
            <Button variant="ghost" size="sm" className="gap-1" onClick={() => window.open(selectedDoc.url, "_blank")}>
              <ExternalLink className="h-4 w-4" />
              Open
            </Button>
          </div>
        </div>

        {/* URL Display */}
        <div className="px-2 py-1 bg-secondary/50 border-b border-border">
          <p className="text-xs text-muted-foreground truncate">{selectedDoc.url}</p>
        </div>

        {/* Iframe Container */}
        <div className="flex-1 relative">
          {isLoadingUrl && (
            <div className="absolute inset-0 flex items-center justify-center bg-background z-10">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                <p className="text-sm text-muted-foreground">Loading page...</p>
              </div>
            </div>
          )}
          <iframe
            ref={iframeRef}
            src={selectedDoc.url}
            className="w-full h-full border-0"
            onLoad={() => setIsLoadingUrl(false)}
            onError={() => setIsLoadingUrl(false)}
            sandbox="allow-scripts allow-same-origin allow-popups"
            title={selectedDoc.name}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-2 p-2 border-b border-border bg-card">
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={handlePrevPage} disabled={currentPage === 1}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground min-w-[80px] text-center">
            {currentPage} / {totalPages}
          </span>
          <Button variant="ghost" size="icon" onClick={handleNextPage} disabled={currentPage === totalPages}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex-1 truncate text-sm font-medium text-foreground text-center">{selectedDoc.name}</div>

        <div className="flex items-center gap-1">
          {showSearch ? (
            <div className="flex items-center gap-1">
              <Input
                type="search"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-8 w-32 bg-secondary text-xs"
                autoFocus
              />
              <Button variant="ghost" size="icon" onClick={() => setShowSearch(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Button variant="ghost" size="icon" onClick={() => setShowSearch(true)}>
              <Search className="h-4 w-4" />
            </Button>
          )}
          <Button variant="ghost" size="icon" onClick={handleZoomOut} disabled={zoom <= 50}>
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-xs text-muted-foreground min-w-[40px] text-center">{zoom}%</span>
          <Button variant="ghost" size="icon" onClick={handleZoomIn} disabled={zoom >= 200}>
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Highlighted Snippet Banner */}
      {highlightedSnippet && (
        <div className="flex items-center gap-2 p-2 bg-warning/20 border-b border-warning/30">
          <span className="text-xs text-warning flex-1">
            Showing source from page {highlightedPage}: {'"'}
            {highlightedSnippet.slice(0, 50)}...{'"'}
          </span>
          <Button variant="ghost" size="sm" onClick={clearHighlight} className="h-6 text-xs">
            Clear
          </Button>
        </div>
      )}

      {/* Document Content */}
      <div className="flex-1 overflow-auto p-4">
        <div
          ref={contentRef}
          className="max-w-3xl mx-auto bg-card border border-border rounded-lg shadow-lg"
          style={{ transform: `scale(${zoom / 100})`, transformOrigin: "top center" }}
        >
          <div className="p-8 min-h-[600px]">
            <div className="text-xs text-muted-foreground mb-4">Page {currentPage}</div>

            <h2 className="text-xl font-semibold text-foreground mb-4">
              {selectedDoc.name.replace(/\.[^/.]+$/, "")} - Section {currentPage}
            </h2>

            <div className="space-y-4 text-foreground leading-relaxed">
              <p
                className={cn(
                  "p-2 rounded transition-colors",
                  highlightedPage === currentPage && highlightedSnippet
                    ? "bg-yellow-500/20 border-l-2 border-yellow-500"
                    : "",
                )}
              >
                {generatePageContent(currentPage)}
              </p>

              <p>{generatePageContent(currentPage + 10)}</p>

              {currentPage <= 3 && (
                <div className="mt-6 p-4 bg-secondary/50 rounded-lg border border-border">
                  <h3 className="font-medium text-foreground mb-2">Key Concepts:</h3>
                  <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                    <li>Training data and test data separation</li>
                    <li>Model complexity and generalization</li>
                    <li>Bias-variance tradeoff</li>
                    <li>Cross-validation techniques</li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
