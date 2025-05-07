import ConnectDB from "@/config/ConnectDB";
import SlotModel, { ISlot } from "@/models/SlotModel";
import { clusterMeetings } from "@/utils/ai/clustering";
import { NextResponse } from "next/server";

export type PartialSlot = Pick<ISlot, "title" | "description" | "tags" | "category">;

export async function GET() {
  try {
    await ConnectDB();

    const rawSlots = await SlotModel
      .find({}, { title: 1, description: 1, tags: 1, category: 1, _id: 0 })
      .lean();

    const slots: PartialSlot[] = rawSlots as unknown as PartialSlot[];

    const clusters = clusterMeetings(slots);

    const clusteredSlots = slots.map((slot, index) => ({
      ...slot,
      cluster: clusters[index],
    }));

    return NextResponse.json({ success: true, data: clusteredSlots }, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Failed to analyze trending topics", details: error },
      { status: 500 }
    );
  }
}