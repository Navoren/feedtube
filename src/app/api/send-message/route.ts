// app/api/send-message/route.ts
import { getServerSession } from "next-auth";
import dbConnect from "@/lib/dbConnect";
import { authOptions } from "../auth/[...nextauth]/options";
import TopicModel from "@/models/Topic.model";

export async function POST(req: Request) {
  await dbConnect();

  try {
    const { topicId, rating, text } = await req.json();

    if (!topicId || !rating || !text) {
      return Response.json(
        { success: false, message: "Topic ID, rating, and text required" },
        { status: 400 }
      );
    }

    const newFeedback = { rating, text, createdAt: new Date() };
    const updatedTopic = await TopicModel.findByIdAndUpdate(
      topicId,
      { $push: { feedback: newFeedback } },
      { new: true }
    );

    if (!updatedTopic) {
      return Response.json(
        { success: false, message: "Topic not found" },
        { status: 404 }
      );
    }

    return Response.json(
      { success: true, message: "Feedback submitted" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error Submitting Feedback:", error);
    return Response.json(
      { success: false, message: "Error in Submitting Feedback", error },
      { status: 500 }
    );
  }
}