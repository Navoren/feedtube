import dbConnect from "@/lib/dbConnect";
import { z } from "zod";
import UserModel from "@/models/User.model";
import { usernameValidation } from "@/schemas/signUpSchema";

const UsernameQuerySchema = z.object({
    username: usernameValidation
})

export async function GET(req: Request) {
    // if (req.method !== 'GET') {
    //     return Response.json({
    //         success: false,
    //         message: "Only GET method is allowed."
    //     }, { status: 405});
    // }
    await dbConnect();

    try {
        const { searchParams } = new URL(req.url);
        const queryParam = {
            username: searchParams.get('username')
        }
        const result = UsernameQuerySchema.safeParse(queryParam);
        if (!result.success) {
            const usernameErrors = result.error.errors.map((error) => error.message);
            return Response.json({
                success: 'false',
                message: usernameErrors,
            }, { status: 400 });
        }

        const { username } = result.data;

        const existingUserVerified = await UserModel.findOne({ username, isVerified: true });

        if (existingUserVerified) {
            return Response.json({
                success: false,
                message: "Username already exists."
            }, { status: 409 });
        }
        return Response.json({
            success: true,
            message: "Username is unique."
        }, { status: 200 });
        
    } catch (error: any) {
        console.error('Error checking username:', error);
        return Response.json({
            success: false,
            message: "Error checking username",
            error: error
        }, {status: 500});
        
    }

}

