import React, { useEffect, useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Users } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Skeleton } from '../ui/skeleton';
import { registerSlot } from '@/types/client-types';
import apiService from '@/utils/client/api/api-services';
import { useRouter } from 'next/navigation';

const BookUsersPopover = ({ Slot }: { Slot: registerSlot }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [users, setUsers] = useState<{ _id: string; username: string; email: string; image: string }[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      const resData = await apiService.get(`/api/user-slot-register/booked-users`, { slotId: Slot._id });
      if (resData.success) {
        setUsers(resData.data);
      }
      setLoading(false);
    };

    fetchUsers();
  }, [Slot._id]);

  const handleUserClick = (userId: string) => {
    router.push(`/searched-profile?user=${userId}`);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button id="booked-user-popover" className="cursor-pointer">
          <div className="flex items-center text-sm text-gray-500 hover:underline">
            <Users className="w-4 h-4 mr-1" />
            {Slot?.bookedUsers?.length || 0} bookings
          </div>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4">
        <h3 className="text-sm font-semibold mb-2">Booked Users</h3>

        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, idx) => (
              <div key={idx} className="flex items-center space-x-3">
                <Skeleton className="h-10 w-10 bg-neutral-300 rounded-full" />
                <div className="space-y-1 flex-1">
                  <Skeleton className="h-4 w-3/4 bg-neutral-200" />
                  <Skeleton className="h-3 w-1/2 bg-neutral-200" />
                </div>
              </div>
            ))}
          </div>
        ) : users?.length === 0 ? (
          <p className="text-sm text-gray-500">No users have booked this slot yet.</p>
        ) : (
          <div className="space-y-3 max-h-60 overflow-y-auto">
            {users?.map((user) => (
              <div key={user._id} onClick={() => handleUserClick(user._id)} className="flex items-center space-x-3">
                <Avatar>
                  <AvatarImage src={user.image} alt={user.username} />
                  <AvatarFallback>{user.username.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="text-sm group">
                  <p className="font-medium group-hover:underline group-hover:cursor-pointer">{user.username}</p>
                  <p className="text-xs text-gray-500 group-hover:cursor-pointer">{user.email}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};

export default BookUsersPopover;