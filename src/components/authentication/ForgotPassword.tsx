"use client";

import { Dispatch, JSX, SetStateAction, useState } from "react";
import { useFormik } from 'formik';
import { IoEyeSharp } from "react-icons/io5";
import { IoEyeOffSharp } from "react-icons/io5";
import { Open_Sans } from "next/font/google";
import { userSignInType, userSignUpType } from "@/types/client-types";
import { forgotPassEmailValidation, forgotPassPasswordValidation } from "@/utils/client/others/auth-validation";
import apiService from "@/utils/client/api/api-services";
import ShowToaster from "../global-ui/toastify-toaster/show-toaster";
import LoadingSpinner from "../global-ui/ui-component/LoadingSpinner";

const openSans = Open_Sans({
    weight: '400',
    subsets: ['latin'],
});

// Prop Types
type ForgotPasswordPropTypes = {
    setPageState: Dispatch<SetStateAction<number>>;
    setUserInfo: Dispatch<SetStateAction<userSignUpType | userSignInType | undefined>>;
    isEmailChecked: boolean;
    userInfo: userSignUpType | userSignInType | undefined
};

const ForgotPassword = ({ setPageState, setUserInfo, userInfo, isEmailChecked }: ForgotPasswordPropTypes) => {
    const [isPasswordShow, setIsPasswordShow] = useState<boolean>(false);
    const [isButtonLoading, setIsButtonLoading] = useState<boolean>(false);

    const formik = useFormik({
        initialValues: {
            [isEmailChecked ? "password" : "email"]: ""
        },
        validationSchema: isEmailChecked ? forgotPassPasswordValidation : forgotPassEmailValidation,
        onSubmit: async (values) => {

            if (isEmailChecked) {
                setIsButtonLoading(true);
                if (!isButtonLoading) {
                    const data: { email: string | undefined; password: string; } = { email: userInfo?.email, password: values.password };
                    await forgotPasswordApi(data);
                }
            } else {
                setIsButtonLoading(true);
                if (!isButtonLoading) {
                    const data = { ...values };

                    const updatedUserInfo: userSignInType = {
                        email: values.email,
                        password: userInfo?.password || "",
                    };
                    const resData = await apiService.post(`/api/user/auth-forgot-password`, data);
                    if (resData.success) {
                        setUserInfo(updatedUserInfo);
                        setPageState(1);
                    }
                }
                setIsButtonLoading(false);
            }
        }
    });

    // * Api function for sign In
    const forgotPasswordApi = async (data: { email?: string, password: string }) => {
        const resData = await apiService.post(`/api/auth/user/forgot-password`, data);
        if (resData.success) {
            ShowToaster('Password Updated successfully.', 'success');
            setTimeout(() => {
                window.location.href = '/';
            }, 2000);
        }
    };

    const getValidationString = (field: keyof typeof formik.initialValues): JSX.Element => {
        return formik.touched[field] && formik.errors[field] ? (
            <span className="text-red-500 font-semibold text-sm">
                <sup>*</sup>{formik.errors[field]}
            </span>
        ) : (
            <label htmlFor={field + ""} className="text-slate-500 font-medium text-sm">
                <b className="capitalize">
                    <sup>*</sup>{field}
                </b>
            </label>
        );
    };

    return (
        <form onSubmit={formik.handleSubmit} className="flex flex-col items-center gap-2 w-full">
            {
                isEmailChecked ? <section className="w-full">
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
                            placeholder='new password'
                            value={formik.values.password}
                            className={`w-full bg-white outline-none ${openSans.className} font-bold text-slate-500`} />
                        <button type="button" onClick={(e) => { e.preventDefault(); setIsPasswordShow(prev => !prev); }}>
                            {isPasswordShow ? <IoEyeSharp className="text-slate-500" /> : <IoEyeOffSharp className="text-slate-500" />}
                        </button>
                    </div>
                </section>
                    : <div className="w-full">
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
            }
            <button type='submit' className='w-full bg-slate-500 px-2 py-1 font-semibold rounded text-gray-100 hover:bg-slate-300 hover:text-slate-600 transition duration-300 ease-in-out cursor-pointer'>
                {isButtonLoading ? <LoadingSpinner /> : <span>{isEmailChecked ? "Submit New Password" : "Submit Email"}</span>}
            </button>
        </form>
    )
};
export default ForgotPassword;