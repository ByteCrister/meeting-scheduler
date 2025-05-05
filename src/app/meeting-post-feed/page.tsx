import MeetingPostFeed from "@/components/meeting-post-feed/MeetingPostFeed"
import { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Meeting Post Feed',
};

const Default = () => {
  return (
     <MeetingPostFeed />
  )
}

export default Default