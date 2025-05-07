import ConnectDB from "@/config/ConnectDB";
import SlotModel, { ISlot } from "@/models/SlotModel";
import { analyzeBestTimes } from "@/utils/ai/timeAnalysis";
import { NextResponse } from "next/server";

export type TimeDataSlot = Pick<ISlot, "meetingDate" | "engagementRate" | "durationFrom" | "durationTo">;

export async function GET() {
    try {
        await ConnectDB();

        const rawSlots = await SlotModel.find({}, { meetingDate: 1, engagementRate: 1, durationFrom: 1, durationTo: 1, _id: 0 }).lean();
        const slots: TimeDataSlot[] = rawSlots as unknown as TimeDataSlot[];

        const result = analyzeBestTimes(slots);

        return NextResponse.json({ success: true, data: result }, { status: 200 });
    } catch (error) {
        console.log(error);
        return NextResponse.json(
            { error: "Failed to calculate best meeting times", details: error },
            { status: 500 }
        );
    }
}
