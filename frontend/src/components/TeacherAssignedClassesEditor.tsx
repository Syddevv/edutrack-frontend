import {
  ClockIcon,
  CloseIcon,
  CourseIcon,
  PlusIcon,
  SectionIcon,
  YearLevelIcon,
} from "./Icons";
import type { TeacherAssignedClassPayload, TeacherLookupData } from "../teachers";

export type TeacherAssignedClass = TeacherAssignedClassPayload;

type TeacherAssignedClassesEditorProps = {
  assignedClasses: TeacherAssignedClass[];
  draft: TeacherAssignedClass;
  helperText?: string;
  lookups: TeacherLookupData;
  onAddClass: () => void;
  onDraftChange: (field: keyof TeacherAssignedClass, value: string | number) => void;
  onRemoveClass: (index: number) => void;
};

function findOptionLabel(options: TeacherLookupData["courses"], optionId: number) {
  return options.find((option) => option.id === optionId)?.code
    ?? options.find((option) => option.id === optionId)?.name
    ?? "Unknown";
}

function findSubjectLabel(subjects: TeacherLookupData["subjects"], subjectName: string) {
  const subject = subjects.find((item) => item.name === subjectName);

  if (!subject) {
    return subjectName || "Unknown";
  }

  return subject.code ? `${subject.code} - ${subject.name}` : subject.name;
}

function formatAssignedClass(item: TeacherAssignedClass, lookups: TeacherLookupData) {
  const subject = findSubjectLabel(lookups.subjects, item.subject);
  const course = findOptionLabel(lookups.courses, item.courseId);
  const yearLevel = findOptionLabel(lookups.yearLevels, item.yearLevelId);
  const section = findOptionLabel(lookups.sections, item.sectionId);

  return `${subject} • ${course} ${yearLevel}-${section} • ${item.dayOfWeek}`;
}

function formatTimeRange(item: TeacherAssignedClass) {
  return `${item.startTime}-${item.endTime}`;
}

export function TeacherAssignedClassesEditor({
  assignedClasses,
  draft,
  helperText = "Add one or more",
  lookups,
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
          <select
            className="teacher-modal__select"
            value={draft.subject}
            onChange={(event) => onDraftChange("subject", event.target.value)}
          >
            <option value="" disabled>
              Select subject
            </option>
            {lookups.subjects.map((subject) => (
              <option key={subject.id} value={subject.name}>
                {subject.code ? `${subject.code} - ${subject.name}` : subject.name}
              </option>
            ))}
          </select>
        </span>

        <div className="teacher-assignment__grid teacher-assignment__grid--three">
          <span className="teacher-modal__input-wrap teacher-modal__input-wrap--select">
            <CourseIcon className="teacher-modal__input-icon" />
            <select
              className="teacher-modal__select"
              value={draft.courseId}
              onChange={(event) => onDraftChange("courseId", Number(event.target.value))}
            >
              {lookups.courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.code ?? course.name}
                </option>
              ))}
            </select>
          </span>

          <span className="teacher-modal__input-wrap teacher-modal__input-wrap--select">
            <YearLevelIcon className="teacher-modal__input-icon" />
            <select
              className="teacher-modal__select"
              value={draft.yearLevelId}
              onChange={(event) => onDraftChange("yearLevelId", Number(event.target.value))}
            >
              {lookups.yearLevels.map((yearLevel) => (
                <option key={yearLevel.id} value={yearLevel.id}>
                  {yearLevel.name}
                </option>
              ))}
            </select>
          </span>

          <span className="teacher-modal__input-wrap teacher-modal__input-wrap--select">
            <SectionIcon className="teacher-modal__input-icon" />
            <select
              className="teacher-modal__select"
              value={draft.sectionId}
              onChange={(event) => onDraftChange("sectionId", Number(event.target.value))}
            >
              {lookups.sections.map((section) => (
                <option key={section.id} value={section.id}>
                  {section.name}
                </option>
              ))}
            </select>
          </span>

          <span className="teacher-modal__input-wrap teacher-modal__input-wrap--select">
            <ClockIcon className="teacher-modal__input-icon" />
            <select
              className="teacher-modal__select"
              value={draft.dayOfWeek}
              onChange={(event) => onDraftChange("dayOfWeek", event.target.value)}
            >
              <option value="Monday">Monday</option>
              <option value="Tuesday">Tuesday</option>
              <option value="Wednesday">Wednesday</option>
              <option value="Thursday">Thursday</option>
              <option value="Friday">Friday</option>
              <option value="Saturday">Saturday</option>
            </select>
          </span>
        </div>

        <div className="teacher-assignment__grid teacher-assignment__grid--times">
          <span className="teacher-modal__input-wrap">
            <ClockIcon className="teacher-modal__input-icon" />
            <input
              className="teacher-modal__input"
              type="time"
              value={draft.startTime}
              onChange={(event) => onDraftChange("startTime", event.target.value)}
            />
          </span>

          <span className="teacher-modal__input-wrap">
            <ClockIcon className="teacher-modal__input-icon" />
            <input
              className="teacher-modal__input"
              type="time"
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
                key={`${item.subject}-${item.courseId}-${item.yearLevelId}-${item.sectionId}-${item.startTime}-${item.endTime}-${index}`}
                className="teacher-assignment__chip"
                type="button"
                onClick={() => onRemoveClass(index)}
              >
                <span>{formatAssignedClass(item, lookups)}</span>
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
