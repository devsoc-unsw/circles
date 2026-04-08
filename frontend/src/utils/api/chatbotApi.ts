import axios from 'axios';
import { withAuthorization } from './authApi';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  id?: string; // Optional unique ID for React keys
}

export interface ChatRequest {
  message: string;
  conversation_history?: ChatMessage[];
}

export interface ChatResponse {
  response: string;
}

export const sendChatMessage = async (
  token: string,
  request: ChatRequest
): Promise<ChatResponse> => {
  const response = await axios.post<ChatResponse>('chatbot/chat', request, {
    headers: withAuthorization(token)
  });
  return response.data;
};
