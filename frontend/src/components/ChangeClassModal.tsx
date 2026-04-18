import { useEffect, useMemo, useState } from "react";
import { CloseIcon } from "./Icons";

export type TeacherClassSelection = {
  course: string;
  year: string;
  section: string;
};

type ChangeClassModalProps = {
  currentSelection: TeacherClassSelection;
  isOpen: boolean;
  onApply: (selection: TeacherClassSelection) => void;
  onClose: () => void;
};

const assignedClasses: TeacherClassSelection[] = [
  { course: "BSIS", year: "1st Year", section: "A" },
  { course: "BSIS", year: "1st Year", section: "B" },
  { course: "BSIS", year: "2nd Year", section: "A" },
  { course: "ACT", year: "1st Year", section: "A" },
];

function formatClassTag(selection: TeacherClassSelection) {
  return `${selection.course} • ${selection.year} - ${selection.section}`;
}

export function ChangeClassModal({
  currentSelection,
  isOpen,
  onApply,
  onClose,
}: ChangeClassModalProps) {
  const [draft, setDraft] = useState(currentSelection);

  useEffect(() => {
    if (isOpen) {
      setDraft(currentSelection);
    }
  }, [currentSelection, isOpen]);

  const matchingAssignedClass = useMemo(
    () =>
      assignedClasses.find(
        (item) =>
          item.course === draft.course &&
          item.year === draft.year &&
          item.section === draft.section
      ),
    [draft]
  );

  if (!isOpen) {
    return null;
  }

  return (
    <div className="student-modal-backdrop" role="presentation" onClick={onClose}>
      <div
        className="change-class-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="change-class-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="change-class-modal__header">
          <div>
            <h2 className="change-class-modal__title" id="change-class-modal-title">
              Change Class
            </h2>
            <p className="change-class-modal__subtitle">
              Switch the report view to another class you handle.
            </p>
          </div>
          <button
            className="student-modal__close"
            type="button"
            aria-label="Close change class modal"
            onClick={onClose}
          >
            <CloseIcon className="student-modal__close-icon" />
          </button>
        </div>

        <div className="change-class-modal__body">
          <label className="change-class-modal__field">
            <span className="change-class-modal__label">Course</span>
            <select
              className="change-class-modal__select change-class-modal__select--primary"
              value={draft.course}
              onChange={(event) =>
                setDraft((current) => ({ ...current, course: event.target.value }))
              }
            >
              <option>BSIS</option>
              <option>BSOM</option>
              <option>BSCA</option>
              <option>BSAIS</option>
              <option>ACT</option>
            </select>
          </label>

          <div className="change-class-modal__grid">
            <label className="change-class-modal__field">
              <span className="change-class-modal__label">Year Level</span>
              <select
                className="change-class-modal__select"
                value={draft.year}
                onChange={(event) =>
                  setDraft((current) => ({ ...current, year: event.target.value }))
                }
              >
                <option>1st Year</option>
                <option>2nd Year</option>
                <option>3rd Year</option>
                <option>4th Year</option>
              </select>
            </label>

            <label className="change-class-modal__field">
              <span className="change-class-modal__label">Section</span>
              <select
                className="change-class-modal__select"
                value={draft.section}
                onChange={(event) =>
                  setDraft((current) => ({ ...current, section: event.target.value }))
                }
              >
                <option>A</option>
                <option>B</option>
                <option>C</option>
              </select>
            </label>
          </div>

          <div className="change-class-modal__assigned">
            <div className="change-class-modal__assigned-title">Your assigned classes</div>
            <div className="change-class-modal__chips">
              {assignedClasses.map((item) => {
                const isActive =
                  item.course === (matchingAssignedClass ?? draft).course &&
                  item.year === (matchingAssignedClass ?? draft).year &&
                  item.section === (matchingAssignedClass ?? draft).section;

                return (
                  <button
                    key={formatClassTag(item)}
                    className={`change-class-modal__chip${
                      isActive ? " change-class-modal__chip--active" : ""
                    }`}
                    type="button"
                    onClick={() => setDraft(item)}
                  >
                    {formatClassTag(item)}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="change-class-modal__footer">
          <button className="button button--secondary" type="button" onClick={onClose}>
            Cancel
          </button>
          <button
            className="button button--primary"
            type="button"
            onClick={() => onApply(draft)}
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}
