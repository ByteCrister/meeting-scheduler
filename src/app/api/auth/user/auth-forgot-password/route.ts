import ConnectDB from "@/config/ConnectDB";
import UserModel from "@/models/UserModel";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (req: NextRequest) => {
    try {
        const body = await req.json();
        await ConnectDB();

        const isEmailExist = await UserModel.findOne({ email: body.email });
        if (!isEmailExist) {
            return NextResponse.json({ message: "Email not found! Please try again.", success: false }, { status: 404 });
        }

        return NextResponse.json({ success: true }, { status: 200 });

    } catch (error: unknown) {
        console.error(error);
        if (error instanceof Error) {
            return NextResponse.json({ message: error.message, success: false }, { status: 500 });
        }
    }
};