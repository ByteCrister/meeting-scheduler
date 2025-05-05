import { PopularPage } from "@/components/popular/PopularPage"
import { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Popular',
};

const page = () => {
  return (
    <PopularPage />
  )
}

export default page