import { Message } from "@/models/User.model";

export interface ApiResponse{
    success: boolean;
    message: string;
    isAcceptingMeassages?: boolean;
    messages?: Array<Message>;
}