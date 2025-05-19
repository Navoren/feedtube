import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/User.model";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  await dbConnect();

  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json(
      { success: false, message: "User ID required" },
      { status: 400 }
    );
  }

  try {
    const user = await UserModel.findById(userId, "isAcceptingMessages").exec();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, isAcceptingMessages: user.isAcceptingMessages },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error Fetching User Status:", error);
    return NextResponse.json(
      { success: false, message: "Error in Fetching User Status", error },
      { status: 500 }
    );
  }
}