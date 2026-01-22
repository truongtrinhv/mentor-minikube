import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/common/components/ui/alert-dialog";
import { cn } from "@/common/lib/utils";

import { Button } from "../ui/button";

type ConfirmDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: React.ReactNode;
    desc: React.JSX.Element | string;
    cancelBtnText?: string;
    confirmText?: React.ReactNode;
    destructive?: boolean;
    handleConfirm: () => void;
    isLoading?: boolean;
    className?: string;
    classNameConfirmButton?: string;
    children?: React.ReactNode;
};

export function ConfirmDialog(props: ConfirmDialogProps) {
    const {
        title,
        desc,
        children,
        className,
        classNameConfirmButton = "",
        confirmText,
        cancelBtnText,
        destructive,
        isLoading = false,
        handleConfirm,
        ...actions
    } = props;
    return (
        <AlertDialog {...actions}>
            <AlertDialogContent
                className={cn("wrap-break-word", className && className)}
            >
                <AlertDialogHeader className="min-w-full text-left">
                    <AlertDialogTitle>{title}</AlertDialogTitle>
                    <AlertDialogDescription asChild>
                        <div>{desc}</div>
                    </AlertDialogDescription>
                </AlertDialogHeader>
                {children}
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isLoading}>
                        {cancelBtnText ?? "Cancel"}
                    </AlertDialogCancel>
                    <Button
                        variant={destructive ? "destructive" : "default"}
                        className={
                            destructive ? "text-white" : classNameConfirmButton
                        }
                        onClick={handleConfirm}
                        loading={isLoading}
                    >
                        {confirmText ?? "Continue"}
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
