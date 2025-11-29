import type { ChatRequest, ChatResponse } from 'utils/api/chatbotApi';
import { sendChatMessage } from 'utils/api/chatbotApi';
import { createUserMutationHook } from '../hookHelpers';

const useChatbotChat = createUserMutationHook<[], ChatResponse, ChatRequest>([], sendChatMessage);

export default useChatbotChat;
