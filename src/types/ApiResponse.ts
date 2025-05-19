import { Topic, Feedback } from "@/lib/types";

export interface ApiResponse {
  success: boolean;
  message?: string;
  isAcceptingMessages?: boolean;
  topic?: Topic;
  topics?: Topic[];
  feedback?: Feedback[];
  shareableLink?: string;
  error?: any;
}