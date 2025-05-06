import ConnectDB from '@/config/ConnectDB';
import { NextResponse } from 'next/server';

// Only allow these collection names
const ALLOWED_COLLECTIONS = ['users', 'videocalls', 'slots', 'notifications'];

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const collection = searchParams.get('collection');

    if (!collection || !ALLOWED_COLLECTIONS.includes(collection)) {
        return NextResponse.json(
            { error: 'Invalid or missing collection name.' },
            { status: 400 }
        );
    }

    try {
        const db = await ConnectDB();
        const result = await db.collection(collection).deleteMany({});
        return NextResponse.json({
            message: `Cleared ${result.deletedCount} documents from "${collection}" collection.`,
        });
    } catch (error) {
        console.error('Error clearing collection:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
