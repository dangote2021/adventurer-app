/**
 * Message Service - handles conversations, messages, real-time chat
 * Currently uses mock data. Will be replaced by Supabase realtime.
 */

import type { Conversation } from '@/types';
import { CONVERSATIONS, getConversation, getConversationMessages } from '@/lib/mock-data';

interface ChatMessage {
  id: string;
  from: string;
  content: string;
  time: string;
  isMe: boolean;
}

export const messageService = {
  /** Get all conversations for the current user */
  async getConversations(): Promise<Conversation[]> {
    // TODO: Replace with Supabase query ordered by last_message_time
    return CONVERSATIONS;
  },

  /** Get a single conversation */
  async getConversation(convId: string): Promise<Conversation | undefined> {
    // TODO: Replace with Supabase query
    return getConversation(convId);
  },

  /** Get messages for a conversation */
  async getMessages(convId: string): Promise<ChatMessage[]> {
    // TODO: Replace with Supabase query ordered by created_at
    return getConversationMessages(convId);
  },

  /** Send a message */
  async sendMessage(convId: string, content: string): Promise<ChatMessage> {
    // TODO: Replace with Supabase insert + realtime broadcast
    const msg: ChatMessage = {
      id: Date.now().toString(),
      from: 'Moi',
      content,
      time: 'À l\'instant',
      isMe: true,
    };
    return msg;
  },

  /** Mark conversation as read */
  async markAsRead(convId: string): Promise<void> {
    // TODO: Replace with Supabase update
    console.log('Mock mark as read:', convId);
  },

  /** Subscribe to new messages in a conversation (realtime) */
  subscribeToMessages(convId: string, callback: (msg: ChatMessage) => void): () => void {
    // TODO: Replace with Supabase realtime subscription
    // Returns unsubscribe function
    console.log('Mock subscribe to:', convId);
    return () => {
      console.log('Mock unsubscribe from:', convId);
    };
  },
};
