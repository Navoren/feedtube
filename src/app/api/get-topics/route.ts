import { getServerSession } from "next-auth";
import dbConnect from "@/lib/dbConnect";
import TopicModel from "@/models/Topic.model";
import { authOptions } from "../auth/[...nextauth]/options";
import { User } from "next-auth";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
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

    const userId = new mongoose.Types.ObjectId(user._id);
    const topics = await TopicModel.find({ userId }).exec();

    if (!topics || topics.length === 0) {
      return NextResponse.json(
        { success: false, message: "No topics found for this user" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, topics }, { status: 200 });
  } catch (error) {
    console.error("Error in GET /api/get-topics:", error);
    return NextResponse.json(
      { success: false, message: "Error in Fetching Topics", error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}