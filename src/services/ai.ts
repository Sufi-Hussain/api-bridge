import { apiGet, apiPost } from "@/lib/api/client";

export interface AIConversation {
  id: string;
  title: string;
  updatedAt: string;
}

export interface AIChatResponse {
  conversationId: string;
  message: { role: "assistant"; content: string; citations: Array<{ title?: string; source?: string }> };
}

export function listAIConversations() {
  return apiGet<AIConversation[]>("/api/ai/conversations/");
}

export function sendAIMessage(message: string, conversationId?: string) {
  const trimmed = message.trim().slice(0, 4000);
  return apiPost<AIChatResponse>("/api/ai/chat/", {
    message: trimmed,
    ...(conversationId ? { conversationId } : {}),
  });
}
