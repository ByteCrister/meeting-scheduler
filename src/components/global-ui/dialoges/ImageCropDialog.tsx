"use client";

import { useState, useCallback, Dispatch, SetStateAction } from "react";
import Cropper from "react-easy-crop";
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogFooter,
    AlertDialogAction,
    AlertDialogDescription, // Import the AlertDialogDescription component
} from "@/components/ui/alert-dialog";
import { getCroppedImg } from "@/utils/client/image-handler";

export interface Area {
    width: number;
    height: number;
    x: number;
    y: number;
}

type PropTypes = {
    isOpen: boolean;
    setIsOpen: Dispatch<SetStateAction<boolean>>;
    image: string;
    handleCroppedImage: (croppedImage: string) => void
}

const ImageCropDialog = ({ isOpen, setIsOpen, image, handleCroppedImage }: PropTypes) => {
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

    const onCropComplete = useCallback((_: unknown, areaPixels: Area) => {
        setCroppedAreaPixels(areaPixels);
    }, []);

    const handleSave = async () => {
        if (!image || !croppedAreaPixels) return;

        const croppedImage: string = await getCroppedImg(image, croppedAreaPixels) as string;
        handleCroppedImage(croppedImage);
        setIsOpen(false);
    };


    return (
        <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
            <AlertDialogContent className="w-[100%] border-none outline-none bg-transparent shadow-none">
                <AlertDialogHeader>
                    <AlertDialogTitle className="text-white">Crop Your Image</AlertDialogTitle>
                    {/* Add a description for accessibility */}
                    <AlertDialogDescription className="text-white">
                        Please adjust the crop area by scrolling the mouse.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="relative h-64 w-[100%]">
                    {image && (
                        <Cropper
                            image={image}
                            crop={crop}
                            zoom={zoom}
                            aspect={1}
                            onCropChange={setCrop}
                            onZoomChange={setZoom}
                            onCropComplete={onCropComplete}
                            zoomSpeed={0.1} // Slows down zooming (default is 1)
                            minZoom={1}     // Prevents excessive zooming out
                            maxZoom={3}
                        />
                    )}
                </div>
                <AlertDialogFooter>
                    <AlertDialogAction className="bg-slate-100 text-blue-950 rounded hover:bg-slate-300 cursor-pointer transition-all duration-100 ease-in-out" onClick={handleSave}>Save</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};

export default ImageCropDialog;