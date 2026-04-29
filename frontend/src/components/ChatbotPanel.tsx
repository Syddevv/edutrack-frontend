import { Fragment, useEffect, useRef, useState, type ReactNode } from "react";
import {
  askEduTrackAssistant,
  type AssistantMessage,
  type AssistantRole,
} from "../assistant";
import { ChatbotIcon, CloseIcon, SendIcon } from "./Icons";

type ChatbotPanelProps = {
  isEnabled: boolean;
  isOpen: boolean;
  onClose: () => void;
  onOpen: () => void;
  role?: AssistantRole;
};

type ChatMessage = AssistantMessage & {
  id: string;
};

const adminSuggestions = [
  {
    label: "Today summary",
    prompt: "Summarize today's attendance across all students.",
  },
  {
    label: "Absent today",
    prompt:
      "List students marked absent today and group them by course and section.",
  },
  {
    label: "Weekly report",
    prompt: "Give me a weekly attendance report summary.",
  },
  {
    label: "Course risks",
    prompt: "Which courses have attendance issues?",
  },
];

const teacherSuggestions = [
  {
    label: "Class summary",
    prompt: "Summarize my current class attendance.",
  },
  {
    label: "Absent/unmarked",
    prompt: "Who is absent or unmarked today?",
  },
  {
    label: "At-risk list",
    prompt: "List at-risk students and next steps.",
  },
  {
    label: "Class advice",
    prompt: "Suggest practical ways to improve attendance for my class.",
  },
];

function createMessage(
  role: AssistantMessage["role"],
  content: string,
): ChatMessage {
  return {
    id:
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random()}`,
    role,
    content,
  };
}

function getInitialMessages(role: AssistantRole): ChatMessage[] {
  const skills =
    role === "teacher"
      ? "I can summarize your class attendance, find absent or unmarked students, explain at-risk reports, and draft follow-up notes."
      : "I can summarize campus attendance, explain weekly reports, find students needing follow-up, and draft report notes.";

  return [
    createMessage(
      "assistant",
      `Hello. I'm your EduTrack AI assistant. ${skills}`,
    ),
  ];
}

function renderInlineMarkdown(text: string) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={`${part}-${index}`}>{part.slice(2, -2)}</strong>;
    }

    return <Fragment key={`${part}-${index}`}>{part}</Fragment>;
  });
}

function renderMessageContent(content: string) {
  const blocks: ReactNode[] = [];
  const lines = content.replace(/\r\n/g, "\n").split("\n");
  let paragraph: string[] = [];
  let bullets: string[] = [];

  function flushParagraph() {
    if (paragraph.length === 0) {
      return;
    }

    const text = paragraph.join(" ").trim();
    if (text !== "") {
      blocks.push(
        <p className="chatbot-bubble__paragraph" key={`p-${blocks.length}`}>
          {renderInlineMarkdown(text)}
        </p>,
      );
    }

    paragraph = [];
  }

  function flushBullets() {
    if (bullets.length === 0) {
      return;
    }

    blocks.push(
      <ul className="chatbot-bubble__list" key={`ul-${blocks.length}`}>
        {bullets.map((bullet, index) => (
          <li key={`${bullet}-${index}`}>{renderInlineMarkdown(bullet)}</li>
        ))}
      </ul>,
    );

    bullets = [];
  }

  lines.forEach((line) => {
    const trimmedLine = line.trim();

    if (trimmedLine === "") {
      flushParagraph();
      flushBullets();
      return;
    }

    const bullet = trimmedLine.match(/^[-*]\s+(.+)$/);
    if (bullet) {
      flushParagraph();
      bullets.push(bullet[1]);
      return;
    }

    flushBullets();
    paragraph.push(trimmedLine);
  });

  flushParagraph();
  flushBullets();

  return blocks.length > 0 ? blocks : renderInlineMarkdown(content);
}

export function ChatbotPanel({
  isEnabled,
  isOpen,
  onClose,
  onOpen,
  role = "admin",
}: ChatbotPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(() =>
    getInitialMessages(role),
  );
  const [inputValue, setInputValue] = useState("");
  const [isSending, setIsSending] = useState(false);
  const bodyRef = useRef<HTMLDivElement | null>(null);
  const suggestions =
    role === "teacher" ? teacherSuggestions : adminSuggestions;

  useEffect(() => {
    setMessages(getInitialMessages(role));
    setInputValue("");
  }, [role]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const body = bodyRef.current;
    if (body) {
      body.scrollTop = body.scrollHeight;
    }
  }, [isOpen, isSending, messages]);

  async function sendMessage(messageText = inputValue) {
    const trimmedMessage = messageText.trim();

    if (trimmedMessage === "" || isSending) {
      return;
    }

    const userMessage = createMessage("user", trimmedMessage);
    const nextMessages = [...messages, userMessage];

    setMessages(nextMessages);
    setInputValue("");
    setIsSending(true);

    try {
      const assistantResponse = await askEduTrackAssistant(
        nextMessages.map(({ role: messageRole, content }) => ({
          role: messageRole,
          content,
        })),
        role,
      );

      setMessages((currentMessages) => [
        ...currentMessages,
        createMessage("assistant", assistantResponse),
      ]);
    } catch (error) {
      setMessages((currentMessages) => [
        ...currentMessages,
        createMessage(
          "assistant",
          error instanceof Error
            ? error.message
            : "I could not contact the AI assistant. Please try again.",
        ),
      ]);
    } finally {
      setIsSending(false);
    }
  }

  return (
    <>
      {isOpen ? (
        <button
          className="chatbot-overlay"
          type="button"
          aria-label="Close chatbot overlay"
          onClick={onClose}
        />
      ) : null}

      <button
        className={`floating-button${isOpen ? " floating-button--hidden" : ""}${
          !isEnabled ? " floating-button--disabled" : ""
        }`}
        type="button"
        aria-label={isEnabled ? "Open chatbot" : "AI assistant disabled"}
        onClick={isEnabled ? onOpen : undefined}
        disabled={!isEnabled}
      >
        <ChatbotIcon className="floating-button__icon" />
      </button>

      {isOpen && isEnabled ? (
        <aside className="chatbot-panel" aria-label="AI Assistant">
          <header className="chatbot-panel__header">
            <div className="chatbot-panel__identity">
              <span className="chatbot-panel__avatar">
                <ChatbotIcon className="chatbot-panel__avatar-icon" />
              </span>
              <div>
                <div className="chatbot-panel__title-row">
                  <h2 className="chatbot-panel__title">AI Assistant</h2>
                  <span className="chatbot-panel__model">GROQ</span>
                </div>
                <p className="chatbot-panel__subtitle">
                  {role === "teacher"
                    ? "Class insights & help"
                    : "Attendance insights & help"}
                </p>
              </div>
            </div>

            <button
              className="chatbot-panel__close"
              type="button"
              aria-label="Close chatbot"
              onClick={onClose}
            >
              <CloseIcon className="chatbot-panel__close-icon" />
            </button>
          </header>

          <div className="chatbot-panel__body" ref={bodyRef}>
            {messages.map((message) =>
              message.role === "assistant" ? (
                <div
                  className="chatbot-message-row chatbot-message-row--assistant"
                  key={message.id}
                >
                  <span className="chatbot-message-row__badge">
                    <ChatbotIcon className="chatbot-message-row__badge-icon" />
                  </span>
                  <div className="chatbot-bubble chatbot-bubble--assistant">
                    <div className="chatbot-bubble__text">
                      {renderMessageContent(message.content)}
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  className="chatbot-message-row chatbot-message-row--user"
                  key={message.id}
                >
                  <div className="chatbot-bubble chatbot-bubble--user">
                    <div className="chatbot-bubble__text">
                      {renderMessageContent(message.content)}
                    </div>
                  </div>
                  <span className="chatbot-message-row__user-badge">U</span>
                </div>
              ),
            )}
            {isSending ? (
              <div className="chatbot-message-row chatbot-message-row--assistant">
                <span className="chatbot-message-row__badge">
                  <ChatbotIcon className="chatbot-message-row__badge-icon" />
                </span>
                <div className="chatbot-bubble chatbot-bubble--assistant">
                  <div className="chatbot-panel__status">
                    Checking EduTrack data...
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          <div className="chatbot-panel__suggestions">
            {suggestions.map((suggestion) => (
              <button
                className="chatbot-chip"
                type="button"
                key={suggestion.label}
                onClick={() => void sendMessage(suggestion.prompt)}
                disabled={isSending}
              >
                {suggestion.label}
              </button>
            ))}
          </div>

          <footer className="chatbot-panel__composer">
            <form
              className="chatbot-composer"
              onSubmit={(event) => {
                event.preventDefault();
                void sendMessage();
              }}
            >
              <input
                type="text"
                placeholder="Ask about attendance..."
                value={inputValue}
                onChange={(event) => setInputValue(event.target.value)}
                disabled={isSending}
              />
              <button
                className="chatbot-composer__send"
                type="submit"
                aria-label="Send message"
                disabled={isSending || inputValue.trim() === ""}
              >
                <SendIcon className="chatbot-composer__icon-svg" />
              </button>
            </form>
          </footer>
        </aside>
      ) : null}
    </>
  );
}
