// --- Auth & User ---

export type UserRole = "CLIENT" | "SPECIALIST" | "ADMIN";

export interface User {
  id: string;
  email?: string;
  phone?: string;
  role: UserRole;
  firstName: string;
  lastName?: string;
  age?: number;
  gender?: "female" | "male" | null;
  city?: string;
  timezone?: string;
  avatarUrl?: string;
  emailVerified?: boolean;
  phoneVerified?: boolean;
  hasValueProfile: boolean;
  subscription?: {
    plan: "free" | "premium";
    aiConsultationsUsed: number;
    aiConsultationsLimit: number;
  };
  createdAt: string;
}

export interface AuthState {
  accessToken: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// --- Specialist ---

export type SpecialistType = "PSYCHOLOGIST" | "COACH" | "PSYCHOTHERAPIST";
export type VerificationStatus = "PENDING" | "APPROVED" | "REJECTED";
export type WorkFormat = "online" | "offline" | "hybrid";

export interface Specialist {
  id: string;
  firstName: string;
  lastName: string;
  type: SpecialistType;
  verified: boolean;
  avatarUrl?: string;
  education: string;
  experienceYears: number;
  approaches: string[];
  specializations: string[];
  bio: string;
  sessionPrice: number;
  sessionDuration: number;
  workFormats: WorkFormat[];
  averageRating: number;
  totalReviews: number;
  matchScore?: number;
  matchExplanation?: string[] | null;
  nearestAvailableSlot?: string;
  videoIntroUrl?: string;
  topValues?: string[];
  valueProfile?: {
    summary: string;
    topValues: string[];
  };
}

export interface SpecialistListItem {
  id: string;
  firstName: string;
  lastName: string;
  type: SpecialistType;
  verified: boolean;
  avatarUrl?: string;
  specializations: string[];
  approaches: string[];
  sessionPrice: number;
  workFormats: WorkFormat[];
  averageRating: number;
  totalReviews: number;
  matchScore?: number;
  nearestAvailableSlot?: string;
  topValues?: string[];
}

// --- Catalog Filters ---

export interface CatalogFilters {
  type?: SpecialistType[];
  specialization?: string[];
  approach?: string[];
  priceMin?: number;
  priceMax?: number;
  format?: WorkFormat | "all";
  gender?: "male" | "female" | "all";
  ratingMin?: number;
  search?: string;
  sortBy?: "match_score" | "rating" | "price_asc" | "price_desc" | "reviews";
}

// --- AI Consultation ---

export type ConsultationType =
  | "CLIENT_CONSULTATION"
  | "SPECIALIST_INTERVIEW"
  | "PROFILE_CORRECTION";

export type ConsultationPhase =
  | "GREETING"
  | "SITUATION_EXPLORATION"
  | "VALUE_ASSESSMENT"
  | "FORMAT_PREFERENCES"
  | "PROFESSIONAL_BACKGROUND"
  | "WORK_STYLE"
  | "CASE_QUESTIONS"
  | "SUMMARY"
  | "CONFIRMATION";

export type MessageRole = "assistant" | "user" | "system";

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  phase: ConsultationPhase;
  metadata?: {
    quickReplies?: string[];
    summary?: ConsultationSummary;
    crisisDetected?: boolean;
  } | null;
  createdAt: string;
}

export interface Conversation {
  conversationId: string;
  type: ConsultationType;
  status: "ACTIVE" | "COMPLETED" | "PAUSED";
  phase: ConsultationPhase;
  messages: ChatMessage[];
  result?: ConsultationResult;
}

export interface ConsultationSummary {
  requestSummary: string;
  requestType: string;
  recommendedSpecialistType: SpecialistType;
  valueProfile: ValueProfile;
  preferences: Preferences;
}

export interface ValueProfile {
  values: Record<string, number>;
  communicationStyle: Record<string, number>;
  summary: string;
}

export interface Preferences {
  format: WorkFormat;
  priceRange: [number, number];
  frequency: string;
  preferredGender: string | null;
  preferredTime: string;
}

export interface ConsultationResult {
  requestSummary: string;
  requestType: string;
  recommendedSpecialistType: SpecialistType;
  valueProfile: ValueProfile;
  preferences: Preferences;
}

// --- Matching ---

export interface MatchRecommendation {
  rank: number;
  specialistId: string;
  matchScore: number;
  specialist: {
    firstName: string;
    lastName: string;
    type: SpecialistType;
    avatarUrl?: string;
    sessionPrice: number;
    averageRating: number;
    totalReviews: number;
    nearestAvailableSlot?: string;
  };
  explanation: {
    summary: string;
    points: string[];
    breakdown: {
      valueMatch: number;
      communicationStyleMatch: number;
      approachMatch: number;
      worldviewMatch: number;
      specializationRelevance: number;
    };
  };
}

// --- Booking ---

export type BookingStatus =
  | "PENDING_PAYMENT"
  | "CONFIRMED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED_CLIENT"
  | "CANCELLED_SPECIALIST";

export interface TimeSlot {
  start: string;
  end: string;
  available: boolean;
}

export interface DaySlots {
  date: string;
  times: TimeSlot[];
}

export interface Booking {
  bookingId: string;
  status: BookingStatus;
  slotStart: string;
  slotEnd: string;
  format: WorkFormat;
  videoLink?: string;
  specialist: {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string;
  };
  price: number;
  matchScore?: number;
  canCancel: boolean;
  canReschedule: boolean;
  hasReview: boolean;
}

// --- Reviews ---

export interface Review {
  reviewId: string;
  rating: number;
  comment: string;
  isAnonymous: boolean;
  createdAt: string;
}

export interface ReviewSummary {
  averageRating: number;
  totalReviews: number;
  distribution: Record<string, number>;
}

// --- Notifications ---

export interface Notification {
  id: string;
  type: string;
  title: string;
  body: string;
  channel: string;
  readAt: string | null;
  entityType?: string;
  entityId?: string;
  createdAt: string;
}

// --- Pagination ---

export interface Pagination {
  cursor: string | null;
  hasMore: boolean;
  total: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: Pagination;
}
