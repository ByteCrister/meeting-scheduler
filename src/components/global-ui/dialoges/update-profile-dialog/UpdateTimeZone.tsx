"use client";

import React, { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { openSans } from "@/utils/client/fonts";
import { timeZones } from "@/components/auth/auth-component/SelectTimeZone";
import { useAppSelector } from "@/lib/hooks";

type PropTypes = { OnChange: (key: "timeZone" | "profession", value: string) => void; }

const UpdateTimeZone = ({ OnChange }: PropTypes) => {
    const {timeZone} = useAppSelector(state => state.componentStore.profileUpdateDialog);
    const [open, setOpen] = useState(false);
    const [selectedValue, setSelectedValue] = useState(timeZone || '');

    const handleSelect = (newValue: string) => {
        setSelectedValue(newValue);
        OnChange('timeZone', newValue);
        setOpen(false);
    };

    return (
        <div className="w-full flex flex-col">
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger
                    className="font-poppins font-semibold text-ellipsis overflow-hidden whitespace-nowrap"
                    asChild
                >
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className={`w-full bg-blue-100 rounded px-2 py-1 outline-none border-none ${openSans.className} font-bold text-slate-500 justify-between hover:bg-blue-50 hover:text-blue-950 transition-transform duration-150 ease-in-out`}
                    >
                        {selectedValue
                            ? timeZones.find((timeZone) => timeZone.value === selectedValue)
                                ?.label
                            : "Select Time Zone..."}
                        <ChevronsUpDown className="opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className=" w-[60%] md:w-[100%] p-0 bg-white rounded px-2 py-1 outline-none border-none ${openSans.className} font-bold text-slate-500 justify-between">
                    <Command>
                        <CommandInput
                            className="font-poppins font-semibold"
                            placeholder="Search Time Zone..."
                        />
                        <CommandList>
                            <CommandEmpty>No time zone found.</CommandEmpty>
                            <CommandGroup>
                                {timeZones.map((timeZone) => (
                                    <CommandItem
                                        key={timeZone.value}
                                        value={`${timeZone.value} ${timeZone.label}`} // Makes both label and value searchable
                                        onSelect={() => handleSelect(timeZone.value)}
                                    >
                                        {timeZone.label}

                                        <Check
                                            className={cn(
                                                "ml-auto",
                                                selectedValue === timeZone.value
                                                    ? "opacity-100"
                                                    : "opacity-0"
                                            )}
                                        />
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>
        </div>
    );
};

export default UpdateTimeZone;
