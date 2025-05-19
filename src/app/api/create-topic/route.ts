import TopicModel from "@/models/Topic.model";
import mongoose from "mongoose";
import { nanoid } from "nanoid";
import { authOptions } from "../auth/[...nextauth]/options";
import UserModel from "@/models/User.model";
import dbConnect from "@/lib/dbConnect";
import { getServerSession } from "next-auth";
import { User } from "next-auth";

export async function POST(req: Request) {
  await dbConnect();
  const session = await getServerSession(authOptions);
  const user: User = session?.user as User;

  if (!session || !user) {
    return Response.json(
      { success: false, message: "Not authenticated" },
      { status: 401 }
    );
  }

  try {
    const { name } = await req.json();
    const userId = new mongoose.Types.ObjectId(user._id);

    if (!name) {
      return Response.json(
        { success: false, message: "Topic name required" },
        { status: 400 }
      );
    }

    // Generate a unique slug
    const slug = name.toLowerCase().replace(/\s+/g, "-") + "-" + nanoid(8);

    // Create the topic
    const newTopic = new TopicModel({
      userId,
      name,
      slug,
      feedback: [],
    });
    await newTopic.save();

    // Add the topic to the user's topics array
    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      { $push: { topics: newTopic._id } },
      { new: true }
    );

    if (!updatedUser) {
      return Response.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    return Response.json({
      success: true,
      topic: newTopic,
      shareableLink: `https://feedtube.vercel.app/u/${userId}/${slug}`,
    });
  } catch (error) {
    console.error("Error Creating Topic:", error);
    return Response.json(
      { success: false, message: "Error in Creating Topic", error },
      { status: 500 }
    );
  }
}