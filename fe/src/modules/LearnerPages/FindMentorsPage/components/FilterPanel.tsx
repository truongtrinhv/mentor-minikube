import { Filter, X } from "lucide-react";

import { Badge } from "@/common/components/ui/badge";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/common/components/ui/card";
import { Label } from "@/common/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/common/components/ui/select";
import type { CourseCategoryLookUpResponse } from "@/modules/AdminPage/ManageCourseCategoryPage/types/course-response";

type FilterPanelProps = {
    selectedCategoryId: string | null;
    categories: CourseCategoryLookUpResponse[];
    onCategoryChange: (categoryId: string | null) => void;
    onClearFilters: () => void;
};

export const FilterPanel: React.FC<FilterPanelProps> = ({
    selectedCategoryId,
    categories,
    onCategoryChange,
}) => {
    const selectedCategory = categories.find(
        (cat) => cat.id === selectedCategoryId,
    );
    const hasActiveFilters = selectedCategoryId !== null;

    const handleRemoveCategory = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        onCategoryChange(null);
    };

    return (
        <Card className="border-gray-200 shadow-sm dark:border-gray-700">
            <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
                    <Filter className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    Filters
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Category Filter */}
                <div>
                    <Label className="mb-3 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Category
                    </Label>
                    <Select
                        value={selectedCategoryId || "all_categories"}
                        onValueChange={(value) =>
                            onCategoryChange(
                                value !== "all_categories" ? value : null,
                            )
                        }
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all_categories">
                                All categories
                            </SelectItem>
                            {categories.map((category) => (
                                <SelectItem
                                    key={category.id}
                                    value={category.id}
                                >
                                    {category.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Active Filters */}
                {hasActiveFilters && (
                    <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800/50">
                        <div className="mb-3">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Active Filters
                            </span>
                        </div>
                        <div className="w-full">
                            {selectedCategory && (
                                <Badge
                                    variant="secondary"
                                    className="inline-flex max-w-full items-center gap-2 border border-blue-200 bg-blue-100 px-3 py-1 text-blue-800 dark:border-blue-800 dark:bg-blue-950/50 dark:text-blue-300"
                                >
                                    <span className="min-w-0 flex-1 truncate">
                                        {selectedCategory.name}
                                    </span>
                                    <button
                                        onClick={handleRemoveCategory}
                                        className="flex-shrink-0 rounded-full p-0.5 transition-colors hover:bg-blue-200 dark:hover:bg-blue-900/50"
                                        aria-label={`Remove ${selectedCategory.name} filter`}
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                </Badge>
                            )}
                        </div>
                    </div>
                )}

                {/* Filter Summary */}
                <div className="text-xs text-gray-500 dark:text-gray-400">
                    {hasActiveFilters ? (
                        <p>Showing mentors filtered by selected criteria</p>
                    ) : (
                        <p>Showing all mentors</p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};
