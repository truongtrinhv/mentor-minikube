import { Users } from "lucide-react";

import { Badge } from "@/common/components/ui/badge";

type LearnerCountBadgeProps = {
    learnerCount: number;
};

export const LearnerCountBadge = ({ learnerCount }: LearnerCountBadgeProps) => {
    const learnerWord = learnerCount === 1 ? "learner" : "learners";

    return (
        <Badge variant="secondary">
            <Users /> {learnerCount} {learnerWord}
        </Badge>
    );
};
