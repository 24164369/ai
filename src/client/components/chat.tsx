import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/client/components/ai-elements/conversation";
import {
  Message,
  MessageContent,
} from "@/client/components/ai-elements/message";
import {
  PromptInput,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputToolbar,
  PromptInputTools,
} from "@/client/components/ai-elements/prompt-input";
import { useState, useEffect, useRef } from "react";
import { useChat } from "@ai-sdk/react";
import { Response } from "@/client/components/ai-elements/response";
import {
  Reasoning,
  ReasoningContent,
  ReasoningTrigger,
} from "@/client/components/ai-elements/reasoning";
import { Loader } from "@/client/components/ai-elements/loader";
import { eventIteratorToStream } from "@orpc/client";
import { rpcClient, queryClient } from "@/client/rpc-client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/client/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/client/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/client/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/client/components/ui/tooltip";
import { Check, ChevronsUpDown, Download, ImagePlus, X } from "lucide-react";
import { cn } from "@/client/lib/utils";
import { ChatSidebar } from "@/client/components/chat-sidebar";
import {
  getAllConversations,
  getConversation,
  saveConversation,
  deleteConversation,
  createNewConversation,
  getActiveConversationId,
  setActiveConversationId,
  generateChatTitle,
  type ChatConversation,
} from "@/client/lib/chat-storage";

type Body = {
  model: string;
};

const Chat = () => {
  const [input, setInput] = useState("");
  const [model, setModel] = useState<string>("");
  const [open, setOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    data: models = [],
    isLoading: isLoadingModels,
    error: modelsError,
  } = useQuery(queryClient.ai.models.queryOptions());

  // Load conversations on mount
  useEffect(() => {
    const loadedConversations = getAllConversations();
    setConversations(loadedConversations);
    
    const activeId = getActiveConversationId();
    if (activeId && loadedConversations.some((c) => c.id === activeId)) {
      setActiveConversationId(activeId);
    }
  }, []);

  // Set default model
  useEffect(() => {
    if (models.length > 0 && !model) {
      const savedModel = localStorage.getItem("ai-chat-selected-model");
      if (savedModel && models.some((m) => m.value === savedModel)) {
        setModel(savedModel);
      } else {
        setModel(models[0].value);
      }
    }
  }, [models, model]);

  // Save selected model
  useEffect(() => {
    if (model) {
      localStorage.setItem("ai-chat-selected-model", model);
    }
  }, [model]);

  const { messages, sendMessage, status, setMessages } = useChat({
    transport: {
      async sendMessages(options) {
        return eventIteratorToStream(
          await rpcClient.chat.chat(
            {
              chatId: options.chatId,
              messages: options.messages,
              model: (options.body as Body).model,
            },
            { signal: options.abortSignal }
          )
        );
      },
      reconnectToStream() {
        throw new Error("Unsupported");
      },
    },
  });

  // Load active conversation messages
  useEffect(() => {
    if (activeConversationId) {
      const conversation = getConversation(activeConversationId);
      if (conversation) {
        setMessages(conversation.messages);
        setModel(conversation.model);
      }
    }
  }, [activeConversationId, setMessages]);

  // Save messages to active conversation
  useEffect(() => {
    if (activeConversationId && messages.length > 0) {
      const conversation = getConversation(activeConversationId);
      if (conversation) {
        // Update title from first user message if still "New Chat"
        if (conversation.title === "New Chat" && messages.length > 0) {
          const firstUserMessage = messages.find((m) => m.role === "user");
          if (firstUserMessage) {
            const textPart = firstUserMessage.parts.find((p: any) => p.type === "text");
            if (textPart) {
              conversation.title = generateChatTitle(textPart.text);
            }
          }
        }
        
        conversation.messages = messages;
        conversation.updatedAt = Date.now();
        saveConversation(conversation);
        setConversations(getAllConversations());
      }
    }
  }, [messages, activeConversationId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() || uploadedImages.length > 0) {
      // Create new conversation if none active
      if (!activeConversationId) {
        const newConv = createNewConversation(model);
        saveConversation(newConv);
        setActiveConversationId(newConv.id);
        setConversations(getAllConversations());
      }

      // Prepare message parts with images and text
      const parts: any[] = [];
      
      // Add images first
      if (uploadedImages.length > 0) {
        uploadedImages.forEach((img) => {
          parts.push({
            type: "image",
            image: img, // base64 data URL
          });
        });
      }
      
      // Add text
      if (input.trim()) {
        parts.push({
          type: "text",
          text: input,
        });
      }

      sendMessage(
        {
          role: "user",
          parts: parts,
        },
        {
          body: {
            model: model,
          },
        }
      );
      
      setInput("");
      setUploadedImages([]);
    }
  };

  const handleNewChat = () => {
    const newConv = createNewConversation(model);
    saveConversation(newConv);
    setActiveConversationId(newConv.id);
    setConversations(getAllConversations());
    setMessages([]);
    setInput("");
    setUploadedImages([]);
    setSidebarOpen(false);
  };

  const handleSelectChat = (id: string) => {
    setActiveConversationId(id);
    setSidebarOpen(false);
  };

  const handleDeleteChat = (id: string) => {
    deleteConversation(id);
    setConversations(getAllConversations());
    
    if (activeConversationId === id) {
      const remaining = getAllConversations();
      if (remaining.length > 0) {
        setActiveConversationId(remaining[0].id);
      } else {
        setActiveConversationId(null);
        setMessages([]);
      }
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setUploadedImages((prev) => [...prev, event.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    Array.from(items).forEach((item) => {
      if (item.type.startsWith("image/")) {
        const file = item.getAsFile();
        if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
            if (event.target?.result) {
              setUploadedImages((prev) => [...prev, event.target!.result as string]);
            }
          };
          reader.readAsDataURL(file);
        }
      }
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer?.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            setUploadedImages((prev) => [...prev, event.target!.result as string]);
          }
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const handleDownloadChat = () => {
    if (messages.length === 0) return;

    const markdown = messages
      .map((message) => {
        const role = message.role === "user" ? "User" : "Assistant";
        const content = message.parts
          .map((part) => {
            if (part.type === "text") {
              return part.text;
            } else if (part.type === "reasoning") {
              return `**Reasoning:**\n${part.text}`;
            }
            return "";
          })
          .join("\n\n");

        return `## ${role}\n\n${content}`;
      })
      .join("\n\n---\n\n");

    const blob = new Blob([markdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `chat-${new Date()
      .toISOString()
      .slice(0, 19)
      .replace(/:/g, "-")}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <ChatSidebar
        conversations={conversations}
        activeId={activeConversationId}
        onSelectChat={handleSelectChat}
        onNewChat={handleNewChat}
        onDeleteChat={handleDeleteChat}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      {/* Main Chat Area */}
      <main className="h-full flex flex-col overflow-hidden">
        {/* Header Bar */}
        <header className="h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="h-full max-w-[1600px] mx-auto px-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Model Selector */}
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-[260px] justify-between h-10"
                  >
                    <span className="truncate">
                      {model
                        ? models.find((m) => m.value === model)?.label
                        : "Select model..."}
                    </span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[260px] p-0">
                  <Command>
                    <CommandInput placeholder="Search model..." />
                    <CommandList>
                      <CommandEmpty>No model found.</CommandEmpty>
                      <CommandGroup>
                        {models.map((m) => (
                          <CommandItem
                            key={m.value}
                            value={m.value}
                            onSelect={(currentValue) => {
                              setModel(currentValue);
                              setOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                model === m.value ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {m.label}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {/* Actions */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={handleDownloadChat}
                    variant="ghost"
                    size="icon"
                    disabled={messages.length === 0}
                    className="h-10 w-10"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Download conversation as Markdown</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </header>

        {/* Chat Content Area */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full max-w-[1600px] mx-auto flex flex-col">
            {messages.length === 0 ? (
              // Welcome Screen
              <div className="flex-1 flex items-center justify-center px-6">
                <div className="text-center space-y-4 max-w-2xl">
                  <h1 className="text-6xl font-bold tracking-tight">
                    Hello.
                  </h1>
                  <p className="text-xl text-muted-foreground">
                    How can I help you today?
                  </p>
                </div>
              </div>
            ) : (
              // Messages Area
              <Conversation className="flex-1">
                <ConversationContent className="px-6">
                  {messages.map((message) => (
                    <Message from={message.role} key={message.id}>
                      <MessageContent>
                        {message.parts.map((part, i) => {
                          switch (part.type) {
                            case "image":
                              return (
                                <div key={`${message.id}-${i}`} className="mb-3">
                                  <img
                                    src={(part as any).image}
                                    alt={`Image ${i + 1}`}
                                    className="max-w-sm rounded-lg border shadow-sm"
                                  />
                                </div>
                              );
                            case "text":
                              return (
                                <Response key={`${message.id}-${i}`}>
                                  {part.text}
                                </Response>
                              );
                            case "reasoning":
                              return (
                                <Reasoning
                                  key={`${message.id}-${i}`}
                                  className="w-full"
                                  isStreaming={status === "streaming"}
                                >
                                  <ReasoningTrigger />
                                  <ReasoningContent>{part.text}</ReasoningContent>
                                </Reasoning>
                              );
                            default:
                              return null;
                          }
                        })}
                      </MessageContent>
                    </Message>
                  ))}
                  {status === "submitted" && <Loader />}
                </ConversationContent>
                <ConversationScrollButton />
              </Conversation>
            )}

            {/* Input Area */}
            <div className="px-6 py-6">
              <div className="max-w-4xl mx-auto">
                <PromptInput 
                  onSubmit={handleSubmit} 
                  className="shadow-xl transition-all"
                >
                  {/* Drag & Drop Overlay - Disabled */}
                  
                  {/* Image Preview */}
                  {uploadedImages.length > 0 && (
                    <div className="border-b bg-muted/30">
                      {/* Vision Model Warning */}
                      {model && !model.includes('gemini') && !model.includes('gpt-4') && !model.includes('vision') && !model.includes('claude') && (
                        <div className="px-3 pt-3 pb-2">
                          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 text-sm">
                            <p className="text-yellow-600 dark:text-yellow-500 font-medium">
                              ⚠️ The selected model may not support images. For best results, use:
                            </p>
                            <ul className="text-yellow-600/80 dark:text-yellow-500/80 mt-1 text-xs list-disc list-inside">
                              <li>Gemini models (all support vision)</li>
                              <li>GPT-4o, GPT-4 Turbo, or GPT-4 Vision</li>
                              <li>Claude 3 (Opus, Sonnet, Haiku)</li>
                            </ul>
                          </div>
                        </div>
                      )}
                      
                      <div className="flex gap-2 p-3 flex-wrap">
                        {uploadedImages.map((img, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={img}
                              alt={`Upload ${index + 1}`}
                              className="h-24 w-24 object-cover rounded-lg border-2 shadow-sm"
                            />
                            <button
                              onClick={() => removeImage(index)}
                              className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:scale-110"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <PromptInputTextarea
                    onChange={(e) => setInput(e.target.value)}
                    value={input}
                    placeholder="Type a message..."
                    className="min-h-[80px] text-base"
                  />
                  
                  <PromptInputToolbar>
                    <PromptInputTools>
                      {/* Image Upload Button - Disabled (Under Development) */}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={handleImageUpload}
                        disabled
                      />
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              disabled
                              className="h-10 w-10 opacity-50 cursor-not-allowed"
                            >
                              <ImagePlus className="h-5 w-5" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>🚧 قيد التطوير - Under Development</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </PromptInputTools>
                    <PromptInputSubmit 
                      disabled={!input.trim()} 
                      status={status}
                      className="h-10 w-10"
                    />
                  </PromptInputToolbar>
                </PromptInput>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Chat;