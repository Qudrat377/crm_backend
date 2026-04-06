export enum UserRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  TEACHER = 'teacher',
  USER = 'user',
  ASISTEND = 'asistend',
  STUDENT = 'student'
}

export enum StudentStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  GRADUATED = 'graduated',
  SUSPENDED = 'suspended',
}

export enum GroupStatus {
  UPCOMING = 'upcoming',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum PaymentMethod {
  CASH = 'cash',
  CARD = 'card',
  BANK_TRANSFER = 'bank_transfer',
  ONLINE = 'online',
}

export enum PaymentStatus {
  PAID = 'paid',
  PARTIAL = 'partial',
  REFUNDED = 'refunded',
}

export enum AttendanceStatus {
  PRESENT = 'present',
  ABSENT = 'absent',
  LATE = 'late',
  EXCUSED = 'excused',
}

export enum LeadStatus {
  NEW = 'new',
  CONTACTED = 'contacted',
  TRIAL = 'trial',
  REGISTERED = 'registered',
  PAID = 'paid',
  LOST = 'lost',
}

export enum LeadSource {
  INSTAGRAM = 'instagram',
  TELEGRAM = 'telegram',
  REFERRAL = 'referral',
  WALK_IN = 'walk_in',
  WEBSITE = 'website',
  PHONE_CALL = 'phone_call',
  OTHER = 'other',
}

export enum SalaryStatus {
  PENDING = 'pending',
  PAID = 'paid',
}

export enum ActivityType {
  CALL = 'call',
  MESSAGE = 'message',
  STATUS_CHANGE = 'status_change',
  NOTE = 'note',
  MEETING = 'meeting',
}
