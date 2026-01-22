"use client";

import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/common/components/ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/common/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/common/components/ui/popover";
import useDebounce from "@/common/hooks/use-debounce";
import { cn } from "@/common/lib/utils";
import { courseServices } from "@/common/services/courseServices";
import type { Lookup } from "@/common/types/lookup";

type FilterCourseComboboxProps = {
    value: string | null;
    setValue?: (value: string | null) => void;
};

export function FilterCourseCombobox(props: FilterCourseComboboxProps) {
    const { setValue = () => {}, value = "" } = props;
    const [open, setOpen] = useState<boolean>(false);
    const [courses, setCourses] = useState<Lookup[]>([]);
    const [searchValue, setSearchValue] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);

    // Use your debounce hook
    const debouncedSearchValue = useDebounce(searchValue, 300);

    // Initial load
    useEffect(() => {
        setLoading(true);
        courseServices
            .lookup(debouncedSearchValue || null)
            .then((res) => {
                setCourses(res.data || []);
            })
            .finally(() => setLoading(false));
    }, [debouncedSearchValue]);

    const selectedCourse = courses.find((course) => course.id === value);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="text-muted-foreground w-[200px] justify-between font-normal"
                    disabled={loading && courses.length === 0}
                >
                    <span className="truncate">
                        {selectedCourse ? selectedCourse.name : "Select course"}
                    </span>
                    {loading && courses.length === 0 ? (
                        <Loader2 className="h-4 w-4 animate-spin opacity-50" />
                    ) : (
                        <ChevronsUpDown className="h-4 w-4 opacity-50" />
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0">
                <Command shouldFilter={false}>
                    <CommandInput
                        placeholder="Search courses..."
                        className="h-9"
                        value={searchValue}
                        onValueChange={setSearchValue}
                    />
                    <CommandList>
                        {loading ? (
                            <div className="flex items-center justify-center py-6">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <span className="text-muted-foreground ml-2 text-sm">
                                    Loading courses...
                                </span>
                            </div>
                        ) : courses.length === 0 ? (
                            <CommandEmpty>No courses found.</CommandEmpty>
                        ) : (
                            <CommandGroup>
                                <CommandItem
                                    value={""}
                                    onSelect={(currentValue) => {
                                        setValue(
                                            currentValue === value
                                                ? ""
                                                : currentValue,
                                        );
                                        setOpen(false);
                                    }}
                                >
                                    All
                                    <Check
                                        className={cn(
                                            "ml-auto h-4 w-4",
                                            value === ""
                                                ? "opacity-100"
                                                : "opacity-0",
                                        )}
                                    />
                                </CommandItem>
                                {courses.map((course) => (
                                    <CommandItem
                                        key={course.id}
                                        value={course.id}
                                        onSelect={(currentValue) => {
                                            setValue(
                                                currentValue === value
                                                    ? ""
                                                    : currentValue,
                                            );
                                            setOpen(false);
                                        }}
                                    >
                                        <span className="truncate">
                                            {course.name}
                                        </span>
                                        <Check
                                            className={cn(
                                                "ml-auto h-4 w-4",
                                                value === course.id
                                                    ? "opacity-100"
                                                    : "opacity-0",
                                            )}
                                        />
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        )}
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
