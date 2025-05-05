import { SearchedProfile } from "@/components/searched-profile/profile/SearchedProfile"
import { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Searched user profile',
};

const page = () => {
  return (
    <SearchedProfile />
  )
}

export default page