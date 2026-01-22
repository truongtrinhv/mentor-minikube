import { useQuery } from "@tanstack/react-query";
import { Check, ChevronsUpDown } from "lucide-react";
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

type SelectWithRemoteSearchProps<T> = {
    initialSearchQuery?: string;
    placeholder?: string;
    value: string;
    onChange: (value: string) => void;
    getValue: (option: T) => string;
    getLabel: (option: T) => string;
    queryFunction: (search: string) => Promise<T[]> | T[];
    refetchOptionsOnSearch?: boolean;
    queryKey: string;
    className?: string;
    searchQueryCharacterLimit?: number;
};

const useFetchSelectOptions = <T,>(
    search: string,
    queryFunction: (search: string) => Promise<T[]> | T[],
    queryKey: string,
    refreshOptionsOnSearch: boolean = true,
) => {
    const { data, isPending, isError } = useQuery<T[]>({
        queryKey: [queryKey, refreshOptionsOnSearch ? search : ""],
        queryFn: () => queryFunction(search),
        staleTime: refreshOptionsOnSearch ? 0 : Infinity,
        refetchOnMount: refreshOptionsOnSearch,
    });

    return {
        options: data,
        isPending,
        isError,
    };
};

export const SelectWithRemoteSearch = <T,>({
    initialSearchQuery = "",
    placeholder = "",
    value,
    onChange,
    getValue,
    getLabel,
    queryFunction,
    refetchOptionsOnSearch = true,
    queryKey,
    className = "",
    searchQueryCharacterLimit,
}: SelectWithRemoteSearchProps<T>) => {
    const [open, setOpen] = useState(false);
    const [internalValue, setInternalValue] = useState<T | null>(null);

    const [searchQuery, setSearchQuery] = useState("");
    const debouncedSeachQuery = useDebounce(searchQuery, 500);

    const { options } = useFetchSelectOptions(
        debouncedSeachQuery,
        queryFunction,
        queryKey,
        refetchOptionsOnSearch,
    );

    const handleChangeSearchQuery = (query: string) => {
        if (searchQueryCharacterLimit) {
            setSearchQuery(query.slice(0, searchQueryCharacterLimit));
        } else {
            setSearchQuery(query);
        }
    };

    useEffect(() => {
        handleChangeSearchQuery(initialSearchQuery);
    }, [initialSearchQuery]);

    useEffect(() => {
        if (!options) return;

        if (!value) {
            setInternalValue(null);
            return;
        }

        const selectedOption = options.find((o) => getValue(o) === value);

        if (selectedOption !== undefined) {
            setInternalValue(selectedOption);
        }
    }, [value, options]);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={cn(
                        "flex justify-between gap-4",
                        className,
                        !internalValue && "text-muted-foreground font-normal",
                    )}
                >
                    <span className="w-full truncate text-left">
                        {internalValue ? getLabel(internalValue) : placeholder}
                    </span>
                    <ChevronsUpDown className="ml-auto size-4 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent align="start">
                <Command
                    shouldFilter={!refetchOptionsOnSearch}
                    filter={(value, search) => {
                        const normalizedValue = value.trim().toLowerCase();
                        const normalizedSearch = search.trim().toLowerCase();
                        if (normalizedValue.includes(normalizedSearch))
                            return 1;
                        return 0;
                    }}
                >
                    <CommandInput
                        placeholder="Search..."
                        value={searchQuery}
                        onValueChange={handleChangeSearchQuery}
                    />
                    <CommandList>
                        <CommandEmpty>No options found.</CommandEmpty>
                        <CommandGroup>
                            {internalValue && (
                                <CommandItem
                                    onSelect={() => {
                                        onChange("");
                                        setOpen(false);
                                    }}
                                    className="font-medium italic"
                                >
                                    Clear selection
                                </CommandItem>
                            )}
                            {options !== undefined &&
                                options.map((option) => (
                                    <CommandItem
                                        key={getValue(option)}
                                        value={getLabel(option)}
                                        onSelect={() => {
                                            onChange(getValue(option));
                                            setOpen(false);
                                        }}
                                    >
                                        {getLabel(option)}
                                        <Check
                                            className={cn(
                                                "ml-auto",
                                                internalValue !== null &&
                                                    getValue(internalValue) ===
                                                        getValue(option)
                                                    ? "opacity-100"
                                                    : "opacity-0",
                                            )}
                                        />
                                    </CommandItem>
                                ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
};
