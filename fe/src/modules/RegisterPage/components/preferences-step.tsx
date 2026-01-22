import {
    BookOpen,
    Ear,
    Eye,
    GraduationCap,
    Hammer,
    Lightbulb,
    MessagesSquare,
    Search,
    X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import LoadingSpinner from "@/common/components/loading-spinner";
import { Checkbox } from "@/common/components/ui/checkbox";
import { Input } from "@/common/components/ui/input";
import { Label } from "@/common/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/common/components/ui/select";
import type { Lookup } from "@/common/types/lookup";

import { registerService } from "../services/registerServices";
import {
    type PreferencesStepProps,
    type SessionDurationType,
    type SessionFrequencyType,
} from "../types";

export function PreferencesStep({
    form,
    role,
    onSubmit,
}: PreferencesStepProps) {
    const [categories, setCategories] = useState<Lookup[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [previousRole, setPreviousRole] = useState<string | null>(null);

    // Set default values for learning style and teaching approach
    useEffect(() => {
        if (!form.getValues("learningStyle")) {
            form.setValue("learningStyle", "Visual", {
                shouldValidate: true,
            });
        }

        if (role === "Mentor" && !form.getValues("teachingStyles")) {
            form.setValue("teachingStyles", "handson", {
                shouldValidate: true,
            });
        }
    }, [form, role]);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                setIsLoading(true);
                const response = await registerService.getAllCourseCategories();
                if (response.data) {
                    setCategories(response.data || []);
                } else {
                    setCategories([]);
                }
            } catch (error) {
                console.error("Failed to fetch course categories:", error);
                toast.error(
                    "Failed to fetch course categories. Please try again!",
                );
            } finally {
                setIsLoading(false);
            }
        };

        fetchCategories();
    }, []);

    // Effect to handle clearing fields when role changes
    useEffect(() => {
        if (role !== previousRole) {
            if (role === "Learner") {
                form.setValue("teachingStyles", null, {
                    shouldValidate: true,
                });
            } else if (role === "Mentor") {
                form.setValue("teachingStyles", "handson", {
                    shouldValidate: true,
                });
            }

            if (!form.getValues("learningStyle")) {
                form.setValue("learningStyle", "Visual", {
                    shouldValidate: true,
                });
            }

            setPreviousRole(role);
        }
    }, [role, previousRole, form]);

    const handleTopicChange = (categoryId: string) => {
        const currentTopics = form.getValues("courseCategoryIds") || [];
        const updatedTopics = currentTopics.includes(categoryId)
            ? currentTopics.filter((id) => id !== categoryId)
            : [...currentTopics, categoryId];

        form.setValue("courseCategoryIds", updatedTopics, {
            shouldValidate: true,
        });
    };

    const getCategoryName = (id: string) => {
        const category = categories.find((cat) => cat.id === id);
        return category ? category.name : id;
    };

    // Handle learning style selection/deselection
    const handleLearningStyleChange = (style: string) => {
        form.setValue("learningStyle", style, {
            shouldValidate: true,
        });
        form.trigger("learningStyle");
    };

    // Handle teaching style selection/deselection
    const handleTeachingStyleChange = (
        style: "handson" | "discussion" | "project" | "lecture",
    ) => {
        form.setValue("teachingStyles", style, {
            shouldValidate: true,
        });
        form.trigger("teachingStyles");
    };

    const filteredCategories = categories.filter(
        (category) =>
            category.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
            !(form.getValues("courseCategoryIds") || []).includes(category.id),
    );

    return (
        <form
            className="space-y-8"
            onChange={() => form.trigger()}
            onSubmit={(e) => {
                e.preventDefault();
                if (!form.getValues("learningStyle")) {
                    form.setError("learningStyle", {
                        type: "required",
                        message: "Preferred learning style is invalid.",
                    });
                    return;
                }
                onSubmit();
            }}
        >
            {/* Interests & Learning Block */}
            <div className="rounded-lg border p-6">
                <h3 className="mb-4 text-lg font-medium">
                    Interests & Learning Style
                </h3>
                <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                    <div className="space-y-6">
                        <div className="space-y-3">
                            <Label>Topics of Interest</Label>
                            <div className="rounded-lg border">
                                {/* Selected topics container with scroll */}
                                <div className="flex max-h-24 min-h-16 flex-wrap gap-2 overflow-y-auto p-3">
                                    {isLoading ? (
                                        <div className="flex w-full items-center justify-center py-2">
                                            <LoadingSpinner size="sm" />
                                            <span className="text-muted-foreground ml-2 text-sm">
                                                Loading topics...
                                            </span>
                                        </div>
                                    ) : (
                                        <>
                                            {(
                                                form.getValues(
                                                    "courseCategoryIds",
                                                ) || []
                                            ).map((categoryId) => (
                                                <div
                                                    key={categoryId}
                                                    className="bg-muted flex items-center gap-1 rounded-md px-2 py-1 text-sm"
                                                >
                                                    {getCategoryName(
                                                        categoryId,
                                                    )}
                                                    <button
                                                        type="button"
                                                        className="hover:bg-muted-foreground/20 inline-flex h-4 w-4 items-center justify-center rounded-full"
                                                        onClick={() => {
                                                            handleTopicChange(
                                                                categoryId,
                                                            );
                                                        }}
                                                    >
                                                        <X className="h-3 w-3" />
                                                    </button>
                                                </div>
                                            ))}
                                            {(
                                                form.getValues(
                                                    "courseCategoryIds",
                                                ) || []
                                            ).length === 0 && (
                                                <span className="text-muted-foreground text-sm">
                                                    No topics selected
                                                </span>
                                            )}
                                        </>
                                    )}
                                </div>

                                {/* Fixed search dropdown */}
                                <div className="border-t p-2">
                                    <Select
                                        value=""
                                        onValueChange={(value) => {
                                            handleTopicChange(value);
                                            form.trigger("courseCategoryIds");
                                        }}
                                    >
                                        <SelectTrigger className="h-8 w-full">
                                            <SelectValue placeholder="Add more topics..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <div
                                                className="top-0 border-b px-2 py-2"
                                                onKeyDown={(e) => {
                                                    if (
                                                        document.activeElement
                                                            ?.tagName ===
                                                        "INPUT"
                                                    ) {
                                                        e.stopPropagation();
                                                    }
                                                }}
                                            >
                                                <div className="flex items-center gap-2 rounded border px-1 py-1">
                                                    <Search className="text-muted-foreground h-4 w-4" />
                                                    <Input
                                                        className="h-7 border-0 px-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                                                        placeholder="Search topics..."
                                                        value={searchTerm}
                                                        onChange={(e) =>
                                                            setSearchTerm(
                                                                e.target.value,
                                                            )
                                                        }
                                                    />
                                                </div>
                                            </div>
                                            {filteredCategories.length > 0 ? (
                                                filteredCategories.map(
                                                    (category) => (
                                                        <SelectItem
                                                            key={category.id}
                                                            value={category.id}
                                                        >
                                                            {category.name}
                                                        </SelectItem>
                                                    ),
                                                )
                                            ) : (
                                                <div className="text-muted-foreground px-2 py-4 text-center text-sm">
                                                    No matching topics found
                                                </div>
                                            )}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <p className="text-muted-foreground text-xs">
                                Select topics you're interested in for
                                mentorship
                            </p>
                            {form.formState.errors.courseCategoryIds && (
                                <p className="text-sm text-red-500">
                                    {
                                        form.formState.errors.courseCategoryIds
                                            .message
                                    }
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="space-y-3">
                            <Label htmlFor="learningStyle">
                                Your Learning Style
                            </Label>
                            <div className="grid grid-cols-2 gap-2">
                                <div
                                    className={`flex cursor-pointer items-center space-x-2 rounded-lg border p-3 transition-all ${
                                        form.getValues("learningStyle") ===
                                        "Visual"
                                            ? "border-primary bg-primary/5"
                                            : "hover:border-gray-400"
                                    }`}
                                    onClick={() =>
                                        handleLearningStyleChange("Visual")
                                    }
                                >
                                    <div className="flex h-6 w-6 items-center justify-center">
                                        <Eye className="text-primary h-4 w-4" />
                                    </div>
                                    <span className="text-sm font-medium">
                                        Visual
                                    </span>
                                </div>
                                <div
                                    className={`flex cursor-pointer items-center space-x-2 rounded-lg border p-3 transition-all ${
                                        form.getValues("learningStyle") ===
                                        "Auditory"
                                            ? "border-primary bg-primary/5"
                                            : "hover:border-gray-400"
                                    }`}
                                    onClick={() =>
                                        handleLearningStyleChange("Auditory")
                                    }
                                >
                                    <div className="flex h-6 w-6 items-center justify-center">
                                        <Ear className="text-primary h-4 w-4" />
                                    </div>
                                    <span className="text-sm font-medium">
                                        Auditory
                                    </span>
                                </div>
                                <div
                                    className={`flex cursor-pointer items-center space-x-2 rounded-lg border p-3 transition-all ${
                                        form.getValues("learningStyle") ===
                                        "Reading/Writing"
                                            ? "border-primary bg-primary/5"
                                            : "hover:border-gray-400"
                                    }`}
                                    onClick={() =>
                                        handleLearningStyleChange(
                                            "Reading/Writing",
                                        )
                                    }
                                >
                                    <div className="flex h-6 w-6 items-center justify-center">
                                        <BookOpen className="text-primary h-4 w-4" />
                                    </div>
                                    <span className="text-sm font-medium">
                                        Reading/Writing
                                    </span>
                                </div>
                                <div
                                    className={`flex cursor-pointer items-center space-x-2 rounded-lg border p-3 transition-all ${
                                        form.getValues("learningStyle") ===
                                        "Kinesthetic"
                                            ? "border-primary bg-primary/5"
                                            : "hover:border-gray-400"
                                    }`}
                                    onClick={() =>
                                        handleLearningStyleChange("Kinesthetic")
                                    }
                                >
                                    <div className="flex h-6 w-6 items-center justify-center">
                                        <Hammer className="text-primary h-4 w-4" />
                                    </div>
                                    <span className="text-sm font-medium">
                                        Kinesthetic
                                    </span>
                                </div>
                            </div>
                            <p className="text-muted-foreground text-xs">
                                Select the learning style that works best for
                                you
                            </p>
                            {form.formState.errors.learningStyle && (
                                <p className="text-sm text-red-500">
                                    {
                                        form.formState.errors.learningStyle
                                            .message
                                    }
                                </p>
                            )}
                        </div>

                        {role === "Mentor" && (
                            <div className="space-y-3">
                                <Label htmlFor="teachingApproach">
                                    Your Teaching Approach
                                </Label>
                                <div className="grid grid-cols-2 gap-2">
                                    <div
                                        className={`flex cursor-pointer items-center space-x-2 rounded-lg border p-3 transition-all ${
                                            form.getValues("teachingStyles") ===
                                            "handson"
                                                ? "border-primary bg-primary/5"
                                                : "hover:border-gray-400"
                                        }`}
                                        onClick={() =>
                                            handleTeachingStyleChange("handson")
                                        }
                                    >
                                        <div className="flex h-6 w-6 items-center justify-center">
                                            <Hammer className="text-primary h-4 w-4" />
                                        </div>
                                        <span className="text-sm font-medium">
                                            Hands-on Practice
                                        </span>
                                    </div>
                                    <div
                                        className={`flex cursor-pointer items-center space-x-2 rounded-lg border p-3 transition-all ${
                                            form.getValues("teachingStyles") ===
                                            "discussion"
                                                ? "border-primary bg-primary/5"
                                                : "hover:border-gray-400"
                                        }`}
                                        onClick={() =>
                                            handleTeachingStyleChange(
                                                "discussion",
                                            )
                                        }
                                    >
                                        <div className="flex h-6 w-6 items-center justify-center">
                                            <MessagesSquare className="text-primary h-4 w-4" />
                                        </div>
                                        <span className="text-sm font-medium">
                                            Discussion Base
                                        </span>
                                    </div>
                                    <div
                                        className={`flex cursor-pointer items-center space-x-2 rounded-lg border p-3 transition-all ${
                                            form.getValues("teachingStyles") ===
                                            "project"
                                                ? "border-primary bg-primary/5"
                                                : "hover:border-gray-400"
                                        }`}
                                        onClick={() =>
                                            handleTeachingStyleChange("project")
                                        }
                                    >
                                        <div className="flex h-6 w-6 items-center justify-center">
                                            <Lightbulb className="text-primary h-4 w-4" />
                                        </div>
                                        <span className="text-sm font-medium">
                                            Project Based
                                        </span>
                                    </div>
                                    <div
                                        className={`flex cursor-pointer items-center space-x-2 rounded-lg border p-3 transition-all ${
                                            form.getValues("teachingStyles") ===
                                            "lecture"
                                                ? "border-primary bg-primary/5"
                                                : "hover:border-gray-400"
                                        }`}
                                        onClick={() =>
                                            handleTeachingStyleChange("lecture")
                                        }
                                    >
                                        <div className="flex h-6 w-6 items-center justify-center">
                                            <GraduationCap className="text-primary h-4 w-4" />
                                        </div>
                                        <span className="text-sm font-medium">
                                            Lecture Style
                                        </span>
                                    </div>
                                </div>
                                <p className="text-muted-foreground text-xs">
                                    Select your preferred teaching approach as a
                                    mentor
                                </p>
                                {form.formState.errors.teachingStyles && (
                                    <p className="text-sm text-red-500">
                                        {
                                            form.formState.errors.teachingStyles
                                                ?.message
                                        }
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Session Preferences Block */}
            <div className="rounded-lg border p-6">
                <h3 className="mb-4 text-lg font-medium">
                    Session Preferences
                </h3>
                <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                    <div className="space-y-6">
                        <div className="space-y-3">
                            <Label htmlFor="sessionFrequency">
                                Preferred Session Frequency
                            </Label>
                            <Select
                                defaultValue={
                                    form.getValues("sessionFrequency") ||
                                    "Weekly"
                                }
                                onValueChange={(
                                    value: SessionFrequencyType,
                                ) => {
                                    form.setValue("sessionFrequency", value, {
                                        shouldValidate: true,
                                    });
                                    form.trigger("sessionFrequency");
                                }}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select frequency" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Weekly">
                                        Weekly
                                    </SelectItem>
                                    <SelectItem value="Every two weeks">
                                        Every two weeks
                                    </SelectItem>
                                    <SelectItem value="Monthly">
                                        Monthly
                                    </SelectItem>
                                    <SelectItem value="As Needed">
                                        As Needed
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                            <p className="text-muted-foreground text-xs">
                                How often would you like to have mentorship
                                sessions
                            </p>
                            {form.formState.errors.sessionFrequency && (
                                <p className="text-sm text-red-500">
                                    {
                                        form.formState.errors.sessionFrequency
                                            .message
                                    }
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="space-y-3">
                            <Label htmlFor="sessionDuration">
                                Preferred Session Duration
                            </Label>
                            <Select
                                defaultValue={
                                    form.getValues("duration") || "1 hour"
                                }
                                onValueChange={(value: SessionDurationType) => {
                                    form.setValue("duration", value, {
                                        shouldValidate: true,
                                    });
                                    form.trigger("duration");
                                }}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select duration" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="30 minutes">
                                        30 minutes
                                    </SelectItem>
                                    <SelectItem value="45 minutes">
                                        45 minutes
                                    </SelectItem>
                                    <SelectItem value="1 hour">
                                        1 hour
                                    </SelectItem>
                                    <SelectItem value="1.5 hours">
                                        1.5 hours
                                    </SelectItem>
                                    <SelectItem value="2 hours">
                                        2 hours
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                            <p className="text-muted-foreground text-xs">
                                How long would you like each session to be
                            </p>
                            {form.formState.errors.duration && (
                                <p className="text-sm text-red-500">
                                    {form.formState.errors.duration.message}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Privacy Settings Block */}
            <div className="rounded-lg border p-6">
                <h3 className="mb-4 text-lg font-medium">Privacy Settings</h3>
                <div className="space-y-3">
                    <Label>Privacy Options</Label>
                    <div className="space-y-2">
                        <div className="flex items-center space-x-2 rounded-lg border p-3">
                            <Checkbox
                                id="privateProfile"
                                checked={
                                    form.getValues("privacySettings")
                                        ?.isPrivateProfile
                                }
                                onCheckedChange={(checked) => {
                                    const currentSettings = form.getValues(
                                        "privacySettings",
                                    ) || {
                                        isPrivateProfile: false,
                                        isReceiveMessage: true,
                                        isNotification: true,
                                    };
                                    form.setValue(
                                        "privacySettings",
                                        {
                                            ...currentSettings,
                                            isPrivateProfile: checked === true,
                                        },
                                        {
                                            shouldValidate: true,
                                        },
                                    );
                                    form.trigger("privacySettings");
                                }}
                            />
                            <Label
                                htmlFor="privateProfile"
                                className="text-sm font-medium"
                            >
                                Make my profile private
                            </Label>
                        </div>

                        <div className="flex items-center space-x-2 rounded-lg border p-3">
                            <Checkbox
                                id="allowMessages"
                                checked={
                                    form.getValues("privacySettings")
                                        ?.isReceiveMessage
                                }
                                onCheckedChange={(checked) => {
                                    const currentSettings = form.getValues(
                                        "privacySettings",
                                    ) || {
                                        isPrivateProfile: false,
                                        allowMessages: true,
                                        isNotification: true,
                                    };
                                    form.setValue(
                                        "privacySettings",
                                        {
                                            ...currentSettings,
                                            isReceiveMessage: checked === true,
                                        },
                                        {
                                            shouldValidate: true,
                                        },
                                    );
                                    form.trigger("privacySettings");
                                }}
                            />
                            <Label
                                htmlFor="allowMessages"
                                className="text-sm font-medium"
                            >
                                Allow messages from other users
                            </Label>
                        </div>

                        <div className="flex items-center space-x-2 rounded-lg border p-3">
                            <Checkbox
                                id="receiveNotifications"
                                checked={
                                    form.getValues("privacySettings")
                                        ?.isNotification
                                }
                                onCheckedChange={(checked) => {
                                    const currentSettings = form.getValues(
                                        "privacySettings",
                                    ) || {
                                        isPrivateProfile: false,
                                        isReceiveMessage: true,
                                        isNotification: true,
                                    };
                                    form.setValue(
                                        "privacySettings",
                                        {
                                            ...currentSettings,
                                            isNotification: checked === true,
                                        },
                                        {
                                            shouldValidate: true,
                                        },
                                    );
                                    form.trigger("privacySettings");
                                }}
                            />
                            <Label
                                htmlFor="receiveNotifications"
                                className="text-sm font-medium"
                            >
                                Receive email notifications
                            </Label>
                        </div>
                    </div>
                    <p className="text-muted-foreground text-xs">
                        These settings can be changed later in your profile
                    </p>
                </div>
            </div>
        </form>
    );
}
