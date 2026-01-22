import { Search } from "lucide-react";

import { Input } from "@/common/components/ui/input";

type SearchBarProps = {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
};

export const SearchBar: React.FC<SearchBarProps> = ({
    value,
    onChange,
    placeholder = "Search for mentors...",
}) => {
    return (
        <div className="relative">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
                type="text"
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full py-2 pr-4 pl-10"
            />
        </div>
    );
};
