'use client';

import React, { useState } from 'react'
import { LogOut } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../../ui/tooltip'
import LogoutAlert from './LogoutAlert';

const UserLogout = () => {

  const [isOpen, setIsOpen] = useState<boolean>(false);

  return (
    <TooltipProvider>
      <Tooltip delayDuration={500}>
        <TooltipTrigger asChild>
          <div onClick={() => setIsOpen(true)} className="p-4 border-t border-gray-700 cursor-pointer">
            <div className="flex items-center justify-center gap-3 p-3 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors shadow-inner">
              <p className="text-gray-400">Log out</p>
              <LogOut
                className="w-5 h-5 text-gray-300 hover:text-white transition-colors"
                strokeWidth={2}
              />
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>Click to log out.</p>
        </TooltipContent>
      </Tooltip>

      <LogoutAlert isOpen={isOpen} setIsOpen={setIsOpen} />
    </TooltipProvider>
  )
}

export default UserLogout