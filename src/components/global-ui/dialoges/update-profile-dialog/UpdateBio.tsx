"use client";

import { useAppSelector } from '@/lib/hooks';
import { useForm } from 'react-hook-form';
import React, { useState } from 'react';

type BioForm = {
  username: string;
  title: string;
};

const UpdateBio = () => {
  const { username, title } = useAppSelector(state => state.componentStore.profileUpdateDialog);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BioForm>({
    defaultValues: {
      username: username || '',
      title: title || '',
    },
  });

  const onSubmit = async (data: BioForm) => {
    setLoading(true);

    try {
      // Simulate async API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      console.log("Bio Updated:", data);
      // 🔥 Dispatch Redux action or call API here
    } catch (err) {
      console.error("Update failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 p-3 w-full">
      <div className="flex flex-col gap-1">
        <label htmlFor="username" className="text-sm font-medium text-blue-950">Full Name</label>
        <input
          id="username"
          type="text"
          {...register('username', { required: 'Name is required' })}
          className="bg-blue-100 p-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300 text-blue-950 placeholder:text-gray-400"
          placeholder="Enter your full name"
        />
        {errors.username && <p className="text-sm text-red-500">{errors.username.message}</p>}
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="title" className="text-sm font-medium text-blue-950">Bio / Title</label>
        <input
          id="title"
          type="text"
          {...register('title', { required: 'Bio is required' })}
          className="bg-blue-100 p-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300 text-blue-950 placeholder:text-gray-400"
          placeholder="Your profession, passion, etc."
        />
        {errors.title && <p className="text-sm text-red-500">{errors.title.message}</p>}
      </div>

      <div className="w-full flex justify-end mt-2">
        {
          loading
            ? <span className="animate-spin h-4 w-4 border-t-2 border-blue-700 rounded-full" />
            : <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-200 text-blue-950 font-poppins font-semibold hover:bg-white transition-colors duration-200 ease-in-out shadow rounded"
            >
              Update Bio
            </button>
        }
      </div>
    </form>
  );
};

export default UpdateBio;