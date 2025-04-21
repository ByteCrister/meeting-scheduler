'use client';

import { Pencil } from 'lucide-react'
import Image from 'next/image'
import React, { ChangeEvent } from 'react'
import LoadingSpinner from '../global-ui/ui-component/LoadingSpinner';

type ProfileImageTypes = {
    value: string;
    handleImageClick: () => void;
    handleFileChange: (e: ChangeEvent<HTMLInputElement>) => void;
    isLoading: boolean
    fileInputRef: React.RefObject<HTMLInputElement | null>
}

const ProfileImage = ({ value, handleImageClick, handleFileChange, fileInputRef, isLoading }: ProfileImageTypes) => {
    return (
        <div className="flex justify-center mb-8">
            {/* Invisible File Input */}
            {
                !isLoading && <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept="image/*"
                />
            }

            {/* Clickable Profile Image */}
            <div
                onClick={handleImageClick}
                className="relative w-32 h-32 rounded-full border-4 border-blue-500 shadow-md overflow-hidden group cursor-pointer"
            >
                <Image
                    src={value}
                    alt="Profile"
                    fill
                    className="object-cover"
                />
                <div className={`absolute inset-0  bg-opacity-40 flex items-center justify-center ${isLoading ? 'opacity-100 bg-stone-100' : 'opacity-0 bg-stone-600'} group-hover:opacity-50 transition`}>
                    {isLoading ? <LoadingSpinner /> : <Pencil className="text-white" size={22} />}
                </div>
            </div>
        </div>
    )
}

export default ProfileImage