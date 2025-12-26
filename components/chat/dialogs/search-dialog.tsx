// components/chat/dialogs/search-dialog.tsx
"use client"

import React, { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, MessageSquare, Hash, Loader2, ArrowUpRight, X } from "lucide-react"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { searchChat, clearSearchResults } from "@/store/slices/chatSlice"
import useDebounce from "@/hooks/useDebounce"

interface SearchDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onChannelSelect?: (channelId: number, channelType?: string) => void
  onMessageSelect?: (channelId: number, messageId: number, channelType?: string) => void
  onStartDM?: (userId: string) => void
}

const stripHtml = (html: string): string => {
  const tmp = document.createElement('div')
  tmp.innerHTML = html
  return tmp.textContent || tmp.innerText || ''
}

export function SearchDialog({ 
  open, 
  onOpenChange, 
  onChannelSelect, 
  onMessageSelect, 
  onStartDM 
}: SearchDialogProps) {
  const dispatch = useAppDispatch()
  const { searchResults, isSearching } = useAppSelector((state) => state.chat)
  const channels = useAppSelector((state) => state.chat.channels)
  
  const [query, setQuery] = useState("")
  const [activeTab, setActiveTab] = useState<"all" | "messages" | "channels">("all")
  const debouncedQuery = useDebounce(query, 300)

  useEffect(() => {
    if (debouncedQuery.length >= 2) {
      dispatch(searchChat({ 
        query: debouncedQuery, 
        opts: { type: activeTab, limit: 20 } 
      }))
    } else {
      dispatch(clearSearchResults())
    }
  }, [debouncedQuery, activeTab, dispatch])

  useEffect(() => {
    if (!open) {
      setQuery("")
      dispatch(clearSearchResults())
    }
  }, [open, dispatch])

  const handleChannelClick = (channelId: number) => {
    const channel = channels.find(ch => ch.id === channelId)
    const channelType = channel?.channel_type || 'group'
    onChannelSelect?.(channelId, channelType)
    onOpenChange(false)
  }

  const handleMessageClick = (channelId: number, messageId: number) => {
    const channel = channels.find(ch => ch.id === channelId)
    const channelType = channel?.channel_type || 'group'
    onMessageSelect?.(channelId, messageId, channelType)
    onOpenChange(false)
  }

  const handleMemberClick = (memberId: number) => {
    onStartDM?.(memberId.toString())
    onOpenChange(false)
  }

  const formatDate = (date: string) => {
    const d = new Date(date)
    const now = new Date()
    const diff = now.getTime() - d.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    
    if (days === 0) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    if (days === 1) return 'Yesterday'
    if (days < 7) return d.toLocaleDateString([], { weekday: 'short' })
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' })
  }

  const highlightMatch = (text: string, q: string) => {
    if (!q || !text) return text
    const parts = text.split(new RegExp(`(${q})`, 'gi'))
    return parts.map((part, i) => 
      part.toLowerCase() === q.toLowerCase() 
        ? <mark key={i} className="bg-yellow-200/70 dark:bg-yellow-900/50 text-yellow-900 dark:text-yellow-100 rounded px-0.5 font-medium">{part}</mark> 
        : part
    )
  }

  const hasResults = searchResults && (
    (searchResults.messages?.length || 0) > 0 ||
    (searchResults.channels?.length || 0) > 0
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[650px] max-w-[95vw] p-0 gap-0 max-h-[90vh] sm:max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader className="px-3 sm:px-4 pt-3 sm:pt-4 pb-2 sm:pb-3 border-b border-border flex-shrink-0">
          <div className="flex items-center justify-between ">
            <DialogTitle className="text-base sm:text-lg font-semibold">Search</DialogTitle>
          </div>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search messages, channels, or people..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9 pr-9 h-9 sm:h-10 text-sm border-border shadow-none focus-visible:ring-1 focus-visible:ring-primary bg-muted/50"
              autoFocus
            />
            {isSearching && (
              <Loader2 className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground pointer-events-none" />
            )}
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)} className="flex-1 flex flex-col overflow-hidden min-h-0">
          <TabsList className="w-full justify-start px-3 sm:px-4 flex-shrink-0">
            <TabsTrigger value="all" className="cursor-pointer">
              All Results
            </TabsTrigger>
            <TabsTrigger value="messages" className="cursor-pointer gap-1.5">
              <MessageSquare className="h-3.5 w-3.5" /> 
              Messages
            </TabsTrigger>
            <TabsTrigger value="channels" className="cursor-pointer gap-1.5">
              <Hash className="h-3.5 w-3.5" /> 
              Channels
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-hidden min-h-0">
            <ScrollArea className="h-full w-full">
              <div className="min-h-0">
                {!query ? (
                  <div className="flex flex-col items-center justify-center py-12 sm:py-16 px-4 sm:px-6 text-center">
                    <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-full bg-muted flex items-center justify-center mb-3 sm:mb-4">
                      <Search className="h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground/50" />
                    </div>
                    <h3 className="font-semibold text-sm sm:text-base mb-1 text-foreground">Search Everything</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground mb-2">Find messages, channels, and people instantly</p>
                    <p className="text-xs text-muted-foreground hidden sm:block">Press <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs font-mono border border-border">⌘K</kbd> anytime to search</p>
                  </div>
                ) : query.length < 2 ? (
                  <div className="flex items-center justify-center py-12 sm:py-16 text-xs sm:text-sm text-muted-foreground px-4">
                    Type at least 2 characters to search
                  </div>
                ) : isSearching ? (
                  <div className="flex flex-col items-center justify-center py-12 sm:py-16">
                    <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin text-primary mb-2 sm:mb-3" />
                    <p className="text-xs sm:text-sm text-muted-foreground">Searching...</p>
                  </div>
                ) : !hasResults ? (
                  <div className="flex flex-col items-center justify-center py-12 sm:py-16 px-4 sm:px-6 text-center">
                    <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-full bg-muted flex items-center justify-center mb-3 sm:mb-4">
                      <Search className="h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground/50" />
                    </div>
                    <h3 className="font-semibold text-sm sm:text-base mb-1 text-foreground">No results found</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground">Try different keywords for "{query}"</p>
                  </div>
                ) : (
                  <div className="px-3 sm:px-4 py-2 sm:py-3 space-y-3 sm:space-y-4">
                    {/* Messages */}
                    {(activeTab === "all" || activeTab === "messages") && 
                     searchResults?.messages && 
                     searchResults.messages.length > 0 && (
                      <div className="space-y-1.5">
                        {activeTab === "all" && (
                          <div className="flex items-center gap-2 mb-1.5">
                            <MessageSquare className="h-3.5 w-3.5 text-muted-foreground" />
                            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                              Messages ({searchResults.messages.length})
                            </h3>
                          </div>
                        )}
                        <div className="space-y-0.5">
                          {searchResults.messages.map((msg) => {
                            const plainContent = stripHtml(msg.content)
                            return (
                              <button
                                key={msg.id}
                                onClick={() => handleMessageClick(msg.channel_id, msg.id)}
                                className="w-full text-left p-2 sm:p-2.5 rounded-lg hover:bg-muted/70 transition-all cursor-pointer group border border-transparent hover:border-border"
                              >
                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1 flex-wrap">
                                  <Hash className="h-3 w-3 flex-shrink-0" />
                                  <span className="font-medium text-foreground truncate max-w-[120px] sm:max-w-none">{msg.channel_name}</span>
                                  <span className="text-muted-foreground/50">•</span>
                                  <span className="truncate">{msg.sender_first_name} {msg.sender_last_name}</span>
                                  <span className="ml-auto text-muted-foreground/70 flex-shrink-0">{formatDate(msg.sent_at)}</span>
                                  <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity text-primary flex-shrink-0" />
                                </div>
                                <p className="text-xs sm:text-sm line-clamp-2 leading-relaxed text-foreground break-words overflow-hidden">
                                  {highlightMatch(plainContent, query)}
                                </p>
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    )}

                    {/* Channels */}
                    {(activeTab === "all" || activeTab === "channels") && 
                     searchResults?.channels && 
                     searchResults.channels.length > 0 && (
                      <div className="space-y-1.5">
                        {activeTab === "all" && (
                          <div className="flex items-center gap-2 mb-1.5">
                            <Hash className="h-3.5 w-3.5 text-muted-foreground" />
                            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                              Channels ({searchResults.channels.length})
                            </h3>
                          </div>
                        )}
                        <div className="space-y-0.5">
                          {searchResults.channels.map((ch) => (
                            <button
                              key={ch.id}
                              onClick={() => handleChannelClick(ch.id)}
                              className="w-full text-left flex items-center gap-2 p-2 sm:p-2.5 rounded-lg hover:bg-muted/70 transition-all cursor-pointer group border border-transparent hover:border-border"
                            >
                              <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                                <Hash className="h-4 w-4 text-primary" />
                              </div>
                              <div className="flex-1 min-w-0 overflow-hidden">
                                <p className="font-medium text-xs sm:text-sm mb-0.5 text-foreground truncate">{highlightMatch(ch.name, query)}</p>
                                {ch.description && (
                                  <p className="text-xs text-muted-foreground line-clamp-1 overflow-hidden">
                                    {ch.description}
                                  </p>
                                )}
                              </div>
                              <div className="flex items-center gap-1.5 flex-shrink-0">
                                <span className="text-xs text-muted-foreground whitespace-nowrap hidden sm:inline">
                                  {ch.member_count} {ch.member_count === 1 ? 'member' : 'members'}
                                </span>
                                <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity text-primary" />
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}