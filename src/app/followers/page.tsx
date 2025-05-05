import Followers from "@/components/followers/Followers"
import { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Followers',
};

const Default = () => {
  return (
    <Followers />
  )
}

export default Default