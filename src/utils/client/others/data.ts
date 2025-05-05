import { ActivityType, Notification, registerSlot, RegisterSlotStatus } from "@/types/client-types";
import { NotificationType } from "@/utils/constants";

export const FollowersData = [
    {
        _id: "soi293hdf203r2j023##tgr2379",
        username: "john_doe",
        title: "Tech enthusiast, coffee lover ☕",
        image:
            "https://img.lovepik.com/png/20231128/3d-illustration-avatar-profile-man-collection-guy-cheerful_716220_wh1200.png",
        isActive: true,
    },
    {
        _id: "xoi239fhe203fjw093##abc4567",
        username: "jane_smith",
        title: "Avid reader & startup dreamer 🚀",
        image:
            "https://img.lovepik.com/png/20231128/3d-illustration-avatar-profile-man-collection-guy-cheerful_716220_wh1200.png",
        isActive: true,
    },
    {
        _id: "poi493kdj203lfj023##xyz9876",
        username: "michael_ross",
        title: "Designing experiences, not just screens 🎨",
        image:
            "https://img.lovepik.com/png/20231128/3d-illustration-avatar-profile-man-collection-guy-cheerful_716220_wh1200.png",
        isActive: true,
    },
    {
        _id: "qwe123lkj903nmx092##pqr1234",
        username: "emily_clark",
        title: "Marketing geek with a love for storytelling 📖",
        image:
            "https://img.lovepik.com/png/20231128/3d-illustration-avatar-profile-man-collection-guy-cheerful_716220_wh1200.png",
        isActive: true,
    },
    {
        _id: "rty567zxc509bvc982##stu6789",
        username: "alex_wilson",
        title: "Building apps & breaking bugs 🐛",
        image:
            "https://img.lovepik.com/png/20231128/3d-illustration-avatar-profile-man-collection-guy-cheerful_716220_wh1200.png",
        isActive: true,
    },
    {
        _id: "uio789mnb405ghj376##lmn3456",
        username: "sophia_taylor",
        title: "Traveler, foodie, and part-time coder 🌍",
        image:
            "https://img.lovepik.com/png/20231128/3d-illustration-avatar-profile-man-collection-guy-cheerful_716220_wh1200.png",
        isActive: true,
    },
];

export const SlotsData: registerSlot[] = [
    {
        _id: 'slot101',
        title: 'Intro to Cloud Functions',
        category: 'Cloud - 102',
        description: 'Understand serverless functions using Firebase.',
        tags: ['Cloud', 'Serverless', 'Firebase'],
        durationFrom: '11:00 AM',
        durationTo: '01:00 PM',
        meetingDate: '2025-05-05T11:00:00Z',
        guestSize: 20,
        bookedUsers: ['uid001', 'uid002'],
        trendScore: 3,
        engagementRate: 5,
        status: RegisterSlotStatus.Ongoing,
        createdAt: '2023-03-01T08:30:00Z',
        updatedAt: '2023-03-10T09:45:00Z',
    },
    {
        _id: 'slot102',
        title: 'Building RESTful APIs with Node.js',
        category: 'Backend - 204',
        description: 'Learn to build scalable APIs using Express and Node.',
        tags: ['Node.js', 'Express', 'REST API'],
        durationFrom: '03:00 PM',
        durationTo: '06:00 PM',
        meetingDate: '2025-04-28T15:00:00Z',
        guestSize: 18,
        bookedUsers: ['uid003', 'uid004'],
        trendScore: 6,
        engagementRate: 8,
        status: RegisterSlotStatus.Completed,
        createdAt: '2023-02-10T09:00:00Z',
        updatedAt: '2023-03-05T10:30:00Z',
    },
    {
        _id: 'slot103',
        title: 'UI/UX for Mobile Apps',
        category: 'Design - 103',
        description: 'Best practices for designing mobile-first experiences.',
        tags: ['UI', 'UX', 'Mobile Design'],
        durationFrom: '01:00 PM',
        durationTo: '03:00 PM',
        meetingDate: '2025-05-03T13:00:00Z',
        guestSize: 25,
        bookedUsers: ['uid005', 'uid006'],
        trendScore: 4,
        engagementRate: 7,
        status: RegisterSlotStatus.Upcoming,
        createdAt: '2023-03-03T10:15:00Z',
        updatedAt: '2023-03-07T14:00:00Z',
    },
    {
        _id: 'slot104',
        title: 'Next.js for Scalable Web Apps',
        category: 'Frontend - 401',
        description: 'Use Next.js to build SSR and SSG based web apps.',
        tags: ['Next.js', 'SSR', 'SSG'],
        durationFrom: '10:00 AM',
        durationTo: '01:00 PM',
        meetingDate: '2025-06-10T10:00:00Z',
        guestSize: 22,
        bookedUsers: ['uid007', 'uid008'],
        trendScore: 7,
        engagementRate: 9,
        status: RegisterSlotStatus.Upcoming,
        createdAt: '2023-01-20T11:00:00Z',
        updatedAt: '2023-02-10T13:20:00Z',
    },
    {
        _id: 'slot105',
        title: 'Understanding GraphQL',
        category: 'API Design - 301',
        description: 'Master GraphQL queries and schema design.',
        tags: ['GraphQL', 'API', 'Apollo'],
        durationFrom: '04:00 PM',
        durationTo: '06:00 PM',
        meetingDate: '2025-07-01T16:00:00Z',
        guestSize: 30,
        bookedUsers: ['uid009', 'uid010'],
        trendScore: 5,
        engagementRate: 6,
        status: RegisterSlotStatus.Completed,
        createdAt: '2023-02-01T09:00:00Z',
        updatedAt: '2023-03-05T11:45:00Z',
    },
    {
        _id: 'slot106',
        title: 'CI/CD with GitHub Actions',
        category: 'DevOps - 404',
        description: 'Set up pipelines with GitHub Actions for automation.',
        tags: ['CI/CD', 'GitHub Actions', 'Automation'],
        durationFrom: '09:00 AM',
        durationTo: '11:00 AM',
        meetingDate: '2025-05-15T09:00:00Z',
        guestSize: 12,
        bookedUsers: ['uid011'],
        trendScore: 6,
        engagementRate: 7,
        status: RegisterSlotStatus.Ongoing,
        createdAt: '2023-02-18T08:30:00Z',
        updatedAt: '2023-03-06T12:00:00Z',
    },
    {
        _id: 'slot107',
        title: 'Fundamentals of AI',
        category: 'Artificial Intelligence - 101',
        description: 'An intro to artificial intelligence and its applications.',
        tags: ['AI', 'Neural Networks', 'Machine Learning'],
        durationFrom: '02:00 PM',
        durationTo: '05:00 PM',
        meetingDate: '2025-06-20T14:00:00Z',
        guestSize: 40,
        bookedUsers: ['uid012', 'uid013'],
        trendScore: 8,
        engagementRate: 9,
        status: RegisterSlotStatus.Upcoming,
        createdAt: '2023-03-02T11:45:00Z',
        updatedAt: '2023-03-08T10:00:00Z',
    },
    {
        _id: 'slot108',
        title: 'Intro to TypeScript',
        category: 'Programming - 102',
        description: 'TypeScript basics and benefits over plain JavaScript.',
        tags: ['TypeScript', 'JavaScript', 'Types'],
        durationFrom: '05:00 PM',
        durationTo: '07:00 PM',
        meetingDate: '2025-04-26T17:00:00Z',
        guestSize: 35,
        bookedUsers: ['uid014', 'uid015'],
        trendScore: 3,
        engagementRate: 6,
        status: RegisterSlotStatus.Completed,
        createdAt: '2023-01-25T09:15:00Z',
        updatedAt: '2023-03-04T13:10:00Z',
    },
    {
        _id: 'slot109',
        title: 'Intro to Web3',
        category: 'Blockchain - 201',
        description: 'Learn about DApps, smart contracts, and tokens.',
        tags: ['Web3', 'Solidity', 'Ethereum'],
        durationFrom: '06:30 PM',
        durationTo: '08:30 PM',
        meetingDate: '2025-05-25T18:30:00Z',
        guestSize: 28,
        bookedUsers: ['uid016', 'uid017'],
        trendScore: 7,
        engagementRate: 8,
        status: RegisterSlotStatus.Upcoming,
        createdAt: '2023-02-17T10:00:00Z',
        updatedAt: '2023-03-12T11:00:00Z',
    },
    {
        _id: 'slot110',
        title: 'Data Analysis with Pandas',
        category: 'Data Science - 104',
        description: 'Learn data manipulation using Python pandas library.',
        tags: ['Python', 'Pandas', 'Data Analysis'],
        durationFrom: '07:00 PM',
        durationTo: '09:00 PM',
        meetingDate: '2025-05-12T19:00:00Z',
        guestSize: 32,
        bookedUsers: ['uid018', 'uid019'],
        trendScore: 5,
        engagementRate: 7,
        status: RegisterSlotStatus.Completed,
        createdAt: '2023-02-20T08:00:00Z',
        updatedAt: '2023-03-09T10:00:00Z',
    }
];


export const dummyNotifications: Notification[] = Array.from({ length: 30 }, (_, i) => {
    function getRandomDateLast30Days() {
        const now = new Date();
        const past = new Date();
        past.setDate(now.getDate() - 30);

        return new Date(past.getTime() + Math.random() * (now.getTime() - past.getTime()));
    }

    const types = ["follow", "new_post", "post_update"];
    const type = types[Math.floor(Math.random() * types.length)] as (NotificationType.FOLLOW | NotificationType.SLOT_CREATED | NotificationType.SLOT_UPDATED);
    const isRead = Math.random() > 0.5;
    const isClicked = Math.random() > 0.5;
    const senderId = `user_${Math.floor(Math.random() * 10000)}`;
    const receiverId = `user_main`;
    const postId = type !== NotificationType.FOLLOW ? `post_${Math.floor(Math.random() * 1000)}` : undefined;
    const slotId = type === NotificationType.SLOT_UPDATED ? `slot_${Math.floor(Math.random() * 1000)}` : undefined;
    const name = `User${i + 1}`;
    const image = `https://img.lovepik.com/png/20231128/3d-illustration-avatar-profile-man-collection-guy-cheerful_716220_wh1200.png`;
    const createdAt = getRandomDateLast30Days().toString(); // Last 30 days

    let message = "";
    if (type === NotificationType.FOLLOW) {
        message = `${name} started following you.`;
    } else if (type === NotificationType.SLOT_CREATED) {
        message = `${name} published a new post.`;
    } else {
        message = `${name} updated a post you follow.`;
    }

    return {
        _id: `notif_${i + 1}`,
        type,
        sender: senderId,
        receiver: receiverId,
        name,
        image,
        post: postId,
        slot: slotId,
        message,
        isRead,
        isClicked,
        isDisable: false,
        createdAt
    };
});


// export const staticFeeds: { [key: string]: NewsFeedTypes } = {
//     "1": {
//         _id: "1",
//         owner: {
//             username: "JohnDoe",
//             image: "https://img.lovepik.com/png/20231128/3d-illustration-avatar-profile-man-collection-guy-cheerful_716220_wh1200.png",
//         },
//         title: "Frontend Weekly Meetup.",
//         description: "Discuss the latest in React, Tailwind and Next.js.",
//         tags: ['CSE', 'Software Engineering'],
//         meetingDate: '2025-04-09T00:00:00.000Z',
//         durationFrom: "01:00 PM",
//         durationTo: "02:00 PM",
//         guestSize: 10,
//         bookedUsers: ["a", "b", "c"],
//         isBooking: false,
//     },
//     "2": {
//         _id: "2",
//         owner: {
//             username: "JaneSmith",
//             image: "https://img.lovepik.com/png/20231128/3d-illustration-avatar-profile-man-collection-guy-cheerful_716220_wh1200.png",
//         },
//         title: "UI/UX Brainstorming",
//         description: "Let’s talk user flows and micro-interactions.",
//         tags: ['CSE', 'Software Engineering', 'LLB', 'Hosting'],
//         meetingDate: '2025-04-09T00:00:00.000Z',
//         durationFrom: "03:00 PM",
//         durationTo: "03:50 PM",
//         guestSize: 5,
//         bookedUsers: ["a"],
//         isBooking: false,
//     },
//     "3": {
//         _id: "3",
//         owner: {
//             username: "CodeWizard",
//             image: "https://img.lovepik.com/png/20231128/3d-illustration-avatar-profile-man-collection-guy-cheerful_716220_wh1200.png",
//         },
//         title: "Backend Best Practices",
//         description: "Diving into scalable architecture and security.",
//         tags: ['CSE', 'Software Engineering', 'cyber Security', 'Crime Branch'],
//         meetingDate: '2025-04-09T00:00:00.000Z',
//         durationFrom: "11:00 PM",
//         durationTo: "02:00 AM",
//         guestSize: 15,
//         bookedUsers: ["a", "b", "c", "d", "e"],
//         isBooking: false,
//     }
// };


export const sampleActivities: ActivityType[] = [
    // 🔮 Upcoming
    { id: '1', title: 'Team Standup Meeting', time: '10:00 AM', type: 'upcoming' },
    { id: '2', title: 'Client Call', time: '2:30 PM', type: 'upcoming' },
    { id: '3', title: 'Project Review', time: '4:00 PM', type: 'upcoming' },
    { id: '8', title: 'One-on-One with Manager', time: '11:30 AM', type: 'upcoming' },
    { id: '9', title: 'UX Workshop', time: '1:00 PM', type: 'upcoming' },
    { id: '10', title: 'Sprint Planning', time: '6:00 PM', type: 'upcoming' },

    // 🕓 Recent
    { id: '4', title: 'Completed: Weekly Sync', time: '9:00 AM', type: 'recent' },
    { id: '5', title: 'Completed: Design Review', time: '11:00 AM', type: 'recent' },
    { id: '11', title: 'Completed: Team Retro', time: '3:30 PM', type: 'recent' },
    { id: '12', title: 'Completed: Code Pairing', time: '12:00 PM', type: 'recent' },
    { id: '13', title: 'Completed: System Demo', time: '5:15 PM', type: 'recent' },

    // ✅ Available Slots
    { id: '6', title: 'Available: 30 min slot', time: '3:00 PM', type: 'available' },
    { id: '7', title: 'Available: 1 hour slot', time: '5:00 PM', type: 'available' },
    { id: '14', title: 'Available: 15 min slot', time: '8:30 AM', type: 'available' },
    { id: '15', title: 'Available: 45 min slot', time: '7:00 PM', type: 'available' },
];


// export const dummyOfBookedSlotsData: BookedSlotsTypes[] = [
//     {
//         _id: "1",
//         creatorId: "1-1",
//         creator: "Sadiqul Islam Shakib",
//         title: "How to become a good speaker",
//         category: "public speaking",
//         description: "Here I will discuss how people often make mistakes in public speaking.",
//         meetingDate: "2025-04-09T00:00:00.000Z",
//         tags: ["Speak", "How to speak fluently?"],
//         durationFrom: "01:00 PM",
//         durationTo: "02:00 PM",
//         status: RegisterSlotStatus.Upcoming,
//     },
//     {
//         _id: "2",
//         creatorId: "1-1",
//         creator: "Sadiqul Islam Shakib",
//         title: "Intro to Web3 & Blockchain",
//         category: "technology",
//         description: "Breaking down the basics of decentralization and why it's the next big thing.",
//         meetingDate: "2025-04-10T00:00:00.000Z",
//         tags: ["Crypto", "Web3", "Blockchain"],
//         durationFrom: "11:00 AM",
//         durationTo: "12:30 PM",
//         status: RegisterSlotStatus.Upcoming,
//     },
//     {
//         _id: "3",
//         creatorId: "1-1",
//         creator: "Sadiqul Islam Shakib",
//         title: "Mastering Time Management",
//         category: "self development",
//         description: "Pro tips on how to manage time when Netflix keeps calling your name.",
//         meetingDate: "2025-04-11T00:00:00.000Z",
//         tags: ["Productivity", "Focus", "Discipline"],
//         durationFrom: "03:00 PM",
//         durationTo: "04:00 PM",
//         status: RegisterSlotStatus.Upcoming,
//     },
//     {
//         _id: "4",
//         creatorId: "1-1",
//         creator: "Sadiqul Islam Shakib",
//         title: "Deep Dive into JavaScript Closures",
//         category: "programming",
//         description: "Closures explained like you’re five... but also a genius.",
//         meetingDate: "2025-04-12T00:00:00.000Z",
//         tags: ["JS", "Closures", "Frontend"],
//         durationFrom: "09:00 AM",
//         durationTo: "10:00 AM",
//         status: RegisterSlotStatus.Upcoming,
//     },
//     {
//         _id: "5",
//         creatorId: "1-1",
//         creator: "Sadiqul Islam Shakib",
//         title: "Building Scalable Backend APIs",
//         category: "backend development",
//         description: "Design patterns and tools to make your APIs future-proof.",
//         meetingDate: "2025-04-13T00:00:00.000Z",
//         tags: ["Node.js", "REST", "Scalability"],
//         durationFrom: "10:00 AM",
//         durationTo: "11:30 AM",
//         status: RegisterSlotStatus.Upcoming,
//     },
//     {
//         _id: "6",
//         creatorId: "1-1",
//         creator: "Sadiqul Islam Shakib",
//         title: "Conquering Interview Anxiety",
//         category: "career",
//         description: "Let’s talk about how to keep your cool when HR stares into your soul.",
//         meetingDate: "2025-04-14T00:00:00.000Z",
//         tags: ["Interview", "Confidence", "Tips"],
//         durationFrom: "02:00 PM",
//         durationTo: "03:00 PM",
//         status: RegisterSlotStatus.Upcoming,
//     },
//     {
//         _id: "7",
//         creatorId: "1-1",
//         creator: "Sadiqul Islam Shakib",
//         title: "Modern CSS Techniques",
//         category: "frontend",
//         description: "Grid, Flexbox, and everything in between that makes your UI pop.",
//         meetingDate: "2025-04-15T00:00:00.000Z",
//         tags: ["CSS3", "Responsive", "Design"],
//         durationFrom: "04:00 PM",
//         durationTo: "05:30 PM",
//         status: RegisterSlotStatus.Upcoming,
//     },
//     {
//         _id: "8",
//         creatorId: "1-1",
//         creator: "Sadiqul Islam Shakib",
//         title: "The Psychology of Habit Formation",
//         category: "self development",
//         description: "How to reprogram your brain for success using science-backed methods.",
//         meetingDate: "2025-04-16T00:00:00.000Z",
//         tags: ["Habits", "Neuroscience", "Routine"],
//         durationFrom: "07:00 PM",
//         durationTo: "08:00 PM",
//         status: RegisterSlotStatus.Upcoming,
//     },
//     {
//         _id: "9",
//         creatorId: "1-1",
//         creator: "Sadiqul Islam Shakib",
//         title: "React Server Components in Depth",
//         category: "programming",
//         description: "What even is this black magic and how do we use it for good?",
//         meetingDate: "2025-04-17T00:00:00.000Z",
//         tags: ["React", "Next.js", "Server Components"],
//         durationFrom: "01:30 PM",
//         durationTo: "03:00 PM",
//         status: RegisterSlotStatus.Upcoming,
//     },
//     {
//         _id: "10",
//         creatorId: "1-1",
//         creator: "Sadiqul Islam Shakib",
//         title: "Building Your Personal Brand Online",
//         category: "branding",
//         description: "Strategies to make your online presence scream 'hire me!'",
//         meetingDate: "2025-04-18T00:00:00.000Z",
//         tags: ["LinkedIn", "Content", "Networking"],
//         durationFrom: "05:00 PM",
//         durationTo: "06:00 PM",
//         status: RegisterSlotStatus.Upcoming,
//     },
//     {
//         _id: "11",
//         creatorId: "1-1",
//         creator: "Sadiqul Islam Shakib",
//         title: "AI in 2025: What's Next?",
//         category: "technology",
//         description: "Trends, predictions, and ethical dilemmas surrounding AI.",
//         meetingDate: "2025-04-19T00:00:00.000Z",
//         tags: ["AI", "ML", "Future"],
//         durationFrom: "11:00 AM",
//         durationTo: "12:00 PM",
//         status: RegisterSlotStatus.Upcoming,
//     },
//     {
//         _id: "12",
//         creatorId: "1-1",
//         creator: "Sadiqul Islam Shakib",
//         title: "Meditation for Coders",
//         category: "wellness",
//         description: "You debug code, now learn to debug your mind.",
//         meetingDate: "2025-04-20T00:00:00.000Z",
//         tags: ["Mindfulness", "Focus", "Balance"],
//         durationFrom: "08:00 AM",
//         durationTo: "08:30 AM",
//         status: RegisterSlotStatus.Upcoming,
//     },
//     {
//         _id: "13",
//         creatorId: "1-1",
//         creator: "Sadiqul Islam Shakib",
//         title: "Intro to Ethical Hacking",
//         category: "cybersecurity",
//         description: "Learn how to break systems... for good reasons.",
//         meetingDate: "2025-04-21T00:00:00.000Z",
//         tags: ["Hacking", "Security", "White Hat"],
//         durationFrom: "06:00 PM",
//         durationTo: "07:30 PM",
//         status: RegisterSlotStatus.Upcoming,
//     }
// ];