"use client"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Info, Settings, Hash, Lock, Users, Search, Bell, BellOff, Pin } from 'lucide-react'
import { useState } from "react"
import { ChannelSettingsDialog } from "./dialogs/channel-settings-dialog"
import { PinDialog } from "./dialogs/pin-dialog"

interface ChatHeaderProps {
  title: string
  description?: string
  isPrivate?: boolean
  memberCount?: number
  channelId?: number
  isPinned?: boolean
  isMuted?: boolean
  isDirect?: boolean
  isOwner?: boolean
  onInfoClick?: () => void
  onUpdateChannel?: (name: string, description: string) => void
  onArchiveChannel?: () => void
  onLeaveChannel?: () => void
  onDeleteChannel?: () => void
  onInviteUsers?: () => void
  onMembersClick?: () => void
  onSearchClick?: () => void
  onPinChange?: (pinned: boolean) => void
  onMuteChannel?: () => void
}

export function ChatHeader({
  title,
  description,
  channelId,
  isPrivate,
  memberCount,
  isPinned = false,
  isMuted = false,
  isDirect = false,
  isOwner = false,
  onInfoClick,
  onUpdateChannel,
  onArchiveChannel,
  onLeaveChannel,
  onDeleteChannel,
  onInviteUsers,
  onMembersClick,
  onSearchClick,
  onPinChange,
  onMuteChannel,
}: ChatHeaderProps) {
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [pinOpen, setPinOpen] = useState(false)

  return (
    <>
      <div className="bg-background px-4 py-3 h-16 flex items-center w-full border-b border-border">
        <div className="flex items-center justify-between gap-3 w-full">
          {/* Left side */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            {isDirect ? (
              <div className="h-9 w-9 flex-shrink-0 rounded-full bg-muted flex items-center justify-center text-foreground text-sm font-semibold">
                {title?.charAt(0)?.toUpperCase() || '?'}
              </div>
            ) : isPrivate ? (
              <Lock className="h-5 w-5 text-muted-foreground flex-shrink-0" />
            ) : (
              <Hash className="h-5 w-5 text-muted-foreground flex-shrink-0" />
            )}
            <div className="min-w-0 flex-1">
              <h2 className="font-display text-base font-semibold truncate">{title}</h2>
              {description && <p className="text-xs text-muted-foreground truncate hidden sm:block">{description}</p>}
            </div>
            {memberCount !== undefined && memberCount > 0 && (
              <Badge variant="secondary" className="gap-1 flex-shrink-0 cursor-pointer hover:bg-secondary/80" onClick={onMembersClick}>
                <Users className="h-3 w-3" />
                <span className="text-xs">{memberCount}</span>
              </Badge>
            )}
          </div>

          {/* Right side - Action buttons */}
          <div className="flex items-center gap-1 flex-shrink-0">
            <Button size="icon" variant="ghost" onClick={onSearchClick} title="Search" className="h-9 w-9 hover:bg-muted rounded-lg transition-colors">
              <Search className="h-[18px] w-[18px]" />
            </Button>
            <Button size="icon" variant="ghost" onClick={onInviteUsers} title="Invite people" className="h-9 w-9 hover:bg-muted rounded-lg transition-colors">
              <Users className="h-[18px] w-[18px]" />
            </Button>
            <Button size="icon" variant="ghost" onClick={() => setPinOpen(true)} title={isPinned ? `Unpin ${isDirect ? "chat" : "channel"}` : `Pin ${isDirect ? "chat" : "channel"}`} className="h-9 w-9 hover:bg-muted rounded-lg transition-colors">
              <Pin className={`h-[18px] w-[18px] ${isPinned ? "text-primary fill-primary" : ""}`} />
            </Button>
            <Button size="icon" variant="ghost" onClick={onMuteChannel} title={isMuted ? "Unmute" : "Mute"} className="h-9 w-9 hover:bg-muted rounded-lg transition-colors">
              {isMuted ? <BellOff className="h-[18px] w-[18px] text-muted-foreground" /> : <Bell className="h-[18px] w-[18px]" />}
            </Button>
            <Button size="icon" variant="ghost" onClick={onMembersClick} title={`${isDirect ? "Chat" : "Channel"} info`} className="h-9 w-9 hover:bg-muted rounded-lg transition-colors">
              <Info className="h-[18px] w-[18px]" />
            </Button>
            <Button size="icon" variant="ghost" onClick={() => setSettingsOpen(true)} title="Settings" className="h-9 w-9 hover:bg-muted rounded-lg transition-colors">
              <Settings className="h-[18px] w-[18px]" />
            </Button>
          </div>
        </div>
      </div>

      {/* Dialogs */}
      <ChannelSettingsDialog
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        channelName={title}
        description={description}
        isPrivate={isPrivate}
        isDirect={isDirect}
        isOwner={isOwner}
        onUpdateChannel={onUpdateChannel}
        onArchiveChannel={onArchiveChannel}
        onLeaveChannel={onLeaveChannel}
        onDeleteChannel={onDeleteChannel}
      />
      <PinDialog
        open={pinOpen}
        onOpenChange={setPinOpen}
        channelName={title}
        isPinned={isPinned}
        isDirect={isDirect}
        onPinChange={onPinChange || (() => {})}
      />
    </>
  )
}