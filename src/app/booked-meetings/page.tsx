import BookedMeetings from "@/components/booked-meetings/BookedMeetings"
import { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Booked Meetings',
};

const Default = () => {
  return (
    <BookedMeetings />
  )
}

export default Default