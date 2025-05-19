/* eslint-disable react-hooks/rules-of-hooks */
"use client";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { Topic, Feedback } from "@/lib/types";
import { ApiResponse } from "@/types/ApiResponse";
import axios, { AxiosError } from "axios";
import { Loader2, RefreshCcw, Link as LinkIcon, Trash2 } from "lucide-react";
import { User } from "next-auth";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import React, { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const Dashboard = () => {
const [topics, setTopics] = useState<Topic[]>([]);
const [isLoading, setIsLoading] = useState(true);
const [isSwitchLoading, setIsSwitchLoading] = useState(false);
const [newTopicName, setNewTopicName] = useState("");
const { toast } = useToast();
const router = useRouter();

const { data: session } = useSession();
const form = useForm({
    defaultValues: {
    acceptFeedback: true,
    },
});

const { register, watch, setValue } = form;

const acceptFeedback = watch("acceptFeedback");

const fetchAcceptFeedback = useCallback(async () => {
    setIsSwitchLoading(true);
    try {
    const response = await axios.get<ApiResponse>("/api/accept-message");
    setValue("acceptFeedback", response.data.isAcceptingMessages ?? false);
    } catch (error) {
    const axiosError = error as AxiosError<ApiResponse>;
    toast({
        title: "Error",
        description: axiosError.response?.data.message ?? "Failed to fetch feedback settings",
        variant: "destructive",
    });
    } finally {
    setIsSwitchLoading(false);
    }
}, [setValue, toast]);

const fetchTopics = useCallback(async (refresh: boolean = false) => {
    setIsLoading(true);
    setIsSwitchLoading(true);
    try {
    const response = await axios.get<ApiResponse>("/api/get-topics");
    if (response.data.success) {
        setTopics(response.data.topics || []);
    } else {
        setTopics([]);
    }
    if (refresh) {
        toast({
        title: "Topics Refreshed",
        });
    }
    } catch (error) {
    const axiosError = error as AxiosError<ApiResponse>;
    const errorMessage = axiosError.response?.data.message ?? "Failed to fetch topics";
    console.error("Fetch Topics Error:", axiosError.response?.data || axiosError.message);
    toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
    });
    setTopics([]);
    } finally {
    setIsLoading(false);
    setIsSwitchLoading(false);
    }
}, [toast]);

const handleCreateTopic = async () => {
    if (!newTopicName) {
    toast({
        title: "Error",
        description: "Topic name is required",
        variant: "destructive",
    });
    return;
    }

    try {
    const res = await fetch("/api/create-topic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newTopicName }),
    });
    const data = await res.json();
    if (data.success) {
        setTopics([...topics, data.topic]);
        setNewTopicName("");
        toast({
        title: "Success",
        description: `Topic created! Shareable link: ${data.shareableLink}`,
        variant: "default",
        });
    } else {
        toast({
        title: "Error",
        description: data.message || "Failed to create topic",
        variant: "destructive",
        });
    }
    } catch (error) {
    toast({
        title: "Error",
        description: "An error occurred while creating the topic",
        variant: "destructive",
    });
    }
};

const handleDeleteTopic = async (topicId: string) => {
    try {
    const response = await axios.delete<ApiResponse>("/api/delete-topic", {
        data: { topicId },
    });

    if (response.data.success) {
        setTopics(topics.filter((topic) => topic._id !== topicId));
        toast({
        title: "Success",
        description: "Topic deleted successfully",
        variant: "default",
        });
    } else {
        toast({
        title: "Error",
        description: response.data.message || "Failed to delete topic",
        variant: "destructive",
        });
    }
    } catch (error) {
    const axiosError = error as AxiosError<ApiResponse>;
    toast({
        title: "Error",
        description: axiosError.response?.data.message ?? "Failed to delete topic",
        variant: "destructive",
    });
    }
};

useEffect(() => {
    if (!session || !session.user) {
    return;
    }
    fetchTopics();
    fetchAcceptFeedback();
}, [session, fetchTopics, fetchAcceptFeedback, setValue, toast]);

const handleSwitch = async () => {
    try {
    const response = await axios.post<ApiResponse>("/api/accept-message", {
        acceptMessages: !acceptFeedback,
    });
    setValue("acceptFeedback", !acceptFeedback);
    toast({
        title: response.data.message,
    });
    } catch (error) {
    const axiosError = error as AxiosError<ApiResponse>;
    toast({
        title: "Error",
        description: axiosError.response?.data.message ?? "Failed to update feedback settings",
        variant: "destructive",
    });
    }
};

if (!session || !session.user) {
    return <div></div>;
}

const { username } = session.user as User;
const baseUrl = `${window.location.protocol}//${window.location.host}`;

const copyTopicLink = (slug: string) => {
    const topicUrl = `${baseUrl}/u/${username}/${slug}`;
    navigator.clipboard.writeText(topicUrl);
    toast({
    title: "Topic Link Copied!",
    description: "Share this link to collect feedback.",
    });
};

const calculateAverageRating = (feedback: Feedback[]) => {
    if (!feedback || feedback.length === 0) return 0;
    const total = feedback.reduce((sum, f) => sum + f.rating, 0);
    return (total / feedback.length).toFixed(1);
};

return (
    <div className="my-8 mx-4 md:mx-8 lg:mx-auto p-6 rounded w-full max-w-6xl">
    <h1 className="text-4xl font-bold mb-4">Dashboard, {username}</h1>

    <div className="mb-4">
        <Switch
        {...register("acceptFeedback")}
        checked={acceptFeedback}
        onCheckedChange={handleSwitch}
        disabled={isSwitchLoading}
        />
        <span className="ml-2">
        Accept Feedback: {acceptFeedback ? "On" : "Off"}
        </span>
    </div>

    <div className="space-y-6">
        <Card>
        <CardHeader>
            <h2 className="text-2xl font-semibold">Create a New Topic</h2>
        </CardHeader>
        <CardContent>
            <div className="flex space-x-4">
            <Input
                type="text"
                value={newTopicName}
                onChange={(e) => setNewTopicName(e.target.value)}
                placeholder="Enter topic name (e.g., Gardening Class)"
            />
            <Button onClick={handleCreateTopic}>Create Topic</Button>
            </div>
        </CardContent>
        </Card>

        <Separator />

        <Button
        className="mt-4"
        variant="outline"
        onClick={(e) => {
            e.preventDefault();
            fetchTopics(true);
        }}
        >
        {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
            <RefreshCcw className="h-4 w-4" />
        )}
        </Button>

        <Card>
        <CardHeader>
            <h2 className="text-2xl font-semibold">Your Topics</h2>
        </CardHeader>
        <CardContent>
            {topics.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {topics.map((topic) => (
                <div
                    key={topic._id}
                    className="border rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow"
                >
                    <div className="flex justify-between items-center">
                    <h3 className="text-xl font-semibold">{topic.name}</h3>
                    <div className="flex space-x-2">
                        <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyTopicLink(topic.slug)}
                        >
                        <LinkIcon className="h-4 w-4 mr-2" />
                        Copy Link
                        </Button>
                        <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteTopic(topic._id)}
                        >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                        </Button>
                    </div>
                    </div>
                    <p className="text-sm text-gray-500">
                    Created: {new Date(topic.createdAt).toLocaleDateString()}
                    </p>
                    <p className="mt-2">
                    Average Rating: {calculateAverageRating(topic.feedback)} / 5
                    </p>
                    <p>Total Feedback: {topic.feedback.length}</p>
                    <Button
                    variant="link"
                    className="mt-2 p-0"
                    onClick={() => router.push(`/dashboard/topics/${topic.slug}`)}
                    >
                    View Feedback
                    </Button>
                </div>
                ))}
            </div>
            ) : (
            <p>No topics created yet.</p>
            )}
        </CardContent>
        </Card>
    </div>
    </div>
);
};

export default Dashboard;