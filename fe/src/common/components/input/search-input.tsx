import { Search } from "lucide-react";
import { type ChangeEvent, useEffect, useState } from "react";

import { Input } from "@/common/components/ui/input";
import useDebounce from "@/common/hooks/use-debounce";
import { cn } from "@/common/lib/utils";

type SearchInputProps = {
    onSearch: (value: string) => void;
    delay?: number;
    className?: string;
    characterLimit?: number;
};

const SearchInput: React.FC<SearchInputProps> = ({
    onSearch,
    delay = 500,
    className,
    characterLimit,
}) => {
    const [input, setInput] = useState("");
    const debouncedValue = useDebounce(input, delay);

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (characterLimit) {
            setInput(e.target.value.slice(0, characterLimit));
        } else {
            setInput(e.target.value);
        }
    };

    useEffect(() => {
        onSearch(debouncedValue);
    }, [debouncedValue]);

    return (
        <div className={cn("relative w-full max-w-md", className)}>
            <Search
                className="text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2"
                size={18}
            />
            <Input
                type="text"
                placeholder="Search..."
                value={input}
                onChange={handleChange}
                className="pl-10"
            />
        </div>
    );
};

export default SearchInput;
