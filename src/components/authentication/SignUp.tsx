"use client";

import { Dispatch, JSX, SetStateAction, useState } from "react";
import { useFormik } from 'formik';
import { IoEyeSharp } from "react-icons/io5";
import { IoEyeOffSharp } from "react-icons/io5";
import { signUpValidation } from "@/utils/client/auth-validation";
import apiService from "@/utils/client/api/api-services";
import { userSignInType, userSignUpType } from "@/types/client-types";
import { SelectProfession } from "./auth-component/SelectProfession";
import { handleImage } from "@/utils/client/image-handler";
import { useAppDispatch } from "@/lib/hooks";
import ImageCropDialog from "../global-ui/dialoges/ImageCropDialog";
import Image from "next/image";
import { SelectTimeZone } from "./auth-component/SelectTimeZone";
import { Open_Sans } from "next/font/google";
import LoadingSpinner from "../global-ui/ui-component/LoadingSpinner";

const openSans = Open_Sans({
    weight: '400',
    subsets: ['latin'],
});

// Prop Types
type SignUpProps = {
    setPageState: Dispatch<SetStateAction<number>>;
    setUserInfo: Dispatch<SetStateAction<userSignUpType | userSignInType | undefined>>;
};
const SignUp = ({ setPageState, setUserInfo }: SignUpProps) => {
    const [isPasswordShow, setIsPasswordShow] = useState<boolean>(false);
    const [isButtonLoading, setIsButtonLoading] = useState<boolean>(false);
    const [isImgRendering, setIsImageRendering] = useState<boolean>(false);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isOpen, setIsOpen] = useState(false);

    const dispatch = useAppDispatch();

    const formik = useFormik({
        initialValues: {
            username: '',
            profession: '',
            image: '',
            timeZone: '',
            email: '',
            password: ''
        },
        validationSchema: signUpValidation,
        onSubmit: async (values) => {
            // console.log({...values});
            const data = { ...values };
            if (!isButtonLoading) {
                setIsButtonLoading(true);
                const resData = await apiService.post(`/api/auth/user/auth-signup`, data);
                if (resData.success) {
                    setUserInfo({ ...values })
                    setTimeout(() => setPageState(1), 1);
                }
            }
            setIsButtonLoading(false);
        },
    });

    // * Default field | Error field values
    const getValidationString = (field: keyof typeof formik.initialValues): JSX.Element => {
        return formik.touched[field] && formik.errors[field] ? (
            <span className="text-red-500 font-semibold text-sm">
                <sup>*</sup>{formik.errors[field]}
            </span>
        ) : (
            <label htmlFor={field} className="text-slate-500 font-medium text-sm">
                <b className="capitalize">
                    <sup>*</sup>{field.replace('_', " ")}
                </b>
            </label>
        );
    };

    // * Handle file selection, validation & trigger cropping
    const onFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        setIsImageRendering(true);
        const base64Image = await handleImage(event, dispatch); // * return base64 string
        if (base64Image) {
            setImagePreview(base64Image);
            setIsOpen(true);
        }
        setIsImageRendering(false);
    };

    const handleCroppedImage = (croppedImage: string) => {
        formik.setFieldValue('image', croppedImage);
    }


    return (
        <form onSubmit={formik.handleSubmit} className={`flex flex-col items-center gap-2 w-full`}>
            {/* User Name */}
            <section className="flex md:justify-between md:flex-row flex-col gap-2 w-full">
                <div className="w-full">
                    {getValidationString('username')}
                    <br />
                    <input
                        type='text'
                        name="username"
                        id="username"
                        required
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.username}
                        placeholder='User Name'
                        className={`w-full bg-white rounded px-2 py-1 outline-none ${openSans.className} font-bold text-slate-500`}
                    ></input>
                </div>
            </section>

            {/* User Image */}
            <section className="w-full flex flex-col">
                {getValidationString('image')}
                {
                    isImgRendering
                        ? <div className="bg-white w-full text-center px-2 py-1 rounded"><LoadingSpinner /></div>
                        : <div className="w-full flex justify-between items-center">
                            {/* File Input styled as a button */}
                            <label htmlFor="image" className="w-full text-xs p-1 cursor-pointer text-gray-900 border border-gray-300 rounded bg-gray-100 hover:bg-gray-200 flex justify-center items-center dark:text-gray-400 dark:bg-gray-700 dark:border-gray-600 dark:hover:bg-gray-600 focus:outline-none">
                                <span className="text-sm font-medium text-gray-700">Upload Image</span>
                            </label>
                            <input
                                type="file"
                                id="image"
                                name="image"
                                accept="image/*"
                                onChange={onFileChange}
                                className="hidden"  // Hide the file input, only show the label as the button
                            />
                            {/* Image Preview */}
                            {formik.values.image && formik.values.image.length !== 0 && (
                                <div className="ml-4">
                                    <div className="relative w-14 h-14 overflow-hidden">
                                        <Image
                                            src={formik.values.image}
                                            height={56}
                                            width={56}
                                            alt="Profile Image"
                                            className="object-cover"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                }
            </section>

            {/* User Profession */}
            <div className="w-full">
                <SelectProfession
                    OnChange={formik.handleChange}
                    Value={formik.values.profession}
                    GetValidationString={getValidationString}
                />
            </div>

            {/* User Time Zone */}
            <div className="w-full">
                <SelectTimeZone
                    OnChange={formik.handleChange}
                    Value={formik.values.timeZone}
                    GetValidationString={getValidationString}
                />
            </div>

            {/* User Email */}
            <div className="w-full">
                {getValidationString('email')}
                <br />
                <input
                    type='email'
                    name="email"
                    id="email"
                    required
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.email}
                    placeholder='email'
                    className={`w-full bg-white rounded px-2 py-1 outline-none ${openSans.className} font-bold text-slate-500`}
                ></input>
            </div>

            {/* User Password */}
            <section className="w-full">
                {getValidationString('password')}
                <br />
                <div className={`flex justify-between bg-white rounded px-2 py-1 outline-none ${openSans.className} font-bold text-slate-500`}>
                    <input
                        type={isPasswordShow ? 'text' : 'password'}
                        name="password"
                        id="password"
                        required
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        placeholder='password'
                        value={formik.values.password}
                        className={`w-full bg-white outline-none ${openSans.className} font-bold text-slate-500`} />
                    {/* Show Password Button */}
                    <button type="button" onClick={(e) => { e.preventDefault(); setIsPasswordShow(prev => !prev); }}>
                        {isPasswordShow ? <IoEyeSharp className="text-slate-500" /> : <IoEyeOffSharp className="text-slate-500" />}
                    </button>
                </div>
            </section>

            {/* Form submit Button */}
            <button type='submit' className='w-full bg-slate-500 px-2 py-1 font-semibold rounded text-gray-100 hover:bg-slate-300 hover:text-slate-600 transition duration-300 ease-in-out'>
                {isButtonLoading ? <LoadingSpinner /> : <span>Sign Up</span>}
            </button>

            <ImageCropDialog
                isOpen={isOpen}
                setIsOpen={setIsOpen}
                image={imagePreview!}
                handleCroppedImage={handleCroppedImage}
            />
        </form>
    )
};

export default SignUp;