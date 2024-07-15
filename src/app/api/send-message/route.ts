import dbConnect from "@/lib/dbConnect";
import { messageSchema } from "@/schemas/messageSchema";
import UserModel from "@/models/User.model";
import { Message } from "@/models/User.model";

export async function POST(req: Request) { 
    await dbConnect();
    const { username, content } = await req.json();
    try {
        const user = await UserModel.findOne({ username });
        if (!user) {
            return Response.json({
                success: false,
                message: "User not found"
            }, { status: 400 });
        }
        if (!user.isAcceptingMessages) {
            return Response.json({
                success: false,
                message: "User is not accepting messages"
            }, { status: 400 });
        }
        const newMessage = {
            content,
            createdAt: new Date()
        }
        user.messages.push(newMessage as Message);
        await user.save();

        return Response.json({
            success: true,
            message: "Message Sent",
            newMessage
        }, { status: 200 });

    } catch (error) {
        console.error('Error Adding Messages:', error);

        return Response.json({
            success: false,
            message: "Error Adding Messages",
            error: error
        }, { status: 500 });
        
    }
}