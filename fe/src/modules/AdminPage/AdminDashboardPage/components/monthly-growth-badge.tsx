import { TrendingDown, TrendingUp } from "lucide-react";
import { Fragment } from "react/jsx-runtime";

import { Badge } from "@/common/components/ui/badge";

type MonthlyGrowthBadgeProps = {
    growthAmount: number;
};

export const MonthlyGrowthBadge = ({
    growthAmount,
}: MonthlyGrowthBadgeProps) => {
    const variant =
        growthAmount == 0
            ? "secondary"
            : growthAmount > 0
              ? "success"
              : "danger";
    const text =
        growthAmount === 0
            ? "Unchanged this month"
            : `${growthAmount > 0 ? "Up" : "Down"} ${Math.abs(growthAmount)} this month.`;
    const icon =
        growthAmount == 0 ? (
            <Fragment />
        ) : growthAmount > 0 ? (
            <TrendingUp />
        ) : (
            <TrendingDown />
        );

    return (
        <Badge variant={variant}>
            {text} {icon}
        </Badge>
    );
};
