import Trending from "@/components/trending/Trending";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Trending",
};

const Page = () => {
    return (
        <Trending />
    )
};

export default Page