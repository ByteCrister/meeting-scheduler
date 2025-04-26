"use client";

import { jobs } from "@/components/auth/auth-component/SelectProfession";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useAppSelector } from "@/lib/hooks";
import { cn } from "@/lib/utils";
import { openSans } from "@/utils/client/others/fonts";
import { Check, ChevronsUpDown } from "lucide-react";
import { useState } from "react";

type PropTypes = { OnChange: (key: "profession" | "timeZone", value: string) => void }

const UpdateProfession = ({ OnChange }: PropTypes) => {
    const { category } = useAppSelector(state => state.componentStore.profileUpdateDialog);
    const [open, setOpen] = useState(false);
    const [selectedValue, setSelectedValue] = useState(category || '');

    const handleSelect = (newValue: string) => {
        setSelectedValue(newValue);
        OnChange('profession', newValue);
        setOpen(false);
    };
    return (
        <div className="w-full flex flex-col">
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        role="combobox"
                        aria-expanded={open}
                        className={`w-full bg-blue-100 rounded px-2 py-1 outline-none border-none ${openSans.className} font-bold text-slate-500 justify-between hover:bg-blue-50 hover:text-blue-950 transition-transform duration-150 ease-in-out`}
                    >
                        {selectedValue
                            ? jobs.find((job) => job.value === selectedValue)?.label
                            : "Select Profession..."}
                        <ChevronsUpDown className="opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[100%] p-0 bg-white rounded px-2 py-1 outline-none border-none ${openSans.className} font-bold text-slate-500 justify-between">
                    <Command>
                        <CommandInput placeholder="Search profession..." />
                        <CommandList>
                            <CommandEmpty>No profession found.</CommandEmpty>
                            <CommandGroup>
                                {jobs.map((job) => (
                                    <CommandItem
                                        key={job.value}
                                        value={job.value}
                                        onSelect={() => handleSelect(job.value)}
                                    >
                                        <span className="hover:text-slate-300 transition-transform duration-150 ease-in-out cursor-pointer">
                                            {job.label}
                                        </span>
                                        <Check
                                            className={cn(
                                                "ml-auto",
                                                selectedValue === job.value
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

export default UpdateProfession;
