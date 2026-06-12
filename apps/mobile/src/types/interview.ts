export type InterviewerType =
  | "tech_lead"
  | "hr"
  | "cross_dept"
  | "bigtech_round1"
  | "bigtech_final"
  | "project_lead";

export type InterviewSettings = {
  roundLimit: number;
  maxQuestionsPerRound: number;
  difficulty: "junior" | "middle" | "senior";
  style: "gentle" | "normal" | "pressure";
  language: "zh" | "en";
  interviewerType: InterviewerType;
  goal: "campus" | "social" | "transfer" | "promotion" | string;
};

export type InterviewPlan = {
  sessionId: string;
  createdAt: number;
  plannedRounds: {
    roundIndex: number;
    theme: string;
    focus: string[];
    interviewerAngle: string;
    expectedSignals: string[];
  }[];
};

export type LearningProfile = {
  id: string;
  interviewId: string;
  reportId: string;
  createdAt: number;
  status: "not_started" | "in_progress" | "completed";
  targetRole: string;
  interviewSummary: string;
  strengths: string[];
  weakPoints: string[];
  repeatedWeaknesses: string[];
  score: Record<string, number>;
  recommendedTopics: {
    id: string;
    title: string;
    status: "pending" | "in_progress" | "completed";
  }[];
  nextPracticeGoal: string;
};
