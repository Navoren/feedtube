import { getServerSession } from "next-auth";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/User.model";
import { User } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";

export async function POST(req: Request) { 
    await dbConnect();
    const session = await getServerSession(authOptions);
    const user: User = session?.user as User ;

    if (!session || !session.user) {
        return Response.json({
            success: false,
            message: "Not authenticated"
        }, { status: 401 });
    }

    const userId = user._id;
    const {acceptMessages} = await req.json();

    try {
        const updatedUser = await UserModel.findByIdAndUpdate(
            userId,
            { isAcceptingMessages: acceptMessages },
            { new: true }
        );
        if(!updatedUser) {
            return Response.json({
                success: false,
                message: "User Not Found"
            }, { status: 401 });
        }
        else {
            return Response.json({
                success: true,
                message: "Messages Accepted",
                updatedUser
            }, { status: 200 });
        }
    } catch (error) {
        console.error('Error Accepting Messages:', error);
        return Response.json({
            success: false,
            message: "Error in Accepting Messages",
            error: error
        }, { status: 500 });
    }
}

export async function GET(req: Request) {
    await dbConnect();
    const session = await getServerSession(authOptions);
    const user: User = session?.user as User ;

    if (!session || !session.user) {
        return Response.json({
            success: false,
            message: "Not authenticated"
        }, { status: 401 });
    }

    const userId = user._id;

    try {
        const foundUser = await UserModel.findById(userId);
        if(!foundUser) {
            return Response.json({
                success: false,
                message: "User Not Found"
            }, { status: 401 });
        }
        else {
            return Response.json({
                success: true,
                message: "User Found",
                isAcceptingMessages: foundUser.isAcceptingMessages
            }, { status: 200 });
        }
    } catch (error) {
        console.error('Error Getting Messages:', error);
        return Response.json({
            success: false,
            message: "Error in Getting Messages",
            error: error
        }, { status: 500 });
    }
}