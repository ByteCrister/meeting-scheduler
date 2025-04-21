"use client";

import { Area } from "@/components/global-ui/dialoges/ImageCropDialog";
import { toggleAlertDialog } from "@/lib/features/component-state/componentSlice";
import { reduxUsersInitialState, initialComponentStateTypes } from "@/types/client-types";
import { ThunkDispatch, UnknownAction, Dispatch } from "@reduxjs/toolkit";

/*
    * Check Image Extension
    * Check Image Size < 2
    * Call base64 converter & set converted Image string
*/
export const handleImage = async (event: React.ChangeEvent<HTMLInputElement>, dispatch: ThunkDispatch<{ userStore: reduxUsersInitialState; componentStore: initialComponentStateTypes; }, undefined, UnknownAction> & Dispatch<UnknownAction>) => {
    const file = event.target.files?.[0];
    if (!file) {
        console.log("No file selected");
        return;
    }

    // Valid image MIME types
    const validImageTypes = [
        "image/png",
        "image/jpeg",
        "image/jpg",
        "image/gif",
        "image/bmp",
        "image/webp",
        "image/tiff",
    ];

    // Check if the file type is an image
    if (!validImageTypes.includes(file.type)) {
        console.log('Invalid file type.');
        dispatch(toggleAlertDialog({ isOpen: true, title: 'File is not an Image!', description: `You'r given file is not an image. So please give a valid image file.` }));
        return;
    }

    // Check file size (2MB = 2 * 1024 * 1024 bytes)
    if (file.size > 2 * 1024 * 1024) {
        console.log('Greater then 2MB.');
        dispatch(toggleAlertDialog({ isOpen: true, title: 'File size exceed 2MB!', description: `The file size have to be under 2MB. Please chose another image.` }));
        return;
    }

    // Compress & Convert to Base64
    try {
        const base64Image = await compressAndConvertToBase64(file);
        return base64Image;
    } catch (error) {
        console.error("Image processing failed:", error);
        dispatch(toggleAlertDialog({ isOpen: true, title: 'File size exceed 2MB!', description: `The file size have to be under 2MB. Please chose another image.` }));
    }
};


export const compressAndConvertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;
            img.onload = () => {
                const canvas = document.createElement("canvas");
                const ctx = canvas.getContext("2d");
                if (!ctx) return reject("Canvas context not supported");

                const MAX_SIZE = 50 * 1024; // 50KB target size
                let quality = 0.7; // Initial quality
                let attempts = 0; // Safeguard to prevent infinite recursion

                // Set canvas size and draw image
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);

                // Get the MIME type (image/jpeg or image/png, etc.)
                const mimeType = file.type; // e.g., "image/jpeg", "image/png"

                // Compress and convert to base64 with the correct MIME type
                const compressImage = () => {
                    const compressedBase64 = canvas.toDataURL(mimeType, quality);
                    const byteLength = atob(compressedBase64.split(",")[1]).length;

                    // Only continue compressing if size exceeds MAX_SIZE and quality is still reasonable
                    if (byteLength > MAX_SIZE && quality > 0.1 && attempts < 10) {
                        attempts++;
                        quality -= 0.05; // Decrease quality
                        compressImage(); // Recursively compress the image
                    } else {
                        resolve(compressedBase64); // Return base64 with MIME type
                    }
                };

                compressImage(); // Start the compression process
            };
            img.onerror = (error) => reject(error);
        };
        reader.onerror = (error) => reject(error);

        reader.readAsDataURL(file);
    });
};


export const getCroppedImg = (imageSrc: string, cropAreaPixels: Area): Promise<string> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = imageSrc;
        img.crossOrigin = "anonymous";
        img.onload = () => {
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");
            if (!ctx) return reject("Canvas not supported");

            canvas.width = cropAreaPixels.width;
            canvas.height = cropAreaPixels.height;
            ctx.drawImage(
                img,
                cropAreaPixels.x,
                cropAreaPixels.y,
                cropAreaPixels.width,
                cropAreaPixels.height,
                0,
                0,
                cropAreaPixels.width,
                cropAreaPixels.height
            );

            // Extract MIME type from the imageSrc if available
            const mimeType = imageSrc.split(";")[0].split(":")[1] || "image/png";  // Default to PNG if not found

            // Return the cropped image in the same format as the original
            resolve(canvas.toDataURL(mimeType, 0.9)); // Convert to base64 with the same MIME type
        };
        img.onerror = (error) => reject(error);
    });
};