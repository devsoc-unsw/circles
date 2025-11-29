import styled from 'styled-components';

const ChatbotCaymanRoot = styled.div`
  margin: 10px;
  position: relative;
  z-index: 20;
`;

const ChatbotCaymanContainer = styled.div`
  padding: 20px;
  min-height: 200px;
  height: 380px;
  width: 100%;
  border-radius: 5px;
  background-color: ${({ theme }) => theme.caymanChatbotMenu.backgroundColor};
`;

const CartContentWrapper = styled.div`
  padding: 15px 0;
  margin-bottom: 15px;
  overflow-y: auto;
  height: 75%;
  border-top: #f4f4f4 solid 1px;
`;

const EmptyWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
  justify-content: space-between;
`;

const ChatContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 500px;
  max-height: 70vh;
`;

const MessagesContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 16px 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 16px;
  border-top: 1px solid
    ${({ theme }) => {
      const borderColor: unknown = theme.caymanChatbotMenu?.borderColor;
      return typeof borderColor === 'string' ? borderColor : '#f4f4f4';
    }};
  border-bottom: 1px solid
    ${({ theme }) => {
      const borderColor: unknown = theme.caymanChatbotMenu?.borderColor;
      return typeof borderColor === 'string' ? borderColor : '#f4f4f4';
    }};
`;

const MessageBubble = styled.div<{ isUser: boolean }>`
  max-width: 80%;
  padding: 10px 14px;
  border-radius: 12px;
  align-self: ${({ isUser }) => (isUser ? 'flex-end' : 'flex-start')};
  background-color: ${({ isUser, theme }) => {
    if (isUser) {
      const bgColor: unknown = theme.caymanChatbotMenu?.userMessageBackgroundColor;
      return typeof bgColor === 'string' ? bgColor : '#1890ff';
    }
    const bgColor: unknown = theme.caymanChatbotMenu?.assistantMessageBackgroundColor;
    return typeof bgColor === 'string' ? bgColor : '#f0f0f0';
  }};
  color: ${({ isUser, theme }) => {
    if (isUser) {
      const textColor: unknown = theme.caymanChatbotMenu?.userMessageTextColor;
      return typeof textColor === 'string' ? textColor : '#ffffff';
    }
    const textColor: unknown = theme.caymanChatbotMenu?.assistantMessageTextColor;
    return typeof textColor === 'string' ? textColor : theme.text;
  }};
  word-wrap: break-word;
  white-space: pre-wrap;

  .text {
    color: ${({ isUser, theme }) => {
      if (isUser) {
        const textColor: unknown = theme.caymanChatbotMenu?.userMessageTextColor;
        return typeof textColor === 'string' ? textColor : '#ffffff';
      }
      const textColor: unknown = theme.caymanChatbotMenu?.assistantMessageTextColor;
      return typeof textColor === 'string' ? textColor : theme.text;
    }} !important;
  }
`;

const WelcomeMessage = styled.div`
  padding: 16px;
  text-align: center;
  color: ${({ theme }) => theme.text};
  opacity: 0.8;
`;

const InputContainer = styled.div`
  display: flex;
  gap: 8px;
  align-items: flex-end;
  padding-top: 12px;

  .ant-input {
    flex: 1;
  }
`;

const MarkdownContent = styled.div`
  color: inherit;
  font-size: inherit;
  line-height: 1.6;

  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    margin: 12px 0 8px 0;
    font-weight: 600;
    color: inherit;
  }

  h2 {
    font-size: 1.2em;
  }

  h3 {
    font-size: 1.1em;
  }

  p {
    margin: 8px 0;
    color: inherit;
  }

  ul,
  ol {
    margin: 8px 0;
    padding-left: 24px;
    color: inherit;
  }

  li {
    margin: 4px 0;
    color: inherit;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    margin: 12px 0;
    font-size: 0.9em;
    display: table;
    overflow-x: auto;
  }

  thead {
    display: table-header-group;
  }

  tbody {
    display: table-row-group;
  }

  tr {
    display: table-row;
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  }

  th,
  td {
    padding: 8px 12px;
    text-align: left;
    border: 1px solid rgba(0, 0, 0, 0.1);
    color: inherit;
    display: table-cell;
  }

  th {
    font-weight: 600;
    background-color: rgba(0, 0, 0, 0.05);
  }

  tbody tr:nth-child(even) {
    background-color: rgba(0, 0, 0, 0.02);
  }

  code {
    background-color: rgba(0, 0, 0, 0.1);
    padding: 2px 6px;
    border-radius: 3px;
    font-family: 'Courier New', monospace;
    font-size: 0.9em;
  }

  pre {
    background-color: rgba(0, 0, 0, 0.1);
    padding: 12px;
    border-radius: 4px;
    overflow-x: auto;
    margin: 8px 0;

    code {
      background-color: transparent;
      padding: 0;
    }
  }

  blockquote {
    border-left: 3px solid rgba(0, 0, 0, 0.2);
    padding-left: 12px;
    margin: 8px 0;
    color: inherit;
    opacity: 0.9;
  }

  strong {
    font-weight: 600;
  }

  em {
    font-style: italic;
  }

  a {
    color: inherit;
    text-decoration: underline;
    opacity: 0.8;

    &:hover {
      opacity: 1;
    }
  }
`;

export default {
  ChatbotCaymanRoot,
  ChatbotCaymanContainer,
  CartContentWrapper,
  EmptyWrapper,
  ChatContainer,
  MessagesContainer,
  MessageBubble,
  WelcomeMessage,
  InputContainer,
  MarkdownContent
};
