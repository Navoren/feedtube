import { resend } from "@/lib/resend";
import VerificationEmail from "../../emails/VerificationEmail";
import { ApiResponse } from "@/types/ApiResponse";

export async function sendVerificationEmail(
    email: string,
    username: string,
    verifyCode: string,
): Promise<ApiResponse>{
    try {
        await resend.emails.send({
            from: 'namantomar1453@gmail.com',
            to: email,
            subject: 'Verification Code for FeedTube',
            react: VerificationEmail({username, otp: verifyCode}),
        });
        return {
            success: true,
            message: "Verification email sent."
        };
    } catch (error) {
        console.error(error);
        return {
            success: false,
            message: "An error occurred while sending the verification email."
        };
    }
}