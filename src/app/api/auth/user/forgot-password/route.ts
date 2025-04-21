import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import ConnectDB from "@/config/ConnectDB";
import UserModel from "@/models/UserModel";


export const POST = async (req: NextRequest) => {
    try {
        const body = await req.json();
        const { email, password } = body;

        await ConnectDB();

        const user = await UserModel.findOne({ email });
        if (!user) {
            return NextResponse.json({ message: "User not found", success: false }, { status: 404 });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        user.password = hashedPassword;
        const savedUser = await user.save();

        // Create token payload
        const tokenPayload = {
            user_id: savedUser._id
        };

        // Generate JWT token
        const token = jwt.sign(tokenPayload, process.env.JWT_SECRET as string, { expiresIn: '30d' });

        // Set response with token in cookies
        const response = NextResponse.json({ message: 'Password Updated Successfully.' }, { status: 201 });
        response.cookies.set(process.env.NEXT_TOKEN as string, token, {
            httpOnly: false,
            secure: false, // true for production with HTTPS
            sameSite: "lax", 
            path: "/",
            maxAge: 30 * 24 * 60 * 60, 
        });

        return response;

    } catch (error: unknown) {
        console.error("Error updating password:", error);
        if (error instanceof Error) {
            return NextResponse.json({ message: error.message, success: false }, { status: 500 });
        }
    }
};