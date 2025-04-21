'use client';

import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { setSlotFiledValues } from '@/lib/features/component-state/componentSlice';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import React, { useEffect } from 'react'

const TitleCategory = () => {
  const { slotDialog } = useAppSelector(state => state.componentStore);
  const { title, category, description } = slotDialog.slotField;
  const dispatch = useAppDispatch();

  const isReadOnly = slotDialog.mode === 'view';

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleChange = (e: React.ChangeEvent<(HTMLInputElement | HTMLTextAreaElement)>) => {
    const { name, value } = e.target;
    const updatedFieldValues = {
      ...slotDialog.slotField,
      [name]: value
    };
    dispatch(setSlotFiledValues(updatedFieldValues));
  };

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" >
        <Input
          name="title"
          id="title"
          value={title}
          readOnly={isReadOnly}
          onChange={handleChange}
          placeholder="Title"
        />
        <Input
          name="category"
          id="category"
          value={category}
          readOnly={isReadOnly}
          onChange={handleChange}
          placeholder="Category"
        />
      </div >
      <Textarea
        name="description"
        id="description"
        readOnly={isReadOnly}
        value={description}
        onChange={handleChange}
        placeholder="Description"
      />
    </>
  )
}

export default TitleCategory