import Default from "@/components/landing/Default";
import axios from "axios";
import { Metadata } from "next";
import { cookies } from "next/headers";

export async function generateMetadata(): Promise<Metadata> {
  const cookieStore = cookies();
  const allCookies = (await cookieStore).getAll();

  // Convert cookies to header format
  const cookieHeader = allCookies.map(c => `${c.name}=${c.value}`).join("; ");

  const baseURL = process.env.NEXT_PUBLIC_DOMAIN!;
  try {

    const res = await axios.get(`${baseURL}/api/auth/status`, {
      headers: {
        Cookie: cookieHeader,
      },
    });

    const user = res.data.user;

    if (user?.username) {
      return {
        metadataBase: new URL(baseURL),
        title: `${user.username} | MeetingSync`,
        openGraph: {
          title: `${user.title} | MeetingSync`,
          description: `Welcome back, ${user.username}!`,
          images: user.image ? [user.image] : [],
        },
      };
    }
  } catch (err) {
    console.error("Failed to fetch user for metadata:", err);
  }

  return {
    metadataBase: new URL(baseURL),
    title: "Home | MeetingSync",
    openGraph: {
      title: "Home | MeetingSync",
      description: "Effortlessly schedule meetings with MeetingSync.",
      images: [],
    },
  };
}

export default function Home() {
  return (
    <Default />
  );
}