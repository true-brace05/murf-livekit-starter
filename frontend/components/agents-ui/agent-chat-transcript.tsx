'use client';

import { type ComponentProps } from 'react';
import { AnimatePresence } from 'motion/react';
import { type AgentState, type ReceivedMessage } from '@livekit/components-react';
import { AgentChatIndicator } from '@/components/agents-ui/agent-chat-indicator';
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from '@/components/ai-elements/conversation';
import { Message, MessageContent, MessageResponse } from '@/components/ai-elements/message';

export interface AgentChatTranscriptProps extends ComponentProps<'div'> {
  /**
   * The current state of the agent. When 'thinking', displays a loading indicator.
   */
  agentState?: AgentState;

  /**
   * Array of messages to display in the transcript.
   */
  messages?: ReceivedMessage[];

  /**
   * Additional CSS class names to apply to the conversation container.
   */
  className?: string;
}

export function AgentChatTranscript({
  agentState,
  messages = [],
  className,
  ...props
}: AgentChatTranscriptProps) {
  return (
    <Conversation className={className} {...props}>
      <ConversationContent>
        {messages.map((receivedMessage) => {
          const { id, timestamp, from, message } = receivedMessage;

          const locale = navigator?.language ?? 'en-US';
          const messageOrigin = from?.isLocal ? 'user' : 'assistant';
          const time = new Date(timestamp);
          const title = time.toLocaleTimeString(locale, {
            timeStyle: 'full',
          });

          return (
            <Message
              key={id}
              title={title}
              from={messageOrigin}
              className={messageOrigin === 'user' ? 'text-[#17201a]' : 'text-[#17201a]'}
            >
              <MessageContent
                className={
                  messageOrigin === 'user'
                    ? 'bg-[#e4f1e8] text-[#17201a]'
                    : 'border border-[#dde3dd] bg-white text-[#17201a]'
                }
              >
                <MessageResponse className="text-[#17201a]">{message}</MessageResponse>
              </MessageContent>
            </Message>
          );
        })}

        <AnimatePresence>
          {agentState === 'thinking' && <AgentChatIndicator size="sm" />}
        </AnimatePresence>
      </ConversationContent>

      <ConversationScrollButton />
    </Conversation>
  );
}
