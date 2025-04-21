'use client';

import React, { useRef, useState } from 'react';
import EditableField from './EditableField';
import StatCard from './StatCard';
import ProfileImage from './ProfileImage';
import { useAppSelector } from '@/lib/hooks';
import { handleImage } from '@/utils/client/image-handler';
import ImageCropDialog from '../global-ui/dialoges/ImageCropDialog';
import apiService from '@/utils/client/api/api-services';
import ShowToaster from '../global-ui/toastify-toaster/show-toaster';
import LoadingUIBlackBullfrog from '../global-ui/ui-component/LoadingUIBlackBullfrog';
import { useDispatch } from 'react-redux';
import { updateUserInfo } from '@/lib/features/users/userSlice';

// interface ProfileData {
//   username: string;
//   title: string;
//   timeZone: string;
//   image: string;
//   profession: string;
//   followers: number;
//   following: number;
//   bookedSlots: number;
//   registeredSlots: number;
// }

type LoadingButtonStateType = {
  username: boolean;
  title: boolean;
  timeZone: boolean;
  profession: boolean;
  image: boolean;
}
const LoadingButtonState: LoadingButtonStateType = {
  'username': false,
  'title': false,
  'timeZone': false,
  'profession': false,
  'image': false,
}

// const initialProfileData: ProfileData = {
//   username: 'John Doe',
//   title: 'Senior Software Engineer',
//   timeZone: 'UTC+5:30',
//   profession: 'Software Engineer.',
//   image: 'https://i.pravatar.cc/300',
//   followers: 245,
//   following: 189,
//   bookedSlots: 156,
//   registeredSlots: 89,
// };



export default function ProfileComponent() {
  const { user } = useAppSelector(state => state.userStore);
  const dispatch = useDispatch();

  const [isLoading, setIsLoading] = useState<LoadingButtonStateType>(LoadingButtonState)

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isOpen, setIsOpen] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(user?.image || '');

  if (!user) return <LoadingUIBlackBullfrog />

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  // * Handle file selection, validation & trigger cropping
  const onFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    handleLoadingChange('image', true);
    const base64Image = await handleImage(event, dispatch); // * return base64 string
    if (base64Image) {
      setImagePreview(base64Image);
      setIsOpen(true);
    }
    handleLoadingChange('image', false);
  };

  const handleCroppedImage = (croppedImage: string) => {
    setImagePreview(croppedImage);
  };


  // * Update fields
  const updateProfileField = async (filed: ('title' | 'timeZone' | 'username' | 'image' | 'profession'), value: string) => {
    const responseData = await apiService.put(`/api/auth/status?field=${filed}&value=${value}`);
    if (responseData.success) {
      dispatch(updateUserInfo({ field: filed, updatedValue: value }));
      ShowToaster(responseData.message, 'success');
    }
  };

  // * Change button loading
  const handleLoadingChange = (filed: ('title' | 'timeZone' | 'username' | 'image' | 'profession'), isLoading: boolean) => {
    setIsLoading(prev => ({
      ...prev,
      [filed]: isLoading
    }));
  };

  return (
    <>
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-gray-50 rounded-2xl shadow-lg p-8">
          {/* Profile Image */}
          <ProfileImage
            value={imagePreview!}
            handleImageClick={handleImageClick}
            handleFileChange={onFileChange}
            isLoading={isLoading.image}
            fileInputRef={fileInputRef}
          />

          {/* Editable Fields & Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <EditableField
                label="Name"
                value={user.username}
                isLoading={isLoading.username}
                handleLoadingChange={(isLoading: boolean) => handleLoadingChange('username', isLoading)}
                onUpdate={(value) => updateProfileField('username', value)}
              />
              <EditableField
                label="Title"
                value={user.title}
                isLoading={isLoading.title}
                handleLoadingChange={(isLoading: boolean) => handleLoadingChange('title', isLoading)}
                onUpdate={(value) => updateProfileField('title', value)}
              />
              <EditableField
                label="Profession"
                value={user.profession}
                isLoading={isLoading.profession}
                handleLoadingChange={(isLoading: boolean) => handleLoadingChange('profession', isLoading)}
                onUpdate={(value) => updateProfileField('profession', value)}
              />
              <EditableField
                label="Timezone"
                value={user.timeZone}
                isLoading={isLoading.timeZone}
                handleLoadingChange={(isLoading: boolean) => handleLoadingChange('timeZone', isLoading)}
                onUpdate={(value) => updateProfileField('timeZone', value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <StatCard title="Followers" value={user.followers.length} />
              <StatCard title="Following" value={user.following.length} />
              <StatCard title="Booked Meetings" value={user.bookedSlots.length} />
              <StatCard title="Created Slots" value={user.registeredSlots.length} />
            </div>
          </div>
        </div>
      </div>

      <ImageCropDialog
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        image={imagePreview!}
        handleCroppedImage={handleCroppedImage}
      />
    </>
  );
}
