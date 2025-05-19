import { getServerSession } from "next-auth";
import dbConnect from "@/lib/dbConnect";
import TopicModel from "@/models/Topic.model";
import UserModel from "@/models/User.model";
import { authOptions } from "../auth/[...nextauth]/options";
import { User } from "next-auth";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

export async function DELETE(req: Request) {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);
    const user: User = session?.user as User;

    if (!session || !user) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      );
    }

    const { topicId } = await req.json();

    if (!topicId) {
      return NextResponse.json(
        { success: false, message: "Topic ID is required" },
        { status: 400 }
      );
    }

    const topic = await TopicModel.findById(topicId).exec();

    if (!topic) {
      return NextResponse.json(
        { success: false, message: "Topic not found" },
        { status: 404 }
      );
    }

    if (topic.userId.toString() !== user._id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized: You are not the creator of this topic" },
        { status: 403 }
      );
    }

    await TopicModel.deleteOne({ _id: topicId });

    await UserModel.updateOne(
      { _id: user._id },
      { $pull: { topics: new mongoose.Types.ObjectId(topicId) } }
    );

    return NextResponse.json(
      { success: true, message: "Topic deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in DELETE /api/delete-topic:", error);
    return NextResponse.json(
      { success: false, message: "Error in Deleting Topic", error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}