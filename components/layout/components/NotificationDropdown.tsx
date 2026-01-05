import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CollaborationService, Notification } from '@/lib/api/services/collaboration.service';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export function NotificationDropdown() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      const response = await CollaborationService.getNotifications({
        page: 1,
        limit: 10,
      });
      
      setNotifications(response.data.notifications);
      setUnreadCount(response.data.meta.unreadCount);
    } catch (error: any) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  const handleNotificationClick = async (notification: Notification) => {
    try {
      if (notification.status === 'pending') {
        await CollaborationService.markNotificationRead(notification.id);
      }

      if (notification.event_type === 'agency_invitation_to_creator_for_join') {
        if (notification.data?.invitationLink) {
          const url = new URL(notification.data.invitationLink);
          router.push(url.pathname + url.search);
        }
      }

      fetchNotifications();
      setIsOpen(false);
    } catch (error: any) {
      toast.error('Failed to process notification');
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadNotifs = notifications.filter(n => n.status === 'pending');
      await Promise.all(
        unreadNotifs.map(n => CollaborationService.markNotificationRead(n.id))
      );
      toast.success('All notifications marked as read');
      fetchNotifications();
    } catch (error) {
      toast.error('Failed to mark notifications as read');
    }
  };

  const getNotificationIcon = (eventType: string) => {
    if (eventType.includes('invitation')) return '📩';
    if (eventType.includes('accepted')) return '✅';
    if (eventType.includes('rejected')) return '❌';
    return '🔔';
  };

  const getTimeAgo = (date: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="h-auto p-1 text-xs"
            >
              Mark all read
            </Button>
          )}
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator />
        
        <ScrollArea className="h-[400px]">
          {isLoading ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              Loading...
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No notifications yet
            </div>
          ) : (
            notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className={`flex flex-col items-start gap-2 p-3 cursor-pointer ${
                  notification.status === 'pending' ? 'bg-accent/50' : ''
                }`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex w-full items-start justify-between gap-2">
                  <div className="flex items-start gap-2">
                    <span className="text-lg">{getNotificationIcon(notification.event_type)}</span>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{notification.subject}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {notification.message}
                      </p>
                    </div>
                  </div>
                  {notification.status === 'pending' && (
                    <div className="h-2 w-2 rounded-full bg-blue-500" />
                  )}
                </div>
                
                <div className="flex w-full items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {getTimeAgo(notification.created_at)}
                  </span>
                  <Badge variant={notification.priority === 'high' ? 'destructive' : 'primary'} className="text-[10px] px-1.5 py-0">
                    {notification.priority}
                  </Badge>
                </div>
              </DropdownMenuItem>
            ))
          )}
        </ScrollArea>
        
        {notifications.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="justify-center cursor-pointer"
              onClick={() => {
                router.push('/dashboard/notifications');
                setIsOpen(false);
              }}
            >
              View all notifications
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
