"use client";

import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { handleImage } from "@/utils/client/others/image-handler";
import Image from "next/image";
import React, { useState } from "react";
import ImageCropDialog from "../ImageCropDialog";

const UpdateImage = () => {
    const { profileUpdateDialog } = useAppSelector(state => state.componentStore);
    const [isOpen, setIsOpen] = useState(false);
    const [loadingState, setLoadingState] = useState<{
        isApiLoading: boolean;
        isImgLoading: boolean;
    }>({ isApiLoading: false, isImgLoading: false });
    const [imagePreview, setImagePreview] = useState<string | null>(profileUpdateDialog.image);
    const dispatch = useAppDispatch();

    // * Handle file selection, validation & trigger cropping
    const onFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        setLoadingState(prev => ({ ...prev, isImgLoading: true }));
        const base64Image = await handleImage(event, dispatch); // * return base64 string
        if (base64Image) {
            setImagePreview(base64Image);
            setIsOpen(true);
        }
        setLoadingState(prev => ({ ...prev, isImgLoading: false }));
    };

    const handleCroppedImage = (croppedImage: string) => {
        setImagePreview(croppedImage);
    };

    // ! implement api
    const handleUpdateImage = () => {

    };
    return (
        <>
            {
                loadingState.isImgLoading
                    ? <span className="loading loading-spinner loading-md"></span>
                    : <div className="w-full flex justify-between items-center">
                        {/* File Input styled as a button */}
                        <label
                            htmlFor="image"
                            className="w-full text-xs p-1 cursor-pointer text-gray-900 border border-gray-300 rounded bg-gray-100 hover:bg-gray-200 flex justify-center items-center dark:text-gray-400 dark:bg-gray-700 dark:border-gray-600 dark:hover:bg-gray-600 focus:outline-none"
                        >
                            <span className="text-sm font-medium text-gray-700">Upload Image</span>
                        </label>
                        <input
                            type="file"
                            id="image"
                            name="image"
                            accept="image/*"
                            onChange={onFileChange}
                            className="hidden" // Hide the file input, only show the label as the button
                        />
                        {/* Image Preview */}
                        <div className="ml-4">
                            <div className="relative w-14 h-14 overflow-hidden">
                                <Image
                                    src={imagePreview || ''}
                                    height={56}
                                    width={56}
                                    alt="Profile Image"
                                    className="object-cover"
                                />
                            </div>
                        </div>
                    </div>
            }

            {
                loadingState.isApiLoading
                    ? <span className="animate-spin h-4 w-4 border-t-2 border-blue-700 rounded-full" />
                    : <div className="w-full flex justify-end mt-4">
                        <button
                            type="submit"
                            onClick={handleUpdateImage}
                            className="px-4 py-2 bg-blue-200 text-blue-950 font-poppins font-semibold hover:bg-white transition-colors duration-200 ease-in-out shadow rounded"
                        >
                            Update Image
                        </button>
                    </div>
            }

            {
                isOpen && (
                    <ImageCropDialog
                        isOpen={isOpen}
                        setIsOpen={setIsOpen}
                        image={imagePreview!}
                        handleCroppedImage={handleCroppedImage}
                    />
                )
            }
        </>
    );
};

export default UpdateImage;
