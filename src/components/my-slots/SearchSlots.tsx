'use client';

import useSlotSearch from '@/hooks/useSlotSearch';
import { Search } from 'lucide-react';
import React, { useState } from 'react';

const SearchSlots = ({ isFetching }: { isFetching: boolean }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const SlotSearch = useSlotSearch();

    return (
        <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5 pointer-events-none" />
            <input
                type="text"
                placeholder="Search meeting slots..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); SlotSearch(e.target.value); }}
                disabled={isFetching}
                className="w-full pl-12 pr-4 py-2.5 rounded-xl border border-neutral-300 bg-neutral-50 text-neutral-800 placeholder-neutral-400 shadow-[inset_0_1px_2px_rgba(0,0,0,0.06)] focus:shadow-[0_0_0_3px_rgba(0,0,0,0.1)] focus:border-neutral-400 hover:shadow-md transition-all duration-200 ease-in-out"
            />
        </div>
    );
};

export default SearchSlots;
