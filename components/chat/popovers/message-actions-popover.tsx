// components/chat/popovers/message-actions-popover.tsx
"use client"

import React, { useState } from "react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { MessageCircle, MoreVertical, Reply, Trash2, Edit, Pin, PinOff, Forward, Copy, Smile } from "lucide-react"
import toast from "react-hot-toast"
import data from '@emoji-mart/data'
import Picker from '@emoji-mart/react'
import { useTheme } from "next-themes"

interface MessageActionsPopoverProps {
  isDirect?: boolean
  isOwn: boolean
  isPinned?: boolean
  messageId: string
  messageContent?: string
  onReply?: (messageId: string) => void
  onReplyInThread?: () => void
  onDelete?: (messageId: string) => void
  onEdit?: (messageId: string, newContent: string) => void // ✅ FIX: Update type signature
  onPin?: (messageId: string, isPinned: boolean) => void
  onForward?: (messageId: string) => void
  onReact?: (messageId: string, emoji: string) => void
  isInThread?: boolean
}

export function MessageActionsPopover({
  isDirect = false,
  isOwn,
  isPinned = false,
  messageId,
  messageContent = "",
  onReply,
  onReplyInThread,
  onDelete,
  onEdit,
  onPin,
  onForward,
  onReact,
  isInThread = false,
}: MessageActionsPopoverProps) {
  const [open, setOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false) // ✅ ADD: Edit dialog state
  const [editContent, setEditContent] = useState("") // ✅ ADD: Edit content state
  const { resolvedTheme } = useTheme()

  // Helper function to strip HTML and get plain text
  const getPlainText = (html: string): string => {
    const tempDiv = document.createElement('div')
    tempDiv.innerHTML = html
    return tempDiv.textContent || tempDiv.innerText || ''
  }

  const handleReply = () => {
    if (isDirect || isInThread) {
      onReply?.(messageId)
    } else {
      onReplyInThread?.()
    }
    setOpen(false)
  }

  const handleCopy = async () => {
    try {
      const plainText = getPlainText(messageContent)
      await navigator.clipboard.writeText(plainText)
      toast.success("Message copied to clipboard")
    } catch {
      toast.error("Failed to copy message")
    }
    setOpen(false)
  }

  // ✅ FIX: Update edit handler to open dialog
  const handleEdit = () => {
    setEditContent(getPlainText(messageContent))
    setEditDialogOpen(true)
    setOpen(false)
  }

  // ✅ ADD: Handle edit confirmation
  const handleEditConfirm = () => {
    if (editContent.trim()) {
      onEdit?.(messageId, editContent.trim())
      setEditDialogOpen(false)
      setEditContent("")
    } else {
      toast.error("Message cannot be empty")
    }
  }

  const handleDelete = () => {
    setDeleteDialogOpen(true)
    setOpen(false)
  }

  const handleDeleteConfirm = () => {
    onDelete?.(messageId)
    setDeleteDialogOpen(false)
  }

  const handlePin = () => {
    onPin?.(messageId, !isPinned)
    setOpen(false)
  }

  const handleForward = () => {
    onForward?.(messageId)
    setOpen(false)
  }

  const handleEmojiSelect = (emoji: any) => {
    onReact?.(messageId, emoji.native)
    setEmojiPickerOpen(false)
  }

  return (
    <>
      <Popover open={emojiPickerOpen} onOpenChange={setEmojiPickerOpen}>
        <PopoverTrigger asChild>
          <Button 
            size="icon" 
            variant="ghost" 
            className="h-7 w-7 hover:bg-muted"
            title="Add reaction"
          >
            <Smile className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent 
          className="w-auto p-0 border-0 shadow-lg" 
          side="top" 
          align="start"
          sideOffset={8}
          collisionPadding={10}
          sticky="always"
        >
          <Picker
            data={data}
            theme={resolvedTheme === "dark" ? "dark" : "light"}
            previewPosition="none"
            skinTonePosition="search"
            navPosition="top"
            perLine={9}
            emojiSize={22}
            emojiButtonSize={34}
            searchPosition="sticky"
            onEmojiSelect={handleEmojiSelect}
          />
        </PopoverContent>
      </Popover>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button size="icon" variant="ghost" className="h-7 w-7 hover:bg-muted">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent 
          className="w-48 p-1" 
          side="top" 
          align="end"
          sideOffset={8}
          collisionPadding={10}
          sticky="always"
        >
          <div className="flex flex-col">
            <button 
              onClick={handleReply} 
              className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted rounded transition-colors text-left"
            >
              {isDirect || isInThread ? (
                <>
                  <Reply className="h-4 w-4" />
                  Reply
                </>
              ) : (
                <>
                  <MessageCircle className="h-4 w-4" />
                  Reply in thread
                </>
              )}
            </button>

            <button 
              onClick={handleCopy} 
              className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted rounded transition-colors text-left"
            >
              <Copy className="h-4 w-4" />
              Copy text
            </button>

            {!isInThread && (
              <button 
                onClick={handlePin} 
                className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted rounded transition-colors text-left"
              >
                {isPinned ? <PinOff className="h-4 w-4" /> : <Pin className="h-4 w-4" />}
                {isPinned ? "Unpin message" : "Pin message"}
              </button>
            )}

            <button 
              onClick={handleForward} 
              className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted rounded transition-colors text-left"
            >
              <Forward className="h-4 w-4" />
              Forward
            </button>

            {isOwn && (
              <button 
                onClick={handleEdit} 
                className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted rounded transition-colors text-left"
              >
                <Edit className="h-4 w-4" />
                Edit message
              </button>
            )}

            {isOwn && (
              <>
                <div className="h-px bg-border my-1" />
                <button 
                  onClick={handleDelete} 
                  className="flex items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-destructive/10 rounded transition-colors text-left"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete message
                </button>
              </>
            )}
          </div>
        </PopoverContent>
      </Popover>

      {/* ✅ ADD: Edit Dialog */}
      <AlertDialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Edit message</AlertDialogTitle>
            <AlertDialogDescription>
              Make changes to your message below.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full min-h-[100px] p-3 rounded-md border border-border bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Type your message..."
              autoFocus
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setEditContent("")}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleEditConfirm}>
              Save changes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete message?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This message will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}