import { Plus, X } from "lucide-react";
import { useEffect, useState } from "react";

import LoadingSpinner from "@/common/components/loading-spinner";
import { ResourceItem } from "@/common/components/resources/resource-item";
import { Button } from "@/common/components/ui/button";
import { Input } from "@/common/components/ui/input";
import useDebounce from "@/common/hooks/use-debounce";
import { useResources } from "@/common/hooks/use-resources";
import { cn } from "@/common/lib/utils";
import {
    type Resource,
    defaultResourceQueryParams,
} from "@/common/types/resource";

type CourseResourcePickerProps = {
    initialSelectedResources?: Resource[];
    onChange: (ids: string[]) => void;
    className?: string;
};

export function CourseResourcePicker({
    initialSelectedResources = [],
    onChange,
    className = "",
}: CourseResourcePickerProps) {
    const [selectedResources, setSelectedResources] = useState<Resource[]>(
        initialSelectedResources,
    );

    const [searchQuery, setSearchQuery] = useState("");
    const debouncedSearchQuery = useDebounce(searchQuery, 500);

    const { resources, isPending, isError } = useResources({
        ...defaultResourceQueryParams,
        search: debouncedSearchQuery,
    });

    const unselectedResources = resources?.filter(
        (r) => !selectedResources.some((sr) => sr.id === r.id),
    );

    const addResource = (resource: Resource) => {
        if (selectedResources.some((r) => r.id === resource.id)) return;
        setSelectedResources((prev) => [...prev, resource]);
    };

    const removeResource = (resource: Resource) => {
        setSelectedResources(selectedResources.filter((r) => r !== resource));
    };

    useEffect(() => {
        onChange(selectedResources.map((resource) => resource.id));
    }, [selectedResources]);

    return (
        <div className={cn("flex flex-col gap-4", className)}>
            <div className="flex flex-col gap-2">
                <p className="text-primary/75 text-sm">
                    {`${selectedResources.length || "No"} resources selected`}
                </p>

                {selectedResources.map((resource) => (
                    <div className="flex items-center gap-4" key={resource.id}>
                        <ResourceItem
                            resource={resource}
                            enableDownload
                            className="min-w-0"
                        />

                        <Button
                            onClick={() => removeResource(resource)}
                            type="button"
                            variant="outline"
                            size="icon"
                            className="ml-auto flex-shrink-0"
                            id={`remove-resource-${resource.id}`}
                        >
                            <X className="text-destructive size-4" />
                        </Button>
                    </div>
                ))}
            </div>

            <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for resources..."
            />

            {isPending && <LoadingSpinner />}

            {isError && (
                <p className="text-primary/75 text-sm">
                    Error getting resources
                </p>
            )}

            {unselectedResources?.length === 0 && (
                <p className="text-primary/75 text-sm">No resource found.</p>
            )}

            {unselectedResources && (
                <div className="flex flex-col gap-2">
                    {unselectedResources.map((resource) => (
                        <div
                            className="flex items-center gap-4"
                            key={resource.id}
                        >
                            <ResourceItem
                                resource={resource}
                                enableDownload
                                className="min-w-0"
                            />
                            <Button
                                onClick={() => addResource(resource)}
                                type="button"
                                variant="outline"
                                size="icon"
                                className="ml-auto flex-shrink-0"
                                id={`add-resource-${resource.id}`}
                            >
                                <Plus className="size-4" />
                            </Button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
