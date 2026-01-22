import { cn } from "../lib/utils";

type LoadingSpinnerProps = {
    size?: "sm" | "md" | "lg" | "xl";
    className?: string;
    fullScreen?: boolean;
    text?: string;
};

export function LoadingSpinner({
    size = "md",
    className,
    fullScreen = false,
    text,
}: LoadingSpinnerProps) {
    const sizeClasses = {
        sm: "w-4 h-4 border-2",
        md: "w-8 h-8 border-3",
        lg: "w-12 h-12 border-4",
        xl: "w-16 h-16 border-4",
    };

    const wrapperClasses = fullScreen
        ? "fixed inset-0 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm z-50"
        : "flex flex-col items-center justify-center";

    return (
        <div className={cn(wrapperClasses, className)}>
            <div className="relative">
                <div
                    className={cn(
                        "animate-spin rounded-full border-transparent",
                        "border-t-primary dark:border-t-primary",
                        "shadow-[0_0_10px_rgba(var(--primary)/0.3)] dark:shadow-[0_0_10px_rgba(var(--primary)/0.5)]",
                        sizeClasses[size],
                    )}
                />
                <div
                    className={cn(
                        "absolute inset-0 rounded-full",
                        "border-primary/20 dark:border-primary/30",
                        sizeClasses[size],
                    )}
                />
            </div>
            {text && (
                <p className="text-foreground/70 dark:text-foreground/80 mt-4 text-sm font-medium">
                    {text}
                </p>
            )}
        </div>
    );
}

export function FullscreenLoading({ text = "Loading..." }: { text?: string }) {
    return <LoadingSpinner size="lg" fullScreen={true} text={text} />;
}

export default LoadingSpinner;
