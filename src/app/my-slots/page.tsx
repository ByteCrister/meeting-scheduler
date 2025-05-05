import MySlots from "@/components/my-slots/MySlots"
import { Metadata } from "next";

export const metadata: Metadata = {
  title: 'My Meeting Slots',
};

const page = () => {
  return (
    <MySlots />
  )
}

export default page