import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/User.model";
import bcrypt from "bcryptjs";
import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";

export async function POST(req: Request){
    await dbConnect();

    try {
        const { username, email, password } = await req.json();
        const exisitngUserVerifiedByUsername = await UserModel.findOne({ username: username, isVerified: true });

        if (exisitngUserVerifiedByUsername) {
            return Response.json({
                success: false,
                message: "Username already exists."
            }, {status: 409});
        }

        const exisitngUserVerifiedByEmail = await UserModel.findOne({ email: email });
        let verifyCode = Math.floor(100000 + Math.random() * 900000).toString();

        if (exisitngUserVerifiedByEmail) {
            if (exisitngUserVerifiedByEmail.isVerified) {
                return Response.json({
                    success: false,
                    message: "User already exists with this email."
                }, {status: 409});
            }
            else {
                const hashedPassword = await bcrypt.hash(password, 10);
                exisitngUserVerifiedByEmail.password = hashedPassword;
                exisitngUserVerifiedByEmail.verifyCode = verifyCode;
                exisitngUserVerifiedByEmail.verifyCodeExpiry = new Date(Date.now() + 3600000);
                await exisitngUserVerifiedByEmail.save();
            }
        }
        else {
            const hashedPassword = await bcrypt.hash(password, 10);
            const expiryDate = new Date();
            expiryDate.setHours(expiryDate.getHours() + 1);

            const newUser = new UserModel({
                username: username,
                email: email,
                password: hashedPassword,
                verifyCode: verifyCode,
                verifyCodeExpiry: expiryDate,
                isVerified: false,
                isAcceptingMessages: true,
                messages: []
            })

            await newUser.save();
        }

        //SEND VERIFICATION EMAIL
        const emailResponse = await sendVerificationEmail(email, username, verifyCode);

        if (!emailResponse.success) {
            return Response.json({
                success: false,
                message: emailResponse.message
            }, {status: 500});
        }

        return Response.json({
            success: true,
            message: "Account created successfully. Please check your email for verification."
        }, {status: 201});

    } catch (error) {
        console.error(error);
        return Response.json({
            success: false,
            message: "An error occurred while creating the account."
        }, {status: 500});
        
    }
};