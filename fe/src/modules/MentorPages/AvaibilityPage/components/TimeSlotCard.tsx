import { Edit, Trash2 } from "lucide-react";

import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/common/components/ui/tooltip";

import type { TimeSlotResponse } from "../types";
import { TimeSlotStatus } from "../types";
import { formatSessionTimeRange } from "../utils/dateTimeUtils";

type TimeSlotCardProps = {
    slot: TimeSlotResponse & { date: string };
    isInPast: boolean;
    onEdit: (slot: TimeSlotResponse & { date: string }) => void;
    onDelete: (slot: TimeSlotResponse & { date: string }) => void;
};

export const TimeSlotCard = ({
    slot,
    isInPast,
    onEdit,
    onDelete,
}: TimeSlotCardProps) => {
    const isAvailable = slot.status === TimeSlotStatus.Available;
    const timeDisplayString = formatSessionTimeRange(
        slot.startTime,
        slot.endTime,
    );

    const getCardStyling = () => {
        if (isInPast) {
            return "bg-muted/30 border-muted/50 text-muted-foreground dark:bg-muted/20 dark:border-muted/40";
        }

        if (isAvailable) {
            return "border-green-300 bg-green-50 hover:shadow-md dark:border-green-800 dark:bg-green-950/30";
        } else {
            return "border-orange-300 bg-orange-50 hover:shadow-md dark:border-orange-800 dark:bg-orange-950/30";
        }
    };

    const getTextStyling = () => {
        if (isInPast) {
            return "text-muted-foreground font-semibold";
        }

        if (isAvailable) {
            return "text-green-800 dark:text-green-300 font-semibold";
        } else {
            return "text-orange-800 dark:text-orange-300 font-semibold";
        }
    };

    return (
        <div
            className={`relative mb-2 rounded-lg border-2 p-3 transition-all duration-200 ${getCardStyling()}`}
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center">
                    <span className={`text-sm ${getTextStyling()}`}>
                        {timeDisplayString}
                    </span>
                </div>

                {!isInPast && isAvailable && (
                    <div className="flex space-x-1">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <button
                                    className="rounded-full p-1 text-green-600 hover:bg-green-100 dark:text-green-400 dark:hover:bg-green-900/30"
                                    onClick={() => onEdit(slot)}
                                >
                                    <Edit className="h-3.5 w-3.5" />
                                </button>
                            </TooltipTrigger>
                            <TooltipContent>Edit</TooltipContent>
                        </Tooltip>

                        <Tooltip>
                            <TooltipTrigger asChild>
                                <button
                                    className="rounded-full p-1 text-red-600 hover:bg-red-100 dark:text-red-400 dark:hover:bg-red-900/30"
                                    onClick={() => onDelete(slot)}
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                </button>
                            </TooltipTrigger>
                            <TooltipContent>Delete</TooltipContent>
                        </Tooltip>
                    </div>
                )}
            </div>
        </div>
    );
};
