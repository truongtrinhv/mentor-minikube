import { Loader2 } from "lucide-react";
import React from "react";

import { cn } from "../../../common/lib/utils";

type LoadingSpinnerProps = {
    size?: "sm" | "md" | "lg";
    text?: string;
    className?: string;
};

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
    size = "md",
    text,
    className,
}) => {
    const sizeClasses = {
        sm: "w-4 h-4",
        md: "w-6 h-6",
        lg: "w-8 h-8",
    };

    return (
        <div
            className={cn(
                "flex items-center justify-center gap-2 py-4",
                className,
            )}
        >
            <Loader2
                className={cn(
                    "text-muted-foreground animate-spin",
                    sizeClasses[size],
                )}
            />
            {text && (
                <span className="text-muted-foreground text-sm">{text}</span>
            )}
        </div>
    );
};
