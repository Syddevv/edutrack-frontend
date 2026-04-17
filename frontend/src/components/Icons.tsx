import type { LucideIcon } from 'lucide-react'
import {
  Activity,
  BarChart3,
  Bot,
  Briefcase,
  Layers3,
  CheckCircle2,
  Clock3,
  Download,
  Eye,
  FileSpreadsheet,
  FileText,
  Filter,
  GraduationCap,
  Grid2x2,
  LogOut,
  Mail,
  Mic,
  MoreVertical,
  Pencil,
  Plus,
  Printer,
  RefreshCcw,
  School,
  Search,
  SendHorizontal,
  Settings,
  SlidersVertical,
  University,
  UserRoundPlus,
  Trash2,
  Users,
  Upload,
  X,
  XCircle,
} from 'lucide-react'

type IconProps = {
  className?: string
}

function createIcon(Icon: LucideIcon) {
  return function LibraryIcon({ className }: IconProps) {
    return <Icon aria-hidden="true" className={className} strokeWidth={1.8} />
  }
}

export const GraduationCapIcon = createIcon(GraduationCap)
export const GridIcon = createIcon(Grid2x2)
export const UsersIcon = createIcon(Users)
export const ChartIcon = createIcon(BarChart3)
export const SettingsIcon = createIcon(Settings)
export const LogoutIcon = createIcon(LogOut)
export const SearchIcon = createIcon(Search)
export const FilterIcon = createIcon(Filter)
export const DownloadIcon = createIcon(Download)
export const PlusIcon = createIcon(Plus)
export const EyeIcon = createIcon(Eye)
export const MoreVerticalIcon = createIcon(MoreVertical)
export const RefreshIcon = createIcon(RefreshCcw)
export const PencilIcon = createIcon(Pencil)
export const TrashIcon = createIcon(Trash2)
export const BriefcaseIcon = createIcon(Briefcase)
export const MailIcon = createIcon(Mail)
export const CloseIcon = createIcon(X)
export const MicrophoneIcon = createIcon(Mic)
export const SendIcon = createIcon(SendHorizontal)
export const UploadIcon = createIcon(Upload)
export const UserAddIcon = createIcon(UserRoundPlus)
export const CourseIcon = createIcon(GraduationCap)
export const ActivityIcon = createIcon(Activity)
export const SectionIcon = createIcon(Layers3)
export const YearLevelIcon = createIcon(University)

export function LockIcon({ className }: IconProps) {
  return (
    <svg aria-hidden="true" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4.5" y="10" width="15" height="10" rx="2" />
      <path d="M8 10V8a4 4 0 1 1 8 0v2" />
    </svg>
  )
}

export const ClockIcon = createIcon(Clock3)

export const CheckCircleIcon = createIcon(CheckCircle2)
export const XCircleIcon = createIcon(XCircle)

export const PrinterIcon = createIcon(Printer)
export const ChatbotIcon = createIcon(Bot)
export const FileTextIcon = createIcon(FileText)
export const TableIcon = createIcon(FileSpreadsheet)
export const SlidersIcon = createIcon(SlidersVertical)
export const SchoolIcon = createIcon(School)
