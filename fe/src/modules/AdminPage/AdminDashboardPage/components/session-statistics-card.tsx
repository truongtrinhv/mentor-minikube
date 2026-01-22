import {
    Calendar,
    CalendarCheck2,
    CalendarClock,
    CalendarMinus,
    CalendarSync,
    CalendarX2,
} from "lucide-react";
import { useMemo } from "react";
import { Label, Pie, PieChart } from "recharts";

import LoadingSpinner from "@/common/components/loading-spinner";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/common/components/ui/card";
import {
    type ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/common/components/ui/chart";

import type { SessionStats } from "../types";

type SessionStatisticsCardProps = {
    sessionStats?: SessionStats;
    isLoading: boolean;
    isError: boolean;
};

const chartConfig = {
    completed: {
        label: "Completed",
        color: "var(--success-background)",
    },
    scheduled: {
        label: "Scheduled",
        color: "var(--info-background)",
    },
    cancelled: {
        label: "Cancelled",
        color: "var(--danger-background)",
    },
    pending: {
        label: "Pending",
        color: "var(--warning-background)",
    },
    rescheduling: {
        label: "Rescheduling",
        color: "var(--special-background)",
    },
} satisfies ChartConfig;

export const SessionStatisticsCard = (props: SessionStatisticsCardProps) => {
    const { sessionStats, isLoading, isError } = props;

    const chartData = useMemo(() => {
        return [
            {
                status: "completed",
                count: sessionStats?.completedSessionThisMonthCount ?? 0,
                fill: "var(--success-background)",
            },
            {
                status: "scheduled",
                count: sessionStats?.scheduledSessionThisMonthCount ?? 0,
                fill: "var(--info-background)",
            },
            {
                status: "cancelled",
                count: sessionStats?.cancelledSessionThisMonthCount ?? 0,
                fill: "var(--danger-background)",
            },
            {
                status: "pending",
                count: sessionStats?.pendingSessionThisMonthCount ?? 0,
                fill: "var(--warning-background)",
            },
            {
                status: "rescheduling",
                count: sessionStats?.reschedulingSessionThisMonthCount ?? 0,
                fill: "var(--special-background)",
            },
        ];
    }, [sessionStats]);

    return (
        <Card>
            {isLoading && <LoadingSpinner className="m-auto" />}
            {isError && (
                <p className="m-auto">
                    Failed to load session statistics. Please come back later.
                </p>
            )}
            {sessionStats && (
                <>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-6">
                            <div className="bg-info-background rounded-sm p-2">
                                <Calendar className="text-info size-6 shrink-0 self-center" />
                            </div>
                            <div>
                                <p className="text-4xl font-bold">
                                    {sessionStats.sessionThisMonthCount}
                                </p>
                                <p className="text-xl font-medium">
                                    Sessions this month
                                </p>
                            </div>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex grow flex-col gap-4">
                        <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-2">
                            <div className="flex items-center gap-4">
                                <div className="bg-success-background rounded-sm p-2">
                                    <CalendarCheck2 className="text-success" />
                                </div>
                                <div>
                                    <p className="text-2xl font-medium">
                                        {
                                            sessionStats.completedSessionThisMonthCount
                                        }
                                    </p>
                                    <p className="font-medium">Completed</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="bg-info-background rounded-sm p-2">
                                    <CalendarClock className="text-info" />
                                </div>
                                <div>
                                    <p className="text-2xl font-medium">
                                        {
                                            sessionStats.scheduledSessionThisMonthCount
                                        }
                                    </p>
                                    <p className="font-medium">Scheduled</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="bg-danger-background rounded-sm p-2">
                                    <CalendarX2 className="text-danger" />
                                </div>
                                <div>
                                    <p className="text-2xl font-medium">
                                        {
                                            sessionStats.cancelledSessionThisMonthCount
                                        }
                                    </p>
                                    <p className="font-medium">Cancelled</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="bg-warning-background rounded-sm p-2">
                                    <CalendarMinus className="text-warning" />
                                </div>
                                <div>
                                    <p className="text-2xl font-medium">
                                        {
                                            sessionStats.pendingSessionThisMonthCount
                                        }
                                    </p>
                                    <p className="font-medium">Pending</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="bg-special-background rounded-sm p-2">
                                    <CalendarSync className="text-special" />
                                </div>
                                <div>
                                    <p className="text-2xl font-medium">
                                        {
                                            sessionStats.reschedulingSessionThisMonthCount
                                        }
                                    </p>
                                    <p className="font-medium">Rescheduling</p>
                                </div>
                            </div>
                        </div>

                        <ChartContainer
                            config={chartConfig}
                            className="min-h-96 grow"
                        >
                            <PieChart>
                                <ChartTooltip
                                    cursor={false}
                                    content={<ChartTooltipContent hideLabel />}
                                />
                                <Pie
                                    data={chartData}
                                    dataKey="count"
                                    nameKey="status"
                                    innerRadius={80}
                                >
                                    <Label
                                        content={({ viewBox }) => {
                                            if (
                                                viewBox &&
                                                "cx" in viewBox &&
                                                "cy" in viewBox
                                            ) {
                                                return (
                                                    <text
                                                        x={viewBox.cx}
                                                        y={viewBox.cy}
                                                        textAnchor="middle"
                                                        dominantBaseline="middle"
                                                    >
                                                        <tspan
                                                            x={viewBox.cx}
                                                            y={viewBox.cy}
                                                            className="fill-foreground text-3xl font-bold"
                                                        >
                                                            {
                                                                sessionStats.sessionThisMonthCount
                                                            }
                                                        </tspan>
                                                        <tspan
                                                            x={viewBox.cx}
                                                            y={
                                                                (viewBox.cy ||
                                                                    0) + 24
                                                            }
                                                            className="fill-muted-foreground text-base"
                                                        >
                                                            Sessions
                                                        </tspan>
                                                    </text>
                                                );
                                            }
                                        }}
                                    />
                                </Pie>
                            </PieChart>
                        </ChartContainer>
                    </CardContent>
                </>
            )}
        </Card>
    );
};
