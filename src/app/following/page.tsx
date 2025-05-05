import Following from "@/components/following/Following"
import { Metadata } from "next";

export const metadata: Metadata = {
    title: 'Following',
};

const Default = () => {
    return (
        <Following />
    )
}

export default Default