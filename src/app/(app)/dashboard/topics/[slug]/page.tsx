"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/use-toast";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Feedback } from "@/lib/types";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Loader2 } from "lucide-react";

export default function TopicFeedback({ params }: { params: { slug: string } }) {
  const [topicId, setTopicId] = useState<string | null>(null);
  const [topicName, setTopicName] = useState<string>(params.slug.replace(/-/g, " "));
  const [topicUserId, setTopicUserId] = useState<string | null>(null);
  const [feedbackList, setFeedbackList] = useState<Feedback[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { data: session } = useSession();
  const router = useRouter();
  const currentUserId = session?.user?._id;

  useEffect(() => {
    async function fetchTopic() {
      try {
        const res = await fetch(`/api/get-topic-by-slug?slug=${params.slug}`);
        const data = await res.json();
        if (data.success) {
          setTopicId(data.topic._id);
          setTopicName(data.topic.name);
          setTopicUserId(data.topic.userId.toString());
        } else {
          toast({
            title: "Error",
            description: data.message || "Failed to fetch topic",
            variant: "destructive",
          });
          router.push("/dashboard");
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "An error occurred while fetching the topic",
          variant: "destructive",
        });
        router.push("/dashboard");
      } finally {
        setIsLoading(false);
      }
    }
    fetchTopic();
  }, [params.slug, router]);

  const fetchFeedback = async () => {
    if (!topicId || currentUserId?.toString() !== topicUserId?.toString()) return;
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
    if (!currentUserId || !topicUserId || currentUserId?.toString() !== topicUserId?.toString()) {
      if (!isLoading) {
        router.push("/dashboard");
      }
      return;
    }
    fetchFeedback();
    const interval = setInterval(fetchFeedback, 30000);
    return () => clearInterval(interval);
  }, [topicId, currentUserId, topicUserId, router, isLoading]);

  if (!session || !session.user) {
    router.push("/sign-in");
    return <div></div>;
  }

  // Show loading state while fetching topic data
  if (isLoading) {
    return (
      <div className="container mx-auto my-8 p-6 rounded max-w-4xl flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Now that loading is complete, check access
  if (currentUserId?.toString() !== topicUserId?.toString()) {
    return <div>Access Denied: You are not the creator of this topic.</div>;
  }

  return (
    <div className="container mx-auto my-8 p-6 rounded max-w-4xl">
      <h1 className="text-4xl font-bold mb-6 text-center">
        Feedback for {topicName}
      </h1>

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

      <Separator className="my-6" />
      <div className="text-center">
        <Link href="/dashboard">
          <Button>Back to Dashboard</Button>
        </Link>
      </div>
    </div>
  );
}