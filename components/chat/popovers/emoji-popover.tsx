"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Smile } from "lucide-react"
import data from '@emoji-mart/data'
import Picker from '@emoji-mart/react'
import { useTheme } from "next-themes"

interface EmojiPopoverProps {
  onEmojiSelect?: (emoji: string) => void
  disabled?: boolean
}

export function EmojiPopover({ onEmojiSelect, disabled }: EmojiPopoverProps) {
  const [open, setOpen] = React.useState(false)
  const { resolvedTheme } = useTheme()

  const handleEmojiSelect = (emoji: any) => {
    onEmojiSelect?.(emoji.native)
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button size="icon" variant="ghost" title="Add emoji" disabled={disabled} className="h-6 w-6 p-0 transition-colors sm:h-7 sm:w-7">
          <Smile className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 border-0 shadow-lg" align="start">
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
  )
}
