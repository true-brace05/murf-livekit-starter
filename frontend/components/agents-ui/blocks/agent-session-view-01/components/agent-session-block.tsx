'use client';

import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, type MotionProps, motion } from 'motion/react';
import { useAgent, useSessionContext, useSessionMessages } from '@livekit/components-react';
import { AgentChatTranscript } from '@/components/agents-ui/agent-chat-transcript';
import {
  AgentControlBar,
  type AgentControlBarControls,
} from '@/components/agents-ui/agent-control-bar';
import { Shimmer } from '@/components/ai-elements/shimmer';
import { cn } from '@/lib/shadcn/utils';
import { TileLayout } from './tile-view';

const MotionMessage = motion.create(Shimmer);

function getStatusText(state: string) {
  switch (state) {
    case 'listening':
      return 'Listening to you';
    case 'speaking':
      return 'FinSaathi is speaking';
    case 'thinking':
      return 'FinSaathi is thinking';
    case 'connecting':
      return 'Connecting to FinSaathi';
    default:
      return 'Ready when you are';
  }
}

const BOTTOM_VIEW_MOTION_PROPS: MotionProps = {
  variants: {
    visible: {
      opacity: 1,
      translateY: '0%',
    },
    hidden: {
      opacity: 0,
      translateY: '100%',
    },
  },
  initial: 'hidden',
  animate: 'visible',
  exit: 'hidden',
  transition: {
    duration: 0.3,
    delay: 0.5,
    ease: 'easeOut',
  },
};

const CHAT_MOTION_PROPS: MotionProps = {
  variants: {
    hidden: {
      opacity: 0,
      transition: {
        ease: 'easeOut',
        duration: 0.3,
      },
    },
    visible: {
      opacity: 1,
      transition: {
        delay: 0.2,
        ease: 'easeOut',
        duration: 0.3,
      },
    },
  },
  initial: 'hidden',
  animate: 'visible',
  exit: 'hidden',
};

const SHIMMER_MOTION_PROPS: MotionProps = {
  variants: {
    visible: {
      opacity: 1,
      transition: {
        ease: 'easeIn',
        duration: 0.5,
        delay: 0.8,
      },
    },
    hidden: {
      opacity: 0,
      transition: {
        ease: 'easeIn',
        duration: 0.5,
        delay: 0,
      },
    },
  },
  initial: 'hidden',
  animate: 'visible',
  exit: 'hidden',
};

interface FadeProps {
  top?: boolean;
  bottom?: boolean;
  className?: string;
}

export function Fade({ top = false, bottom = false, className }: FadeProps) {
  return (
    <div
      className={cn(
        'pointer-events-none h-4 from-[#f7f8f4] to-transparent',
        top && 'bg-linear-to-b',
        bottom && 'bg-linear-to-t',
        className
      )}
    />
  );
}

export interface AgentSessionView_01Props {
  /**
   * Message shown above the controls before the first chat message is sent.
   *
   * @default 'Ready when you are'
   */
  preConnectMessage?: string;

  /**
   * Enables or disables the chat toggle and transcript input controls.
   *
   * @default true
   */
  supportsChatInput?: boolean;

  /**
   * Enables or disables camera controls in the bottom control bar.
   *
   * @default true
   */
  supportsVideoInput?: boolean;

  /**
   * Enables or disables screen sharing controls in the bottom control bar.
   *
   * @default true
   */
  supportsScreenShare?: boolean;

  /**
   * Shows a pre-connect buffer state with a shimmer message before messages appear.
   *
   * @default true
   */
  isPreConnectBufferEnabled?: boolean;

  /** Selects the visualizer style rendered in the main tile area. */
  audioVisualizerType?: 'bar' | 'wave' | 'grid' | 'radial' | 'aura';

  /** Primary hex color used by supported audio visualizer variants. */
  audioVisualizerColor?: `#${string}`;

  /** Hue shift intensity used by certain visualizers. */
  audioVisualizerColorShift?: number;

  /** Number of bars to render when audioVisualizerType is bar. */
  audioVisualizerBarCount?: number;

  /** Number of rows in the visualizer when audioVisualizerType is grid. */
  audioVisualizerGridRowCount?: number;

  /** Number of columns in the visualizer when audioVisualizerType is grid. */
  audioVisualizerGridColumnCount?: number;

  /** Number of radial bars when audioVisualizerType is radial. */
  audioVisualizerRadialBarCount?: number;

  /** Base radius of the radial visualizer when audioVisualizerType is radial. */
  audioVisualizerRadialRadius?: number;

  /** Stroke width of the wave path when audioVisualizerType is wave. */
  audioVisualizerWaveLineWidth?: number;

  /** Optional class name merged onto the outer section container. */
  className?: string;
}

export function AgentSessionView_01({
  preConnectMessage = 'Ready when you are',
  supportsChatInput = true,
  supportsVideoInput = true,
  supportsScreenShare = true,
  isPreConnectBufferEnabled = true,
  audioVisualizerType,
  audioVisualizerColor,
  audioVisualizerColorShift,
  audioVisualizerBarCount,
  audioVisualizerGridRowCount,
  audioVisualizerGridColumnCount,
  audioVisualizerRadialBarCount,
  audioVisualizerRadialRadius,
  audioVisualizerWaveLineWidth,
  ref,
  className,
  ...props
}: React.ComponentProps<'section'> & AgentSessionView_01Props) {
  const session = useSessionContext();
  const { messages } = useSessionMessages(session);
  const [chatOpen, setChatOpen] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { state: agentState } = useAgent();

  const controls: AgentControlBarControls = {
    leave: true,
    microphone: true,
    chat: supportsChatInput,
    camera: supportsVideoInput,
    screenShare: supportsScreenShare,
  };

  useEffect(() => {
    const lastMessage = messages.at(-1);
    const lastMessageIsLocal = lastMessage?.from?.isLocal === true;

    if (scrollAreaRef.current && lastMessageIsLocal) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <section
      ref={ref}
      className={cn(
        'relative z-10 h-full w-full overflow-hidden bg-[#f7f8f4] text-[#17201a]',
        className
      )}
      {...props}
    >
      {/* FinSaathi Header */}
      <div className="absolute top-5 right-6 left-6 z-50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-[#176b45] text-lg font-semibold text-white shadow-sm">
            ₹
          </div>

          <div>
            <div className="text-sm font-semibold text-[#17201a]">FinSaathi</div>

            <div className="text-[11px] text-[#758078]">Financial Assistant</div>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-full border border-[#dce2dc] bg-white px-3 py-2 text-xs text-[#5f6b63] shadow-sm">
          <span className="size-2 rounded-full bg-[#176b45]" />
          {getStatusText(agentState)}
        </div>
      </div>

      {/* Transcript */}
      <div className="absolute top-0 bottom-[135px] flex w-full flex-col md:bottom-[170px]">
        <AnimatePresence>
          {chatOpen && (
            <motion.div
              {...CHAT_MOTION_PROPS}
              className="flex h-full w-full flex-col gap-4 space-y-3 transition-opacity duration-300 ease-out"
            >
              <AgentChatTranscript
                agentState={agentState}
                messages={messages}
                className={cn(
                  'mx-auto w-full max-w-2xl',
                  '[&>div>div]:px-4',
                  '[&>div>div]:pt-40',
                  'md:[&>div>div]:px-6',

                  // User message
                  '[&_.is-user>div]:rounded-[22px]',
                  '[&_.is-user>div]:!bg-[#176b45]',
                  '[&_.is-user>div]:!text-white',
                  '[&_.is-user>div_*]:!text-white',

                  // FinSaathi message
                  '[&_.is-assistant>div]:rounded-[18px]',
                  '[&_.is-assistant>div]:!border',
                  '[&_.is-assistant>div]:!border-[#dde3dd]',
                  '[&_.is-assistant>div]:!bg-white',
                  '[&_.is-assistant>div]:!text-[#17201a]',
                  '[&_.is-assistant>div_*]:!text-[#17201a]'
                )}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Voice Visualizer */}
      <TileLayout
        chatOpen={chatOpen}
        audioVisualizerType={audioVisualizerType}
        audioVisualizerColor={audioVisualizerColor}
        audioVisualizerColorShift={audioVisualizerColorShift}
        audioVisualizerBarCount={audioVisualizerBarCount}
        audioVisualizerRadialBarCount={audioVisualizerRadialBarCount}
        audioVisualizerRadialRadius={audioVisualizerRadialRadius}
        audioVisualizerGridRowCount={audioVisualizerGridRowCount}
        audioVisualizerGridColumnCount={audioVisualizerGridColumnCount}
        audioVisualizerWaveLineWidth={audioVisualizerWaveLineWidth}
      />

      {/* Bottom Controls */}
      <motion.div
        {...BOTTOM_VIEW_MOTION_PROPS}
        className="absolute inset-x-3 bottom-0 z-50 md:inset-x-12"
      >
        {/* Status message */}
        {isPreConnectBufferEnabled && (
          <AnimatePresence>
            {messages.length === 0 && (
              <MotionMessage
                key="pre-connect-message"
                duration={2}
                aria-hidden={messages.length > 0}
                {...SHIMMER_MOTION_PROPS}
                className="pointer-events-none mx-auto block w-full max-w-2xl pb-4 text-center text-sm font-semibold text-[#536058]"
              >
                {preConnectMessage}
              </MotionMessage>
            )}
          </AnimatePresence>
        )}

        <div className="relative mx-auto max-w-2xl bg-[#f7f8f4] pb-3 md:pb-12">
          <Fade bottom className="absolute inset-x-0 top-0 h-4 -translate-y-full" />

          <AgentControlBar
            variant="livekit"
            controls={controls}
            isChatOpen={chatOpen}
            isConnected={session.isConnected}
            onDisconnect={session.end}
            onIsChatOpenChange={setChatOpen}
          />
        </div>
      </motion.div>
    </section>
  );
}
