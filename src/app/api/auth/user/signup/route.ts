import { NextRequest, NextResponse } from "next/server";
import { AxiosError } from "axios";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import UserModel from "@/models/UserModel";
import { cookies } from 'next/headers';
export const runtime = 'nodejs';

// ? Signup POST from AuthenticateOTP.tsx -> signUpApi()
export const POST = async (req: NextRequest) => {
    try {
        const body = await req.json();

        const { username, email, password, image, profession, timeZone } = body;

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new UserModel({
            username,
            email,
            password: hashedPassword,
            image,
            timeZone,
            profession,
            trendScore: 0,
            searchScore: 0,
            followers: [],
            following: [],
            bookedSlots: [],
            notifications: [],
            registeredSlots: [],
            isNewsFeedRefreshed: false,
            countOfNotifications: 0,
            disabledNotificationUsers: []
        });

        const savedUser = await newUser.save();

        // Create token payload
        const tokenPayload = {
            user_id: savedUser._id
        };

        // Generate JWT token
        const token = jwt.sign(tokenPayload, process.env.JWT_SECRET as string, { expiresIn: '30d' });

        // Set response with token in cookies
        const response = NextResponse.json({ message: 'Successful Signed Up.', success: true }, { status: 200 });
        response.cookies.set(process.env.NEXT_TOKEN as string, token, {
            httpOnly: true,
            secure: false,// true for production with HTTPS
            sameSite: "lax",
            path: "/",
            maxAge: 30 * 24 * 60 * 60,
        });

        return response;
    } catch (error: unknown) {
        console.log(error);
        if (error instanceof AxiosError) {
            return NextResponse.json({ message: error.message || "Internal server error!" }, { status: 500 });
        } else {
            return NextResponse.json({ message: "An error occurred!" }, { status: 500 });
        }
    }
};

// ? Delete request from ProfileDropdown.tsx -> handleLogOut() -> AlertLogout.tsx -> handleLogout()
export const DELETE = async () => {
    try {
        const cookieStore = cookies();
        (await cookieStore).delete(process.env.COOKIE_TOKEN!);

        // Respond with a success message
        return NextResponse.json({ message: "Logged out successfully.", success: true }, { status: 200 });
    } catch (error) {
        console.log("Error during logout:", error);
        return NextResponse.json({ message: "Something went wrong during logout." }, { status: 500 });
    }
}