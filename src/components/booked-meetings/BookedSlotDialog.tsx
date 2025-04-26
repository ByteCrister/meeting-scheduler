'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Separator } from "../ui/separator";
import { Badge } from "../ui/badge";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { toggleViewBookedSlot } from "@/lib/features/component-state/componentSlice";
import { formateSlotMeetingDate } from "../my-slots/SlotCard";
import { convertTimeBetweenTimeZones } from "@/utils/client/date-formatting/convertTimeBetweenTimeZones";
import { convertDateTimeBetweenTimeZones } from "@/utils/client/date-formatting/convertDateTimeBetweenTimeZones";


export function BookedSlotDialog() {
    const { isOpen, Slot } = useAppSelector(state => state.componentStore.viewBookedSlotDialog);
    const currentUserTimeZone = useAppSelector(state => state.userStore.user?.timeZone);

    const convertedMeetingDateUTC = convertDateTimeBetweenTimeZones(currentUserTimeZone!, Slot?.timeZone as string, Slot?.meetingDate as string, Slot?.durationFrom as string);
    const formattedScheduleDate = formateSlotMeetingDate(convertedMeetingDateUTC || '');

    let formattedDurationFrom = '';
    let formattedDurationTo = '';
    if (Slot && Slot?.meetingDate && Slot.timeZone && Slot.durationFrom && Slot.durationTo) {
        formattedDurationFrom = convertTimeBetweenTimeZones(currentUserTimeZone!, Slot.timeZone, Slot?.meetingDate, Slot?.durationFrom);
        formattedDurationTo = convertTimeBetweenTimeZones(currentUserTimeZone!, Slot.timeZone, Slot?.meetingDate, Slot?.durationTo);
    }

    const dispatch = useAppDispatch();

    const onOpenChange = () => {
        dispatch(toggleViewBookedSlot({ isOpen: false, Slot: null }));
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg rounded-2xl shadow-xl">
                <DialogHeader>
                    <DialogTitle className="text-xl font-semibold">{Slot?.title}</DialogTitle>
                    <DialogDescription>
                        Scheduled on {formattedScheduleDate}
                    </DialogDescription>
                </DialogHeader>

                <Separator className="my-2" />

                <div className="space-y-3 text-sm">
                    <div>
                        <strong>Category:</strong> {Slot?.category}
                    </div>

                    <div>
                        <strong>Description:</strong>
                        <p className="text-muted-foreground mt-1">{Slot?.description}</p>
                    </div>

                    {
                        Slot?.meetingDate && Slot.timeZone && Slot.durationFrom && Slot.durationTo
                        && <>
                            <div>
                                <strong>Duration:</strong>
                                {`${formattedDurationFrom} - ${formattedDurationTo}`}
                            </div>
                        </>
                    }

                    <div>
                        <strong>Status:</strong>
                        <Badge variant="outline" className="ml-1">{Slot?.status}</Badge>
                    </div>

                    <div>
                        <strong>Tags:</strong>
                        <div className="flex flex-wrap gap-2 mt-1">
                            {Slot?.tags.map((tag, index) => (
                                <Badge key={index} variant="secondary">{tag}</Badge>
                            ))}
                        </div>
                    </div>

                    <div>
                        <strong>Created by:</strong> {Slot?.creator}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
