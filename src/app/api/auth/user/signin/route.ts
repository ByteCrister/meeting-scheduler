import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import ConnectDB from "@/config/ConnectDB";
import UserModel from "@/models/UserModel";

export const POST = async (request: NextRequest) => {
    try {
        const body = await request.json();

        if (!body.email || !body.password) {
            return NextResponse.json({ success: false, message: "Email and password are required!" }, { status: 400 });
        }

        await ConnectDB();
        const user = await UserModel.findOne({ email: body.email });
        if (!user) {
            return NextResponse.json({ success: false, message: "Email not found!" }, { status: 400 });
        }

        const isValidPassword = await bcrypt.compare(body.password, user.password);
        if (!isValidPassword) {
            return NextResponse.json({ success: false, message: "Invalid password!" }, { status: 400 });
        }

        // Create token payload
        const tokenPayload = { user_id: user._id };

        // Generate JWT token
        const token = jwt.sign(tokenPayload, process.env.JWT_SECRET as string, { expiresIn: "30d" });

        // Set response with token in cookies
        const response = NextResponse.json({ message: "Sign-in successful.", success: true }, { status: 200 });

        console.log("Setting cookie with key:", process.env.NEXT_TOKEN);
        console.log("Generated token:", token);

        response.cookies.set(process.env.NEXT_TOKEN as string, token, {
            httpOnly: false,
            secure: false, // true for production with HTTPS
            sameSite: "lax",
            path: "/",
            maxAge: 30 * 24 * 60 * 60,
        });

        return response;
    } catch (error: unknown) {
        console.error("Error during sign-in:", error);
        if (error instanceof Error) {
            return NextResponse.json({ success: false, message: error.message || "Internal server error" }, { status: 500 });
        }
    }
};