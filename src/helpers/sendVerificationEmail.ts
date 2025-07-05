import * as brevo from '@getbrevo/brevo';
import VerificationEmail from "../../emails/VerificationEmail";
import { ApiResponse } from "@/types/ApiResponse";
import { render } from '@react-email/render';

export async function sendVerificationEmail(
    email: string,
    username: string,
    verifyCode: string,
): Promise<ApiResponse> {
    try {

        const apiInstance = new brevo.TransactionalEmailsApi();
        
        apiInstance.setApiKey(brevo.TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY || 'YOUR_API_KEY');

        const sendSmtpEmail = new brevo.SendSmtpEmail();
        const htmlContent = render(VerificationEmail({ username, otp: verifyCode }));

        sendSmtpEmail.sender = { 
            name: "FeedTube Team", 
            email: "namantomar1453@gmail.com" 
        };
        sendSmtpEmail.to = [{ email, name: username }];
        sendSmtpEmail.subject = "Verification Code for FeedTube";
        sendSmtpEmail.htmlContent = htmlContent;
        sendSmtpEmail.replyTo = { 
            email: "namantomar1453@gmail.com", 
            name: "FeedTube Team" 
        };

        await apiInstance.sendTransacEmail(sendSmtpEmail);

        return {
            success: true,
            message: "Verification email sent."
        };
    } catch (error: any) {
        console.error("Error sending verification email:", error.message);
        if (error.message.includes("sender you used is not valid")) {
            return {
                success: false,
                message: "Sender email is not verified. Please verify 'namantomar1453@gmail.com' in Brevo's Senders settings."
            };
        }
        return {
            success: false,
            message: "An error occurred while sending the verification email."
        };
    }
}