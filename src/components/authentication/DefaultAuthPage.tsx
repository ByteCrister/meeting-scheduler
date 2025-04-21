"use client";

import { JSX, useState } from "react";
import React from "react";
import { userSignInType, userSignUpType } from "@/types/client-types";
import SignUp from "./SignUp";
import ForgotPassword from "./ForgotPassword";
import SignIn from "./SignIn";
import AuthenticateOTP from "./AuthenticateOTP";
import BackgroundLayer from "../global-ui/ui-component/BackgroundLayer";

// Styling for buttons to indicate active state
const buttonStyle = " font-semibold px-2 py-1 md:px-4 md:py-2 rounded-2xl md:rounded-full transition-all duration-300";

const DefaultAuthPage = () => {
    const [pageState, setPageState] = useState<number>(0);
    const [currentAuthPage, setCurrentAuthPage] = useState<0 | 1 | 2>(0);
    const [userInfo, setUserInfo] = useState<userSignUpType | userSignInType>();
    // * State for Forgot Password Component
    const [isEmailChecked, setIsEmailChecked] = useState<boolean>(false);

    const handleButtonClick = (page: 0 | 1 | 2) => {
        setCurrentAuthPage(page);
    };

    const currentPage = {
        0: <SignIn />,
        1: <SignUp setPageState={setPageState} setUserInfo={setUserInfo} />,
        2: <ForgotPassword setPageState={setPageState} setUserInfo={setUserInfo} userInfo={userInfo} isEmailChecked={isEmailChecked} />
    };

    const getButtons: () => JSX.Element = () => {
        return <div className="flex justify-center space-x-4 mb-4">
            {
                [{ title: 'Sign Up', page: 1 }, { title: 'Sign In', page: 0 }, { title: 'Forgot Password', page: 2 }].map((item, index) => {
                    return <button
                        key={index}
                        className={`${buttonStyle} ${currentAuthPage === item.page ? " bg-slate-400 text-white" : "bg-zinc-200 text-slate-400"} cursor-pointer`}
                        onClick={() => handleButtonClick(item.page as 0 | 1 | 2)}
                    >
                        {item.title}
                    </button>
                })
            }
        </div>
    };

    return (
        // ! pageState: 0 for main registration form
        pageState === 0 ?
            // * Main container
            <div className="flex justify-center items-center h-screen bg-gray-900">
                <BackgroundLayer />
                <section className="w-[80%] md:w-full max-w-md relative bg-cover bg-center backdrop-blur-md p-8 rounded-xl shadow-2xl bg-transparent">
                    {/* Background layer */}
                    <div className="absolute inset-0 bg-slate-400 opacity-15 rounded-xl -z-10"></div>
                    {/* Button section */}
                    {getButtons()}
                    {/* Transition section for dynamic content */}
                    <div className="transition-all duration-500 ease-in-out">
                        {currentPage[currentAuthPage]}
                    </div>
                </section>
            </div>
            // ! pageState: except 0 after authenticating email an otp will be send on that email
            : <AuthenticateOTP userInfo={userInfo} setIsEmailChecked={setIsEmailChecked} setPageState={setPageState} setCurrentAuthPage={setCurrentAuthPage} />
    );
};

export default React.memo(DefaultAuthPage);