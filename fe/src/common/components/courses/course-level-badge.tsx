import { Badge } from "@/common/components/ui/badge";
import { type CourseLevel, CourseLevelMap } from "@/common/types/course";

const levelClassNames = {
    0: "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100",
    1: "bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100",
    2: "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100",
} as const;

type CourseLevelBadgeProps = {
    level: CourseLevel;
};

export function CourseLevelBadge({ level }: CourseLevelBadgeProps) {
    const color = levelClassNames[level];
    const name = CourseLevelMap[level];

    return <Badge className={color}>{name}</Badge>;
}
