
import ConnectDB from "@/config/ConnectDB";
import UserModel from "@/models/UserModel";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (req: NextRequest) => {
    try {
        await ConnectDB();
        const body = await req.json();
        const isUserExist = await UserModel.findOne({ email: body.email });
        if (isUserExist)
            return NextResponse.json(
                { success: false, message: "User email already exists!" },
                { status: 400 }
            );
        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error: unknown) {
        console.log(error);
        return NextResponse.json({ message: "Internal server error!" }, { status: 500 });
    }
}