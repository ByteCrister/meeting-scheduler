"use client";

import { useAppSelector } from '@/lib/hooks'
import React, { useState } from 'react'
import UpdateProfession from './UpdateProfession';
import UpdateTimeZone from './UpdateTimeZone';

const UpdateDetails = () => {
    const { category, timeZone } = useAppSelector(state => state.componentStore.profileUpdateDialog);
    const [fieldValues, setFieldValues] = useState<{ profession: string, timeZone: string }>({ profession: category || '', timeZone: timeZone || '' });
    const [loading, setLoading] = useState<boolean>(false);

    const handleOnChange = (key: 'profession' | 'timeZone', value: string) => {
        setFieldValues(prev => ({ ...prev, [key]: value }));
    };

    // ! implement api
    const handleSubmit = () => {

    }

    return (
        <div className='flex flex-col gap-2'>
            {/* User Profession */}
            <div className="w-full">
                <UpdateProfession
                    OnChange={handleOnChange}
                />
            </div>

            {/* User Time Zone */}
            <div className="w-full">
                <UpdateTimeZone
                    OnChange={handleOnChange}
                />
            </div>
            <div className="w-full flex justify-end mt-2">
                {
                    loading
                        ? <span className="animate-spin h-4 w-4 border-t-2 border-blue-700 rounded-full" />
                        : <button
                            type="submit"
                            onClick={handleSubmit}
                            disabled={loading}
                            className="px-4 py-2 bg-blue-200 text-blue-950 font-poppins font-semibold hover:bg-white transition-colors duration-200 ease-in-out shadow rounded"
                        >
                            Update Details
                        </button>
                }
            </div>
        </div>
    )
}

export default UpdateDetails