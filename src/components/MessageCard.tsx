'use client'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card"
import { AlertDialogDemo } from "./Alert";
import { Message } from "@/models/User.model";
import axios, { AxiosError } from "axios";
import { ApiResponse } from "@/types/ApiResponse";
import { useToast } from "./ui/use-toast";

type MessageCardProps = {
    message: Message;
    onMessageDelete: (messageId: string) => void;
}

const MessageCard = ({ message, onMessageDelete }: MessageCardProps) => {
    const { toast } = useToast();
    const handleDeleteConfirm = async () => {
        try {
            const response = await axios.delete<ApiResponse>(
                `/api/delete-message/${message._id}`
            );
            toast({
                title: response.data.message,
            });
            onMessageDelete(message._id);
    
        } catch (error) {
            const axiosError = error as AxiosError<ApiResponse>;
            toast({
                title: 'Error',
                description:
                    axiosError.response?.data.message ?? 'Failed to delete message',
                variant: 'destructive',
            });
        }
    };
    return (
        <Card>
            <CardHeader>
                <CardTitle>Card Title</CardTitle>
                <CardDescription>Card Description</CardDescription>
                <AlertDialogDemo onDeleteConfirm={handleDeleteConfirm} />
            </CardHeader>
            <CardContent>
            </CardContent>
        </Card>

    );
}

export default MessageCard