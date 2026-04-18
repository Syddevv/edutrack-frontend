import {
  ClockIcon,
  CloseIcon,
  CourseIcon,
  PlusIcon,
  SectionIcon,
  YearLevelIcon,
} from "./Icons";

export type TeacherAssignedClass = {
  subject: string;
  course: string;
  year: string;
  section: string;
  startTime: string;
  endTime: string;
};

type TeacherAssignedClassesEditorProps = {
  assignedClasses: TeacherAssignedClass[];
  draft: TeacherAssignedClass;
  helperText?: string;
  onAddClass: () => void;
  onDraftChange: (field: keyof TeacherAssignedClass, value: string) => void;
  onRemoveClass: (index: number) => void;
};

function formatAssignedClass(item: TeacherAssignedClass) {
  return `${item.subject} • ${item.course} ${item.year}-${item.section}`;
}

function formatTimeRange(item: TeacherAssignedClass) {
  return `${item.startTime}-${item.endTime}`;
}

export function TeacherAssignedClassesEditor({
  assignedClasses,
  draft,
  helperText = "Add one or more",
  onAddClass,
  onDraftChange,
  onRemoveClass,
}: TeacherAssignedClassesEditorProps) {
  return (
    <div className="student-modal__field student-modal__field--full">
      <span className="student-modal__label">
        Assigned Classes <span className="teacher-modal__required">*</span>{" "}
        <span className="teacher-assignment__helper">{helperText}</span>
      </span>

      <div className="teacher-assignment">
        <span className="teacher-modal__input-wrap teacher-modal__input-wrap--full">
          <CourseIcon className="teacher-modal__input-icon" />
          <input
            className="teacher-modal__input"
            type="text"
            placeholder="Subject (e.g. Math 101, Physics 202)"
            value={draft.subject}
            onChange={(event) => onDraftChange("subject", event.target.value)}
          />
        </span>

        <div className="teacher-assignment__grid teacher-assignment__grid--three">
          <span className="teacher-modal__input-wrap teacher-modal__input-wrap--select">
            <CourseIcon className="teacher-modal__input-icon" />
            <select
              className="teacher-modal__select"
              value={draft.course}
              onChange={(event) => onDraftChange("course", event.target.value)}
            >
              <option>BSIS</option>
              <option>BSOM</option>
              <option>BSCA</option>
              <option>BSAIS</option>
              <option>ACT</option>
            </select>
          </span>

          <span className="teacher-modal__input-wrap teacher-modal__input-wrap--select">
            <YearLevelIcon className="teacher-modal__input-icon" />
            <select
              className="teacher-modal__select"
              value={draft.year}
              onChange={(event) => onDraftChange("year", event.target.value)}
            >
              <option>1st Year</option>
              <option>2nd Year</option>
              <option>3rd Year</option>
              <option>4th Year</option>
            </select>
          </span>

          <span className="teacher-modal__input-wrap teacher-modal__input-wrap--select">
            <SectionIcon className="teacher-modal__input-icon" />
            <select
              className="teacher-modal__select"
              value={draft.section}
              onChange={(event) => onDraftChange("section", event.target.value)}
            >
              <option>A</option>
              <option>B</option>
              <option>C</option>
            </select>
          </span>
        </div>

        <div className="teacher-assignment__grid teacher-assignment__grid--times">
          <span className="teacher-modal__input-wrap">
            <ClockIcon className="teacher-modal__input-icon" />
            <input
              className="teacher-modal__input"
              type="text"
              value={draft.startTime}
              onChange={(event) => onDraftChange("startTime", event.target.value)}
            />
          </span>

          <span className="teacher-modal__input-wrap">
            <ClockIcon className="teacher-modal__input-icon" />
            <input
              className="teacher-modal__input"
              type="text"
              value={draft.endTime}
              onChange={(event) => onDraftChange("endTime", event.target.value)}
            />
          </span>

          <button
            className="button button--primary teacher-assignment__add-button"
            type="button"
            onClick={onAddClass}
          >
            <PlusIcon className="button__icon" />
            Add
          </button>
        </div>

        {assignedClasses.length > 0 ? (
          <div className="teacher-assignment__chips">
            {assignedClasses.map((item, index) => (
              <button
                key={`${item.subject}-${item.course}-${item.year}-${item.section}-${item.startTime}-${item.endTime}-${index}`}
                className="teacher-assignment__chip"
                type="button"
                onClick={() => onRemoveClass(index)}
              >
                <span>{formatAssignedClass(item)}</span>
                <span className="teacher-assignment__chip-time">
                  <ClockIcon className="teacher-assignment__chip-time-icon" />
                  {formatTimeRange(item)}
                </span>
                <CloseIcon className="teacher-assignment__chip-icon" />
              </button>
            ))}
          </div>
        ) : (
          <p className="teacher-assignment__empty">No classes assigned yet.</p>
        )}
      </div>
    </div>
  );
}
