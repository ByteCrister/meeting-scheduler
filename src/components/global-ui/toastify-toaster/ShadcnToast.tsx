'use client';

import { toast } from 'sonner';
import { X } from 'lucide-react';
import { useEffect, useState } from 'react';

// Define a toast component
function CustomToast({ id, message }: { id: string | number; message: string }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => setVisible(false), 3000);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <div
      className={`flex justify-between items-center w-full max-w-sm px-5 py-4 rounded shadow-2xl bg-gray-800 text-white
        ${visible ? 'animate-in fade-in slide-in-from-bottom-5' : 'animate-out fade-out slide-out-to-bottom-5'}
      `}
    >
      <span className="text-sm font-medium">{message}</span>
      <button
        onClick={() => toast.dismiss(id)}
        className="ml-4 text-white/70 hover:text-white focus:outline-none"
        aria-label="Close toast"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  );
}

// Wrapper function to call the toast
export default function ShadcnToast(message: string): void {
  toast.custom((id) => <CustomToast id={id} message={message} />);
}
