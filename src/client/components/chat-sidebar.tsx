import { Button } from "@/client/components/ui/button";
import { ScrollArea } from "@/client/components/ui/scroll-area";
import {
  MessageSquare,
  Plus,
  Trash2,
  PanelLeftClose,
  PanelLeft,
} from "lucide-react";
import { cn } from "@/client/lib/utils";
import { ChatConversation } from "@/client/lib/chat-storage";

interface ChatSidebarProps {
  conversations: ChatConversation[];
  activeId: string | null;
  onSelectChat: (id: string) => void;
  onNewChat: () => void;
  onDeleteChat: (id: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export function ChatSidebar({
  conversations,
  activeId,
  onSelectChat,
  onNewChat,
  onDeleteChat,
  isOpen,
  onToggle,
}: ChatSidebarProps) {
  return (
    <>
      {/* Sidebar Container - Fixed Position */}
      <aside
        className={cn(
          "fixed left-0 top-0 h-screen bg-background border-r flex flex-col transition-transform duration-300 ease-in-out z-40",
          "w-72",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Header with New Chat Button */}
        <div className="p-4 border-b">
          <div className="flex items-center gap-2">
            <Button
              onClick={onNewChat}
              className="flex-1 h-10"
              size="sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Chat
            </Button>
            <Button
              onClick={onToggle}
              variant="ghost"
              size="icon"
              className="h-10 w-10 shrink-0"
            >
              <PanelLeftClose className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Conversations List */}
        <ScrollArea className="flex-1 px-3 py-2">
          {conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <MessageSquare className="h-12 w-12 text-muted-foreground/50 mb-3" />
              <p className="text-sm text-muted-foreground">
                No conversations yet
              </p>
              <p className="text-xs text-muted-foreground/70 mt-1">
                Start a new chat to begin
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {conversations.map((chat) => (
                <div
                  key={chat.id}
                  className={cn(
                    "group relative flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-all hover:bg-accent/80",
                    activeId === chat.id && "bg-accent"
                  )}
                  onClick={() => onSelectChat(chat.id)}
                >
                  <MessageSquare className="h-4 w-4 shrink-0 text-muted-foreground mt-1" />
                  <div className="flex-1 min-w-0 space-y-1">
                    <p className="text-sm font-medium truncate leading-tight">
                      {chat.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(chat.updatedAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: new Date(chat.updatedAt).getFullYear() !== new Date().getFullYear() ? "numeric" : undefined,
                      })}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteChat(chat.id);
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        <div className="p-4 border-t">
          <p className="text-xs text-center text-muted-foreground">
            {conversations.length} {conversations.length === 1 ? "conversation" : "conversations"}
          </p>
        </div>
      </aside>

      {/* Overlay - Shows when sidebar is open on mobile/tablet */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Floating Toggle Button - Shows when sidebar is closed */}
      {!isOpen && (
        <Button
          onClick={onToggle}
          variant="outline"
          size="icon"
          className="fixed top-4 left-4 z-50 h-11 w-11 rounded-xl shadow-lg border-2 bg-background hover:bg-accent"
        >
          <PanelLeft className="h-5 w-5" />
        </Button>
      )}
    </>
  );
}