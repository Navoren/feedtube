import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/User.model";

export async function POST(req: Request) {
    await dbConnect();

    try {
        const { username, verifyCode } = await req.json();
        
        const decodedUsername = decodeURIComponent(username);
        const user = await UserModel.findOne({ username: decodedUsername});
        if (!user) {
            return Response.json({
                success: false,
                message: "User not found"
            }, { status: 400 });
        }
        const isCodeValid = user.verifyCode === verifyCode;
        const isCodeExpired = new Date(user.verifyCodeExpiry) > new Date();
        if(!isCodeValid && !isCodeExpired) {
            return Response.json({
                success: false,
                message: "Invalid Code or Code Expired"
            }, { status: 400 });
        }
        else {
            user.isVerified = true;
            await user.save();
            return Response.json({
                success: true,
                message: "User Verified"
            },{status: 200});
        }
    } catch (error) {
        console.error('Error Verifying Code:', error);
        return Response.json({
            success: false,
            message: "Error in Code Verification",
            error: error
        }, { status: 500 });
    }
}