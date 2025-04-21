'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { setSlotFiledValues } from '@/lib/features/component-state/componentSlice';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import React, { useState } from 'react';

const TagsGuest = () => {
    const { slotDialog } = useAppSelector((state) => state.componentStore);
    const dispatch = useAppDispatch();

    const [newTag, setNewTag] = useState<string>('');
    const [editIndex, setEditIndex] = useState<number | null>(null);
    const [editValue, setEditValue] = useState<string>('');

    const tags = slotDialog.slotField.tags || [];

    const handleAddTag = () => {
        if (!newTag.trim()) return;
        const updatedValues = {
            ...slotDialog.slotField,
            tags: [...tags, newTag.trim()],
        };
        dispatch(setSlotFiledValues(updatedValues));
        setNewTag('');
    };

    const handleDeleteTag = (index: number) => {
        const updatedTags = tags.filter((_, i) => i !== index);
        dispatch(setSlotFiledValues({ ...slotDialog.slotField, tags: updatedTags }));
        if (editIndex === index) {
            setEditIndex(null);
            setEditValue('');
        }
    };

    const handleEditActive = (index: number, currentValue: string) => {
        setEditIndex(index);
        setEditValue(currentValue);
    };

    const handleEditConfirm = (index: number) => {
        if (!editValue.trim()) return;
        const updatedTags = tags.map((tag, i) => (i === index ? editValue.trim() : tag));
        dispatch(setSlotFiledValues({ ...slotDialog.slotField, tags: updatedTags }));
        setEditIndex(null);
        setEditValue('');
    };

    const handleGuestChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const guestSize = parseInt(e.target.value, 10);
        dispatch(setSlotFiledValues({
            ...slotDialog.slotField,
            guestSize: isNaN(guestSize) ? 0 : guestSize,
        }));
    };

    const handleGuestChangeManual = (newValue: number) => {
        const value = Math.max(1, Math.min(50, newValue)); // Clamp value between 1 and 50
        dispatch(setSlotFiledValues({ ...slotDialog.slotField, guestSize: value }));
    };


    return (
        <>
            <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-1">Tags</p>
                <div className="flex gap-2 mb-2">
                    <Input
                        id='add-tag'
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        readOnly={slotDialog.mode === "view"}
                        placeholder="Add tag"
                        className="flex-grow"
                    />
                    <Button
                        id='add-tag-btn'
                        variant="outline"
                        onClick={handleAddTag}
                        disabled={slotDialog.mode === "view"}
                        className='cursor-pointer'
                    >
                        Add
                    </Button>
                </div>

                <div className="flex flex-wrap gap-2">
                    {tags.map((tag, index) => (
                        <div
                            key={index}
                            className="bg-blue-100 text-blue-700 px-3 py-1 text-sm rounded-full flex items-center gap-2"
                        >
                            {editIndex === index ? (
                                <>
                                    <Input
                                        id={`edit-value-${index}`}
                                        value={editValue}
                                        onChange={(e) => setEditValue(e.target.value)}
                                        className="h-6 text-xs px-2 focus:outline-none focus:ring-0 focus:border-transparent border-none shadow-none"
                                    />
                                    <button
                                        onClick={() => handleEditConfirm(index)}
                                        className="text-green-600 text-xs cursor-pointer"
                                    >
                                        ✓
                                    </button>
                                </>
                            ) : (
                                <>
                                    <span
                                        className="cursor-pointer"
                                        onClick={() =>
                                            slotDialog.mode !== "view" &&
                                            handleEditActive(index, tag)
                                        }
                                    >
                                        {tag}
                                    </span>
                                    {slotDialog.mode !== "view" && (
                                        <button
                                            onClick={() => handleDeleteTag(index)}
                                            className="text-red-500 hover:text-red-700 text-xs cursor-pointer"
                                        >
                                            ✕
                                        </button>
                                    )}
                                </>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex items-center gap-2">
                <button
                    type="button"
                    onClick={() => handleGuestChangeManual(slotDialog.slotField.guestSize - 1)}
                    className="px-2 py-1 text-lg rounded bg-gray-200"
                    disabled={slotDialog.slotField.guestSize <= 1 || slotDialog.mode === 'view'}
                >
                    −
                </button>

                <Input
                    type="number"
                    min="1"
                    max="50"
                    value={slotDialog.slotField.guestSize}
                    onChange={handleGuestChange}
                    disabled={slotDialog.mode === 'view'}
                    placeholder="Guest Size"
                    className="w-16 text-center"
                />

                <button
                    type="button"
                    onClick={() => handleGuestChangeManual(slotDialog.slotField.guestSize + 1)}
                    className="px-2 py-1 text-lg rounded bg-gray-200"
                    disabled={slotDialog.slotField.guestSize >= 50 || slotDialog.mode === 'view'}
                >
                    +
                </button>
            </div>

        </>
    );
};

export default TagsGuest;
