"use client";

import React, { useState, useEffect } from "react";
import axios, { AxiosError } from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CardHeader, CardContent, Card } from "@/components/ui/card";
import { useCompletion } from "ai/react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import * as z from "zod";
import { ApiResponse } from "@/types/ApiResponse";
import Link from "next/link";
import { Feedback } from "@/lib/types";
import { feedbackSchema } from "@/schemas/feedbackSchema";
import { useSession } from "next-auth/react";

// Define the schema for feedback submission
const feedbackFormSchema = feedbackSchema;

export default function TopicBoard({ params }: { params: { username: string; slug: string } }) {
  const [topicId, setTopicId] = useState<string | null>(null);
  const [topicName, setTopicName] = useState<string>(params.slug.replace(/-/g, " "));
  const [topicUserId, setTopicUserId] = useState<string | null>(null); // To check if current user is the creator
  const [feedbackList, setFeedbackList] = useState<Feedback[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [canAcceptFeedback, setCanAcceptFeedback] = useState(true); // To check if creator accepts feedback

  const { data: session } = useSession();
  const currentUserId = session?.user?._id;

  const specialChar = "||";

  const initialMessageString =
    "Great event, loved the organization!||The session was informative but too short.||Could use more interactive activities.";

  const {
    complete,
    completion,
    isLoading: isSuggestLoading,
    error,
  } = useCompletion({
    api: "/api/suggest-message",
    initialCompletion: initialMessageString,
  });

  const form = useForm<z.infer<typeof feedbackFormSchema>>({
    resolver: zodResolver(feedbackFormSchema),
    defaultValues: {
      rating: 0,
      text: "",
    },
  });

  // Fetch topic by slug to get topicId and userId
  useEffect(() => {
    async function fetchTopic() {
      try {
        const res = await fetch(`/api/get-topic-by-slug?slug=${params.slug}`);
        const data = await res.json();
        if (data.success) {
          setTopicId(data.topic._id);
          setTopicName(data.topic.name);
          setTopicUserId(data.topic.userId);
          // Fetch the creator's isAcceptingMessages status
          const userRes = await fetch(`/api/get-user-status?userId=${data.topic.userId}`);
          const userData = await userRes.json();
          if (userData.success) {
            setCanAcceptFeedback(userData.isAcceptingMessages ?? true);
          }
        } else {
          toast({
            title: "Error",
            description: data.message || "Failed to fetch topic",
            variant: "destructive",
          });
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "An error occurred while fetching the topic",
          variant: "destructive",
        });
      }
    }
    fetchTopic();
  }, [params.slug]);

  const fetchFeedback = async () => {
    if (!topicId || currentUserId !== topicUserId) return;
    try {
      const res = await fetch(`/api/get-message?topicId=${topicId}`);
      const data = await res.json();
      if (data.success) {
        setFeedbackList(data.feedback);
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to fetch feedback",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while fetching feedback",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (currentUserId !== topicUserId) return;
    fetchFeedback();
    const interval = setInterval(fetchFeedback, 30000);
    return () => clearInterval(interval);
  }, [topicId, currentUserId, topicUserId]);

  const handleMessageClick = (message: string) => {
    form.setValue("text", message);
  };

  const parseStringMessages = (messageString: string): string[] => {
    return messageString.split(specialChar);
  };

  const onSubmit = async (data: z.infer<typeof feedbackFormSchema>) => {
    if (!topicId) {
      toast({
        title: "Error",
        description: "Topic not found",
        variant: "destructive",
      });
      return;
    }

    if (!canAcceptFeedback) {
      toast({
        title: "Error",
        description: "The creator is not accepting feedback at this time",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post<ApiResponse>("/api/send-message", {
        topicId,
        rating: data.rating,
        text: data.text,
      });

      toast({
        title: response.data.message,
        variant: "default",
      });
      if (currentUserId === topicUserId) {
        setFeedbackList([
          ...feedbackList,
          { rating: data.rating, text: data.text, createdAt: new Date() },
        ]);
      }
      form.reset({ rating: 0, text: "" });
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast({
        title: "Error",
        description:
          axiosError.response?.data.message ?? "Failed to submit feedback",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggest = async () => {
    try {
      complete("");
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast({
        title: axiosError.response?.data.message ?? "An error occurred",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  const isCreator = currentUserId === topicUserId;

  return (
    <div className="container mx-auto my-8 p-6 rounded max-w-4xl">
      <h1 className="text-4xl font-bold mb-6 text-center">
        Feedback for {topicName}
      </h1>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="rating"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Rate this Topic (1–5 Stars)</FormLabel>
                <FormControl>
                  <div className="flex space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span
                        key={star}
                        onClick={() => form.setValue("rating", star)}
                        className={`cursor-pointer text-2xl ${
                          star <= field.value ? "text-yellow-400" : "text-gray-300"
                        }`}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="text"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Submit Anonymous Feedback for {topicName}</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Write your anonymous feedback here"
                    className="resize-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex justify-center">
            {isLoading ? (
              <Button disabled>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Please wait
              </Button>
            ) : (
              <Button type="submit" disabled={isLoading || !canAcceptFeedback}>
                Submit Feedback
              </Button>
            )}
          </div>
        </form>
      </Form>

      <div className="space-y-4 my-8">
        <div className="space-y-2">
          <Button
            onClick={handleSuggest}
            className="my-4"
            disabled={isSuggestLoading}
          >
            Suggest Feedback
          </Button>
          <p>Click on any suggestion below to select it.</p>
        </div>
        <Card>
          <CardHeader>
            <h3 className="text-xl font-semibold">Feedback Suggestions</h3>
          </CardHeader>
          <CardContent className="flex flex-col space-y-4">
            {error ? (
              <p className="text-red-500">{error.message}</p>
            ) : (
              parseStringMessages(completion).map((message, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="mb-2"
                  onClick={() => handleMessageClick(message)}
                >
                  {message}
                </Button>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {isCreator && (
        <Card className="my-8">
          <CardHeader>
            <h2 className="text-2xl font-semibold">Feedback Received</h2>
          </CardHeader>
          <CardContent>
            {feedbackList.length > 0 ? (
              <ul className="space-y-4">
                {feedbackList.map((item, index) => (
                  <li key={item._id || index} className="border-b pb-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-yellow-400">
                        {"★".repeat(item.rating)}{"☆".repeat(5 - item.rating)}
                      </span>
                      <span>{item.text}</span>
                    </div>
                    <small className="text-gray-500">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </small>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No feedback yet.</p>
            )}
          </CardContent>
        </Card>
      )}

      <Separator className="my-6" />
      <div className="text-center">
        <div className="mb-4">Get Your Own Feedback Board</div>
        <Link href={"/sign-up"}>
          <Button>Create Your Account</Button>
        </Link>
      </div>
    </div>
  );
}