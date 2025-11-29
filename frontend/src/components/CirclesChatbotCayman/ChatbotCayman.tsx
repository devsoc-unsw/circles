import React, { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { useLocation } from 'react-router-dom';
import { RobotOutlined, SendOutlined } from '@ant-design/icons';
import { Button, Input, Modal, Spin, Tooltip, Typography } from 'antd';
import remarkGfm from 'remark-gfm';
import type { ChatMessage } from 'utils/api/chatbotApi';
import useChatbotChat from 'utils/apiHooks/chatbot';
import S from './styles';

const { Text, Title } = Typography;
const { TextArea } = Input;

const ChatbotCayman = () => {
  const [showMenu, setShowMenu] = useState(false);
  const [message, setMessage] = useState('');
  const [conversationHistory, setConversationHistory] = useState<ChatMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatMutation = useChatbotChat();

  const pathname = useLocation();

  useEffect(() => {
    setShowMenu(false);
  }, [pathname]);

  useEffect(() => {
    // Scroll to bottom when new messages are added
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversationHistory]);

  const handleSend = async () => {
    if (!message.trim() || chatMutation.isPending) return;

    const userMessage = message.trim();
    setMessage('');

    // Add user message to conversation history with unique ID
    const newUserMessage: ChatMessage = {
      role: 'user',
      content: userMessage,
      id: `user-${Date.now()}-${Math.random().toString(36).substring(7)}`
    };
    const updatedHistory = [...conversationHistory, newUserMessage];
    setConversationHistory(updatedHistory);

    try {
      // Send to API (without IDs for API compatibility)
      const apiHistory = conversationHistory.map(({ id: _, ...rest }) => rest);
      const response = await chatMutation.mutateAsync({
        message: userMessage,
        conversation_history: apiHistory
      });

      // Add assistant response to conversation history with unique ID
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: response.response,
        id: `assistant-${Date.now()}-${Math.random().toString(36).substring(7)}`
      };
      setConversationHistory([...updatedHistory, assistantMessage]);
    } catch (error: unknown) {
      // Add error message to conversation with unique ID
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        id: `error-${Date.now()}-${Math.random().toString(36).substring(7)}`
      };
      setConversationHistory([...updatedHistory, errorMessage]);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <S.ChatbotCaymanRoot>
      <Tooltip title="Cayman: Your personal course planning assistant!">
        <Button
          type="primary"
          icon={<RobotOutlined style={{ fontSize: '26px' }} />}
          size="large"
          onClick={() => setShowMenu((prevState) => !prevState)}
        />
      </Tooltip>
      <Modal
        title={
          <Title className="text" level={4}>
            Chat with Cayman
          </Title>
        }
        open={showMenu}
        onCancel={() => setShowMenu(false)}
        footer={null}
        width={500}
        centered
      >
        <S.ChatContainer>
          <S.MessagesContainer>
            {conversationHistory.length === 0 ? (
              <S.WelcomeMessage>
                <Text className="text">
                  Hi! I&apos;m Cayman, your course planning assistant. I can help you plan courses,
                  learn about prerequisites, and answer questions about your degree. What would you
                  like to know?
                </Text>
              </S.WelcomeMessage>
            ) : (
              conversationHistory.map((msg) => {
                const messageKey: string = (() => {
                  const { id } = msg;
                  if (id !== undefined && id !== null && typeof id === 'string' && id.length > 0) {
                    return id;
                  }
                  return `${msg.role}-${msg.content.substring(0, 50)}`;
                })();
                return (
                  <S.MessageBubble key={messageKey} isUser={msg.role === 'user'}>
                    {msg.role === 'user' ? (
                      <Text className="text">{msg.content}</Text>
                    ) : (
                      <S.MarkdownContent>
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                      </S.MarkdownContent>
                    )}
                  </S.MessageBubble>
                );
              })
            )}
            {chatMutation.isPending && (
              <S.MessageBubble isUser={false}>
                <Spin size="small" />
                <Text className="text" style={{ marginLeft: '8px' }}>
                  Cayman is thinking...
                </Text>
              </S.MessageBubble>
            )}
            <div ref={messagesEndRef} />
          </S.MessagesContainer>
          <S.InputContainer>
            <TextArea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me about courses, prerequisites, or planning..."
              autoSize={{ minRows: 1, maxRows: 4 }}
              disabled={chatMutation.isPending}
              style={{ resize: 'none' }}
            />
            <Button
              type="primary"
              icon={<SendOutlined />}
              onClick={handleSend}
              loading={chatMutation.isPending}
              disabled={!message.trim() || chatMutation.isPending}
            >
              Send
            </Button>
          </S.InputContainer>
        </S.ChatContainer>
      </Modal>
    </S.ChatbotCaymanRoot>
  );
};

export default ChatbotCayman;
