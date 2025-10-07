// Chat storage utilities for managing multiple conversations

export interface ChatConversation {
  id: string;
  title: string;
  messages: any[];
  model: string;
  createdAt: number;
  updatedAt: number;
}

const STORAGE_KEY = "ai-chat-conversations";
const ACTIVE_CHAT_KEY = "ai-chat-active-id";

export function getAllConversations(): ChatConversation[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return []; 
    return JSON.parse(data);
  } catch (error) {
    console.error("Failed to load conversations:", error);
    return [];
  }
}

export function getConversation(id: string): ChatConversation | null {
  const conversations = getAllConversations();
  return conversations.find((c) => c.id === id) || null;
}

export function saveConversation(conversation: ChatConversation): void {
  const conversations = getAllConversations();
  const index = conversations.findIndex((c) => c.id === conversation.id);
  
  if (index >= 0) {
    conversations[index] = conversation;
  } else {
    conversations.unshift(conversation);
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
}

export function deleteConversation(id: string): void {
  const conversations = getAllConversations();
  const filtered = conversations.filter((c) => c.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
}

export function createNewConversation(model: string): ChatConversation {
  const now = Date.now();
  return {
    id: `chat-${now}`,
    title: "New Chat",
    messages: [],
    model,
    createdAt: now,
    updatedAt: now,
  };
}

export function getActiveConversationId(): string | null {
  return localStorage.getItem(ACTIVE_CHAT_KEY);
}

export function setActiveConversationId(id: string): void {
  localStorage.setItem(ACTIVE_CHAT_KEY, id);
}

export function generateChatTitle(firstMessage: string): string {
  const maxLength = 40;
  const cleaned = firstMessage.trim().replace(/\n/g, " ");
  if (cleaned.length <= maxLength) return cleaned;
  return cleaned.substring(0, maxLength) + "...";
}