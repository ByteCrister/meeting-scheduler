"use client";

import { useTimer } from "react-timer-hook";
import { userSignInType, userSignUpType } from "@/types/client-types";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import ShowToaster from "../global-ui/toastify-toaster/show-toaster";
import apiService from "@/utils/client/api/api-services";

type AuthenticateOTPPropTypes = {
    userInfo: userSignUpType | userSignInType | undefined;
    setIsEmailChecked: Dispatch<SetStateAction<boolean>>;
    setCurrentAuthPage: Dispatch<SetStateAction<0 | 2 | 1>>;
    setPageState: Dispatch<SetStateAction<number>>
};

const AuthenticateOTP = ({ userInfo, setIsEmailChecked, setCurrentAuthPage, setPageState }: AuthenticateOTPPropTypes) => {
    const [otp, setOtp] = useState<string>("");
    const [enteredOtp, setEnteredOtp] = useState<string[]>(Array(6).fill(""));
    const [currOtpBox, setCurrOtpBox] = useState<number>(0);
    const [isOtpExpired, setIsOtpExpired] = useState<boolean>(false);
    const [isOTPSend, setIsOTPSend] = useState<boolean>(false);

    // Set the expiry time (3 minutes from now)
    const time = new Date();
    time.setSeconds(time.getSeconds() + 180);

    const { seconds, minutes, restart } = useTimer({
        expiryTimestamp: time,
        onExpire: () => {
            setIsOtpExpired(true);
            ShowToaster("OTP expired. Please request a new one.", 'error');
        }
    });

    const handleGenerateOtp = async () => {
        setIsOTPSend(true);
        const URI = `/api/auth/user/user-otp?email=${userInfo?.email}`;
        const responseData = await apiService.get(URI)
        if (responseData.success) {
            setOtp(responseData.data);
            ShowToaster("OTP is sent to your email.", "success");
        }

        // Reset timer
        // Restart the timer
        const newTime = new Date();
        newTime.setSeconds(newTime.getSeconds() + 180);
        restart(newTime);
        setIsOtpExpired(false);
    };

    useEffect(() => {
        if (!userInfo?.email || isOTPSend) return; // Prevent duplicate requests
        setIsOTPSend(true);
        handleGenerateOtp();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userInfo]); // Only trigger when userInfo changes



    // * Api function for sign Up
    const signUpApi = async () => {
        const resData = await apiService.post(`/api/auth/user/signup`, { ...userInfo });
        if (resData.success) {
            ShowToaster('Successfully registered.', 'success');
            setTimeout(() => {
                window.location.href = '/';
            }, 2000);

        }
    };


    // * Handle input change for OTP boxes
    const handleOtpChange = (value: string, index: number) => {
        if (/^\d$/.test(value) && !isOtpExpired) {
            setEnteredOtp((prevOtp) => {
                const newOtp = [...prevOtp];
                newOtp[index] = value;
                return newOtp;
            });

            if (index < 5) setCurrOtpBox(index + 1);
        }
    };


    // * Handle backspace for OTP boxes
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
        if (e.key === "Backspace" && !isOtpExpired) {
            e.preventDefault();
            const newOtp = [...enteredOtp];

            if (enteredOtp[index] !== "") {
                newOtp[index] = "";
                setEnteredOtp(newOtp);
            } else if (index > 0) {
                newOtp[index - 1] = "";
                setEnteredOtp(newOtp);
                setCurrOtpBox(index - 1);
            }
        }
    };

    // * Render OTP input boxes
    const GetOtpBoxes = () => {
        return (
            <div className="flex gap-2 justify-center">
                {Array.from({ length: 6 }).map((_, index) => (
                    <input
                        key={index}
                        type="text"
                        id={`input-id-${index}`}
                        name={`input-name-${index}`}
                        value={enteredOtp[index]}
                        maxLength={1}
                        autoFocus={currOtpBox === index}
                        onChange={(e) => handleOtpChange(e.target.value, index)}
                        onKeyDown={(e) => handleKeyDown(e, index)}
                        disabled={isOtpExpired} // Disable input if OTP is expired
                        className="bg-slate-300 font-bold outline-gray-500 text-slate-700 text-xl text-center rounded w-10 h-10"
                    />
                ))}
            </div>
        );
    };

    // * OTP verification logic
    const verifyOtp = async () => {
        const enteredOptStr = enteredOtp.join("");
        if (otp.trim().length !== 0 && enteredOptStr === otp) {
            ShowToaster("OTP verified successfully!", "success");
            if (userInfo && "username" in userInfo) {
                signUpApi();
            } else {
                setIsEmailChecked(true);
                setCurrentAuthPage(2);
                setPageState(0);
            }

        } else {
            ShowToaster("OTP is not matched. Please check again.", "error",);
        }
    };

    return (
        <section className="w-full h-screen flex flex-col gap-3 justify-center items-center">
            <h1 className="text-lg font-semibold text-slate-600 font-poppins text-center">
                Enter the OTP that has been sent to your Email.
            </h1>
            <GetOtpBoxes />
            <div className="text-center text-slate-600 font-poppins mt-4">
                <p>{minutes}:{seconds < 10 ? `0${seconds}` : seconds}</p>
            </div>
            {
                !isOtpExpired ? <button
                    onClick={() => verifyOtp()}
                    disabled={isOtpExpired}
                    className="px-2 py-1 bg-slate-600 font-semibold font-poppins text-white rounded hover:bg-slate-300 hover:text-slate-950 transition duration-300 ease-in-out cursor-pointer"
                >
                    Verify OTP
                </button>
                    : <button
                        onClick={() => handleGenerateOtp()}
                        className="px-2 py-1 bg-slate-600 font-semibold font-poppins text-white rounded hover:bg-slate-300 hover:text-slate-950 transition duration-300 ease-in-out cursor-pointer"
                    >
                        Resend OTP
                    </button>
            }
        </section>
    );
};

export default AuthenticateOTP;