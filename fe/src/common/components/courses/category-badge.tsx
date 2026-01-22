import { Badge } from "@/common/components/ui/badge";

type CategoryBadgeProps = {
    categoryName: string;
};

export function CategoryBadge({ categoryName }: CategoryBadgeProps) {
    return (
        <Badge
            variant="secondary"
            className="w-full max-w-fit justify-start truncate"
        >
            {categoryName}
        </Badge>
    );
}
