"use client"

import * as React from "react"
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
import { Open_Sans } from "next/font/google"

const openSans = Open_Sans({
    weight: '400',
    subsets: ['latin'],
});

export const timeZones = [
    { value: "UTC-12:00", label: "(UTC-12:00) Baker Island, Howland Island" },
    { value: "UTC-11:00", label: "(UTC-11:00) American Samoa, Niue" },
    { value: "UTC-10:00", label: "(UTC-10:00) Hawaii, Cook Islands, French Polynesia" },
    { value: "UTC-09:30", label: "(UTC-09:30) Marquesas Islands" },
    { value: "UTC-09:00", label: "(UTC-09:00) Alaska, Gambier Islands" },
    { value: "UTC-08:00", label: "(UTC-08:00) Pacific Standard Time (US, Canada), Pitcairn Islands" },
    { value: "UTC-07:00", label: "(UTC-07:00) Mountain Standard Time (US, Canada), Chihuahua" },
    { value: "UTC-06:00", label: "(UTC-06:00) Central Standard Time (US, Canada), Mexico City, Costa Rica" },
    { value: "UTC-05:00", label: "(UTC-05:00) Eastern Standard Time (US, Canada), Colombia, Peru" },
    { value: "UTC-04:00", label: "(UTC-04:00) Atlantic Standard Time, Venezuela, Bolivia, Paraguay" },
    { value: "UTC-03:30", label: "(UTC-03:30) Newfoundland Standard Time (Canada)" },
    { value: "UTC-03:00", label: "(UTC-03:00) Argentina, Brazil, Uruguay, Falkland Islands" },
    { value: "UTC-02:00", label: "(UTC-02:00) South Georgia & South Sandwich Islands" },
    { value: "UTC-01:00", label: "(UTC-01:00) Azores, Cape Verde" },
    { value: "UTC±00:00", label: "(UTC±00:00) Greenwich Mean Time (UK, Portugal, Iceland, Senegal)" },
    { value: "UTC+01:00", label: "(UTC+01:00) Central European Time (Germany, France, Nigeria, Algeria)" },
    { value: "UTC+02:00", label: "(UTC+02:00) Eastern European Time (Egypt, South Africa, Israel, Ukraine)" },
    { value: "UTC+03:00", label: "(UTC+03:00) Moscow Time (Russia, Saudi Arabia, Kenya, Turkey)" },
    { value: "UTC+03:30", label: "(UTC+03:30) Iran Standard Time" },
    { value: "UTC+04:00", label: "(UTC+04:00) Gulf Standard Time (UAE, Oman, Armenia, Azerbaijan)" },
    { value: "UTC+04:30", label: "(UTC+04:30) Afghanistan Standard Time" },
    { value: "UTC+05:00", label: "(UTC+05:00) Pakistan Standard Time, Maldives, Uzbekistan" },
    { value: "UTC+05:30", label: "(UTC+05:30) Indian Standard Time (India, Sri Lanka)" },
    { value: "UTC+05:45", label: "(UTC+05:45) Nepal Standard Time" },
    { value: "UTC+06:00", label: "(UTC+06:00) Bangladesh Standard Time, Bhutan, Kazakhstan" },
    { value: "UTC+06:30", label: "(UTC+06:30) Cocos Islands, Myanmar" },
    { value: "UTC+07:00", label: "(UTC+07:00) Indochina Time (Thailand, Vietnam, Cambodia, Indonesia)" },
    { value: "UTC+08:00", label: "(UTC+08:00) China Standard Time, Western Australia, Philippines, Malaysia" },
    { value: "UTC+08:45", label: "(UTC+08:45) Southeastern Western Australia Standard Time" },
    { value: "UTC+09:00", label: "(UTC+09:00) Japan Standard Time, Korea Standard Time" },
    { value: "UTC+09:30", label: "(UTC+09:30) Australian Central Standard Time (Adelaide, Darwin)" },
    { value: "UTC+10:00", label: "(UTC+10:00) Australian Eastern Standard Time (Sydney, Melbourne), Papua New Guinea" },
    { value: "UTC+10:30", label: "(UTC+10:30) Lord Howe Island" },
    { value: "UTC+11:00", label: "(UTC+11:00) Solomon Islands, New Caledonia, Vanuatu" },
    { value: "UTC+12:00", label: "(UTC+12:00) New Zealand, Fiji, Tuvalu, Wallis & Futuna" },
    { value: "UTC+12:45", label: "(UTC+12:45) Chatham Islands" },
    { value: "UTC+13:00", label: "(UTC+13:00) Tonga, Samoa, Tokelau" },
    { value: "UTC+14:00", label: "(UTC+14:00) Line Islands (Kiribati)" }
];

interface SelectTimeZoneProps {
    OnChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    Value: string;
    GetValidationString: (field: "username" | "profession" | "image" | "timeZone" | "email" | "password") => React.JSX.Element;
}

export function SelectTimeZone({
    OnChange,
    Value,
    GetValidationString,
}: SelectTimeZoneProps) {
    const [open, setOpen] = React.useState(false)
    const [selectedValue, setSelectedValue] = React.useState(Value);

    const handleSelect = (newValue: string) => {
        setSelectedValue(newValue);
        OnChange({
            target: { name: "timeZone", value: newValue },
        } as React.ChangeEvent<HTMLInputElement>); // Trigger formik OnChange manually
        setOpen(false);
    };

    return (
        <div className="w-full flex flex-col">
            {GetValidationString("profession")}
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger className="font-poppins font-semibold text-ellipsis overflow-hidden whitespace-nowrap" asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className={`w-full bg-white rounded px-2 py-1 outline-none border-none ${openSans.className} font-bold text-slate-500 justify-between hover:bg-slate-400 transition-transform duration-150 ease-in-out`}
                    >
                        {selectedValue
                            ? timeZones.find((timeZone) => timeZone.value === selectedValue)?.label
                            : "Select Time Zone..."}
                        <ChevronsUpDown className="opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className=" w-[60%] md:w-[100%] p-0 bg-white rounded px-2 py-1 outline-none border-none ${openSans.className} font-bold text-slate-500 justify-between">
                    <Command>
                        <CommandInput className="font-poppins font-semibold" placeholder="Search Time Zone..." />
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
                                                selectedValue === timeZone.value ? "opacity-100" : "opacity-0"
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
    )
};