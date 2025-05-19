import { getServerSession } from "next-auth";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/User.model";
import { User } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import TopicModel from "@/models/Topic.model";

export async function GET(req: Request) { 
    await dbConnect();
    const session = await getServerSession(authOptions);
    const user: User = session?.user as User;
    
    if(!session || !session.user) {
        return Response.json({
            success: false,
            message: "Not authenticated"
        }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const topicId = searchParams.get("topicId");

    if (!topicId) {
        return Response.json({
            success: false, message: "Topic ID required"
        }, { status: 404 });
    }

    try {
        const topic = await TopicModel.findById(topicId, "feedback").exec();

        if (!topic) {
            return Response.json({
            success: false, message: "Topic not found"
            }, { status: 404 });
        }

        const sortedFeedback = topic.feedback.sort(
      (a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return Response.json(
      { success: true, feedback: sortedFeedback },
      { status: 200 }
    );

    } catch (error) {
        console.error("Error Getting Feedback:", error);
        return Response.json(
      { success: false, message: "Error in Getting Feedback", error },
      { status: 500 }
    );
    }

}