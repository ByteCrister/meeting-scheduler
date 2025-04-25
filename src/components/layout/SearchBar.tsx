'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Search } from 'lucide-react';
import { debounce, isEqual } from 'lodash';
import { useRouter } from 'next/navigation';
import { APIGetSearchSuggestion, APIUpdateUsersSearchScore } from '@/utils/client/api/api-search';
import SearchLoading from './SearchLoading';

interface SearchResult {
  _id: string;
  field: 'user' | 'slot';
  name: string;
  matchedString: string;
  href: string;
}

const SearchBar = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  const wrapperRef = useRef<HTMLDivElement>(null);

  const debouncedFetchRef = useRef(
    debounce(async (query: string) => {
      setLoading(true);
      const responseData = await APIGetSearchSuggestion(query);
      if (responseData.success && !isEqual(responseData.data, suggestions)) {
        setSuggestions(responseData.data);
      } else if (!responseData.success) {
        setSuggestions([]);
      }
      setLoading(false);
    }, 400)
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      // eslint-disable-next-line react-hooks/exhaustive-deps
      debouncedFetchRef.current.cancel();
    };
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    setShowSuggestions(true);

    if (query.trim()) {
      debouncedFetchRef.current(query);
    } else {
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = async (href: string, fieldUniqueId: string, field: 'user' | 'slot') => {
    await APIUpdateUsersSearchScore(fieldUniqueId, field);
    setShowSuggestions(false);
    router.push(href);
  };

  return (
    <div className="relative w-full max-w-md mx-auto" ref={wrapperRef}>
      {/* Search input filed */}
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={handleSearch}
          onFocus={() => {
            if (searchQuery.trim()) {
              setShowSuggestions(true);
            }
          }}
          onBlur={(e) => {
            // Only close if the next focused element is NOT inside the wrapper
            if (!wrapperRef.current?.contains(e.relatedTarget as Node)) {
              setShowSuggestions(false);
            }
          }}
          placeholder="Search meetings, users, or topics..."
          className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 bg-white text-sm text-gray-800 placeholder-gray-400 shadow-sm transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
        />

        <div className="absolute inset-y-0 left-4 flex items-center text-gray-400">
          <Search className="w-5 h-5" />
        </div>
      </div>

      {/* Showing suggestion & loading  */}
      {showSuggestions && searchQuery && (
        <div className="absolute z-10 mt-2 w-full bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden animate-fade-in">
          <div className="divide-y divide-gray-100 max-h-64 overflow-auto">
            {loading && (
              <div className="px-4 py-3 text-sm text-gray-500">
                <SearchLoading />
              </div>
            )}
            {!loading && suggestions.length === 0 && (
              <div className="px-4 py-3 text-sm text-gray-500">No suggestions found</div>
            )}
            {!loading &&
              suggestions.map((suggestion) => (
                <button
                  key={suggestion._id}
                  onClick={() => {
                    handleSuggestionClick(suggestion.href, suggestion._id, suggestion.field);
                    setSearchQuery(suggestion.name);
                  }}
                  className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 transition-colors"
                >
                  <div className="font-medium">{suggestion.name}</div>
                  <div className="text-xs text-gray-400">Matched: {suggestion.matchedString}</div>
                </button>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchBar;
