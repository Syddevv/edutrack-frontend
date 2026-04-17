import { ChatbotIcon, CloseIcon, SendIcon } from "./Icons";

type ChatbotPanelProps = {
  isOpen: boolean;
  onClose: () => void;
  onOpen: () => void;
};

const absentStudents = [
  ["Sarah Jenkins", "Sick Leave"],
  ["Noah Brown", "Family Emergency"],
  ["Lia Santos", "Medical Appointment"],
] as const;

export function ChatbotPanel({ isOpen, onClose, onOpen }: ChatbotPanelProps) {
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
        className={`floating-button${isOpen ? " floating-button--hidden" : ""}`}
        type="button"
        aria-label="Open chatbot"
        onClick={onOpen}
      >
        <ChatbotIcon className="floating-button__icon" />
      </button>

      {isOpen ? (
        <aside className="chatbot-panel" aria-label="AI Assistant">
          <header className="chatbot-panel__header">
            <div className="chatbot-panel__identity">
              <span className="chatbot-panel__avatar">
                <ChatbotIcon className="chatbot-panel__avatar-icon" />
              </span>
              <div>
                <h2 className="chatbot-panel__title">AI Assistant</h2>
                <p className="chatbot-panel__subtitle">
                  Attendance insights &amp; help
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

          <div className="chatbot-panel__body">
            <div className="chatbot-message-row chatbot-message-row--assistant">
              <span className="chatbot-message-row__badge">
                <ChatbotIcon className="chatbot-message-row__badge-icon" />
              </span>
              <div className="chatbot-bubble chatbot-bubble--assistant">
                <p>
                  Hello! I&apos;m your AI attendance assistant. I can help you
                  with:
                </p>
                <ul className="chatbot-bullet-list">
                  <li>View attendance records</li>
                  <li>Analyze attendance trends</li>
                  <li>Generate reports</li>
                  <li>Find absent students</li>
                </ul>
              </div>
            </div>

            <div className="chatbot-message-row chatbot-message-row--user">
              <div className="chatbot-bubble chatbot-bubble--user">
                Who was absent from Grade 5B yesterday?
              </div>
              <span className="chatbot-message-row__user-badge">U</span>
            </div>

            <div className="chatbot-message-row chatbot-message-row--assistant">
              <span className="chatbot-message-row__badge">
                <ChatbotIcon className="chatbot-message-row__badge-icon" />
              </span>
              <div className="chatbot-bubble chatbot-bubble--assistant">
                <p>Here are the absent students from Grade 5B:</p>
                <div className="chatbot-table">
                  <div className="chatbot-table__head">
                    <span>Student</span>
                    <span>Reason</span>
                  </div>
                  {absentStudents.map((student) => (
                    <div className="chatbot-table__row" key={student[0]}>
                      <span>{student[0]}</span>
                      <span>{student[1]}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="chatbot-panel__suggestions">
            <button className="chatbot-chip" type="button">
              Absent today
            </button>
            <button className="chatbot-chip" type="button">
              Weekly summary
            </button>
          </div>

          <footer className="chatbot-panel__composer">
            <label className="chatbot-composer">
              <input type="text" placeholder="Ask about attendance..." />

              <button
                className="chatbot-composer__send"
                type="button"
                aria-label="Send message"
              >
                <SendIcon className="chatbot-composer__icon-svg" />
              </button>
            </label>
          </footer>
        </aside>
      ) : null}
    </>
  );
}
