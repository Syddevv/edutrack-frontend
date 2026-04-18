import { useEffect, useMemo, useState } from "react";
import { CloseIcon } from "./Icons";

export type TeacherClassSelection = {
  classId: number;
  scheduleId: number;
  course: string;
  year: string;
  section: string;
  subject: string;
  dayOfWeek: string | null;
  startTime: string;
  endTime: string;
};

type ChangeClassModalProps = {
  assignedClasses: TeacherClassSelection[];
  currentSelection: TeacherClassSelection | null;
  isOpen: boolean;
  onApply: (selection: TeacherClassSelection) => void;
  onClose: () => void;
};

function formatClassTag(selection: TeacherClassSelection) {
  return `${selection.course} • ${selection.year} - ${selection.section}`;
}

export function ChangeClassModal({
  assignedClasses,
  currentSelection,
  isOpen,
  onApply,
  onClose,
}: ChangeClassModalProps) {
  const [draft, setDraft] = useState<TeacherClassSelection | null>(currentSelection);

  useEffect(() => {
    if (isOpen) {
      setDraft(currentSelection ?? assignedClasses[0] ?? null);
    }
  }, [assignedClasses, currentSelection, isOpen]);

  const courseOptions = useMemo(
    () => Array.from(new Set(assignedClasses.map((item) => item.course))),
    [assignedClasses]
  );

  const yearOptions = useMemo(() => {
    const filtered = assignedClasses.filter(
      (item) => item.course === (draft?.course ?? assignedClasses[0]?.course)
    );

    return Array.from(new Set(filtered.map((item) => item.year)));
  }, [assignedClasses, draft]);

  const sectionOptions = useMemo(() => {
    const filtered = assignedClasses.filter(
      (item) =>
        item.course === (draft?.course ?? assignedClasses[0]?.course) &&
        item.year === (draft?.year ?? assignedClasses[0]?.year)
    );

    return Array.from(new Set(filtered.map((item) => item.section)));
  }, [assignedClasses, draft]);

  function chooseDraft(nextValues: {
    course?: string;
    year?: string;
    section?: string;
  }) {
    if (assignedClasses.length === 0) {
      setDraft(null);
      return;
    }

    const currentCourse = nextValues.course ?? draft?.course ?? assignedClasses[0].course;
    const currentYear = nextValues.year ?? draft?.year ?? assignedClasses[0].year;
    const currentSection =
      nextValues.section ?? draft?.section ?? assignedClasses[0].section;

    const exactMatch = assignedClasses.find(
      (item) =>
        item.course === currentCourse &&
        item.year === currentYear &&
        item.section === currentSection
    );
    const courseYearMatch = assignedClasses.find(
      (item) => item.course === currentCourse && item.year === currentYear
    );
    const courseMatch = assignedClasses.find((item) => item.course === currentCourse);

    setDraft(exactMatch ?? courseYearMatch ?? courseMatch ?? assignedClasses[0]);
  }

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
              value={draft?.course ?? ""}
              onChange={(event) => chooseDraft({ course: event.target.value })}
              disabled={assignedClasses.length === 0}
            >
              {courseOptions.length === 0 ? (
                <option value="">No assigned classes</option>
              ) : (
                courseOptions.map((course) => (
                  <option key={course} value={course}>
                    {course}
                  </option>
                ))
              )}
            </select>
          </label>

          <div className="change-class-modal__grid">
            <label className="change-class-modal__field">
              <span className="change-class-modal__label">Year Level</span>
              <select
                className="change-class-modal__select"
                value={draft?.year ?? ""}
                onChange={(event) => chooseDraft({ year: event.target.value })}
                disabled={assignedClasses.length === 0}
              >
                {yearOptions.length === 0 ? (
                  <option value="">No assigned classes</option>
                ) : (
                  yearOptions.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))
                )}
              </select>
            </label>

            <label className="change-class-modal__field">
              <span className="change-class-modal__label">Section</span>
              <select
                className="change-class-modal__select"
                value={draft?.section ?? ""}
                onChange={(event) => chooseDraft({ section: event.target.value })}
                disabled={assignedClasses.length === 0}
              >
                {sectionOptions.length === 0 ? (
                  <option value="">No assigned classes</option>
                ) : (
                  sectionOptions.map((section) => (
                    <option key={section} value={section}>
                      {section}
                    </option>
                  ))
                )}
              </select>
            </label>
          </div>

          <div className="change-class-modal__assigned">
            <div className="change-class-modal__assigned-title">Your assigned classes</div>
            <div className="change-class-modal__chips">
              {assignedClasses.length === 0 ? (
                <p className="page-subtitle">No assigned classes found.</p>
              ) : (
                assignedClasses.map((item) => {
                  const isActive = item.classId === draft?.classId;

                  return (
                    <button
                      key={item.classId}
                      className={`change-class-modal__chip${
                        isActive ? " change-class-modal__chip--active" : ""
                      }`}
                      type="button"
                      onClick={() => setDraft(item)}
                    >
                      {formatClassTag(item)}
                    </button>
                  );
                })
              )}
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
            onClick={() => {
              if (draft) {
                onApply(draft);
              }
            }}
            disabled={draft === null}
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}
