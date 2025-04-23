"use client";

import { JSX, useState } from "react";
import { useFormik } from 'formik';
import { Open_Sans } from "next/font/google";
import { signInValidation } from "@/utils/client/auth-validation";
import ShowToaster from "../global-ui/toastify-toaster/show-toaster";
import apiService from "@/utils/client/api/api-services";
import LoadingSpinner from "../global-ui/ui-component/LoadingSpinner";
import { IoEyeOffSharp, IoEyeSharp } from "react-icons/io5";

const openSans = Open_Sans({
    weight: '400',
    subsets: ['latin'],
});

const SignIn = () => {
    const [isPasswordShow, setIsPasswordShow] = useState<boolean>(false);
    const [isButtonLoading, setIsButtonLoading] = useState<boolean>(false);

    const formik = useFormik({
        initialValues: {
            email: '',
            password: ''
        },
        validationSchema: signInValidation,
        onSubmit: async (values) => {
            const data = { ...values };
            if (!isButtonLoading) {
                setIsButtonLoading(true);
                const resData = await apiService.post(`/api/auth/user/signin`, data);
                if (resData.success) {
                    ShowToaster("Successfully signed in.", "success");
                    setTimeout(() => {
                        window.location.href = '/';
                    }, 2000);
                }
            }
            setIsButtonLoading(false);
        },
    });

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

    return (
        <form onSubmit={formik.handleSubmit} className="flex flex-col items-center gap-2 w-full">
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
                    <button type="button" onClick={(e) => { e.preventDefault(); setIsPasswordShow(prev => !prev); }}>
                        {isPasswordShow ? <IoEyeSharp className="text-slate-500" /> : <IoEyeOffSharp className="text-slate-500" />}
                    </button>
                </div>
            </section>
            <button type='submit' className='w-full bg-slate-500 px-2 py-1 font-semibold rounded text-gray-100 hover:bg-slate-300 hover:text-slate-600 transition duration-300 ease-in-out cursor-pointer'>
                {isButtonLoading ? <LoadingSpinner /> : <span>Sign In</span>}
            </button>
        </form>
    )
}

export default SignIn;