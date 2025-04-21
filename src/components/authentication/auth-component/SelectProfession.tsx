"use client"

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Open_Sans } from "next/font/google";

const openSans = Open_Sans({
  weight: '400',
  subsets: ['latin'],
});

export const jobs = [
  { value: "software_engineer", label: "Software Engineer" },
  { value: "data_scientist", label: "Data Scientist" },
  { value: "network_administrator", label: "Network Administrator" },
  { value: "cyber_security_specialist", label: "Cyber Security Specialist" },
  { value: "ai_ml_engineer", label: "AI/ML Engineer" },
  { value: "web_developer", label: "Web Developer" },
  { value: "ux_ui_designer", label: "UX/UI Designer" },
  { value: "product_manager", label: "Product Manager" },

  // Healthcare
  { value: "doctor", label: "Doctor" },
  { value: "nurse", label: "Nurse" },
  { value: "pharmacist", label: "Pharmacist" },
  { value: "radiologist", label: "Radiologist" },
  { value: "physical_therapist", label: "Physical Therapist" },
  { value: "psychiatrist", label: "Psychiatrist" },
  { value: "dentist", label: "Dentist" },

  // Engineering & Manufacturing
  { value: "civil_engineer", label: "Civil Engineer" },
  { value: "mechanical_engineer", label: "Mechanical Engineer" },
  { value: "electrical_engineer", label: "Electrical Engineer" },
  { value: "aerospace_engineer", label: "Aerospace Engineer" },
  { value: "automotive_engineer", label: "Automotive Engineer" },
  { value: "chemical_engineer", label: "Chemical Engineer" },
  { value: "biomedical_engineer", label: "Biomedical Engineer" },

  // Business & Finance
  { value: "accountant", label: "Accountant" },
  { value: "financial_analyst", label: "Financial Analyst" },
  { value: "investment_banker", label: "Investment Banker" },
  { value: "auditor", label: "Auditor" },
  { value: "hr_manager", label: "HR Manager" },
  { value: "marketing_manager", label: "Marketing Manager" },
  { value: "sales_representative", label: "Sales Representative" },

  // Arts & Entertainment
  { value: "actor", label: "Actor" },
  { value: "musician", label: "Musician" },
  { value: "graphic_designer", label: "Graphic Designer" },
  { value: "photographer", label: "Photographer" },
  { value: "videographer", label: "Videographer" },
  { value: "writer", label: "Writer" },
  { value: "editor", label: "Editor" },

  // Education
  { value: "teacher", label: "Teacher" },
  { value: "professor", label: "Professor" },
  { value: "librarian", label: "Librarian" },
  { value: "researcher", label: "Researcher" },

  // Hospitality & Tourism
  { value: "chef", label: "Chef" },
  { value: "hotel_manager", label: "Hotel Manager" },
  { value: "tour_guide", label: "Tour Guide" },
  { value: "flight_attendant", label: "Flight Attendant" },

  // Law & Order
  { value: "lawyer", label: "Lawyer" },
  { value: "judge", label: "Judge" },
  { value: "police_officer", label: "Police Officer" },
  { value: "firefighter", label: "Firefighter" },

  // Skilled Trades
  { value: "electrician", label: "Electrician" },
  { value: "plumber", label: "Plumber" },
  { value: "carpenter", label: "Carpenter" },
  { value: "welder", label: "Welder" },
  { value: "mechanic", label: "Mechanic" },

  // Agriculture
  { value: "farmer", label: "Farmer" },
  { value: "agricultural_scientist", label: "Agricultural Scientist" },

  // Others
  { value: "pilot", label: "Pilot" },
  { value: "astronaut", label: "Astronaut" },
  { value: "fashion_designer", label: "Fashion Designer" },
  { value: "social_worker", label: "Social Worker" },
  { value: "politician", label: "Politician" },
  { value: "other", label: "Other" }
];

interface SelectProfessionProps {
  OnChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  Value: string;
  GetValidationString: (field: "username" | "profession" | "image" | "timeZone" | "email" | "password") => React.JSX.Element;
}

export function SelectProfession({
  OnChange,
  Value,
  GetValidationString,
}: SelectProfessionProps) {
  const [open, setOpen] = React.useState(false);
  const [selectedValue, setSelectedValue] = React.useState(Value);

  const handleSelect = (newValue: string) => {
    setSelectedValue(newValue);
    OnChange({
      target: { name: "profession", value: newValue },
    } as React.ChangeEvent<HTMLInputElement>); // Trigger formik OnChange manually
    setOpen(false);
  };

  return (
    <div className="w-full flex flex-col">
      {GetValidationString("profession")}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            role="combobox"
            aria-expanded={open}
            className={`w-full bg-white rounded px-2 py-1 outline-none border-none ${openSans.className} font-bold text-slate-500 justify-between hover:bg-slate-400 transition-transform duration-150 ease-in-out`}
          >
            {selectedValue
              ? jobs.find((job) => job.label === selectedValue)?.label
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
                    onSelect={() => handleSelect(job.label)}
                  >
                    <span className="hover:text-slate-300 transition-transform duration-150 ease-in-out cursor-pointer">{job.label}</span>
                    <Check
                      className={cn(
                        "ml-auto",
                        selectedValue === job.value ? "opacity-100" : "opacity-0"
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
}