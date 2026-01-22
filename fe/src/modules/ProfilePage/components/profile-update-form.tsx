/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery } from "@tanstack/react-query";
import {
    BarChart4,
    BookOpen,
    Briefcase,
    Code,
    Database,
    Ear,
    Eye,
    GraduationCap,
    Hammer,
    Lightbulb,
    MessageSquare,
    MessagesSquare,
    Palette,
    Phone,
    Search,
    Users,
    Video,
    X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { UseFormReturn } from "react-hook-form";

import LoadingSpinner from "@/common/components/loading-spinner";
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/common/components/ui/avatar";
import { Button } from "@/common/components/ui/button";
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
import { Textarea } from "@/common/components/ui/textarea";

import { registerService } from "../../RegisterPage/services/registerServices";
import type { ProfileUpdateFormValues } from "../utils/schemas";

type ProfileUpdateFormProps = {
    form: UseFormReturn<ProfileUpdateFormValues>;
    avatarPreview: string | null;
    onAvatarChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    userRole: "Learner" | "Mentor";
    isDirty?: boolean;
    onReset?: () => void;
};

export const ProfileUpdateForm = ({
    form,
    avatarPreview,
    onAvatarChange,
    userRole,
    isDirty,
    onReset,
}: ProfileUpdateFormProps) => {
    const [selectedExpertises, setSelectedExpertises] = useState<string[]>([]);
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [photoError, setPhotoError] = useState<string | null>(null);

    const { data: expertises = [], isLoading: isLoadingExpertises } = useQuery({
        queryKey: ["expertises"],
        queryFn: async () => {
            const response = await registerService.getAllExpertises();
            return response.data;
        },
    });

    const { data: courseCategories = [], isLoading: isLoadingCategories } =
        useQuery({
            queryKey: ["course-categories"],
            queryFn: async () => {
                const response = await registerService.getAllCourseCategories();
                return response.data;
            },
        });

    useEffect(() => {
        const formExpertises = form.watch("expertises") || [];
        const formCategories = form.watch("courseCategoryIds") || [];
        setSelectedExpertises(formExpertises);
        setSelectedCategories(formCategories);
    }, [form]);

    const handleExpertiseToggle = (expertiseId: string) => {
        const newSelected = selectedExpertises.includes(expertiseId)
            ? selectedExpertises.filter((id) => id !== expertiseId)
            : [...selectedExpertises, expertiseId];

        setSelectedExpertises(newSelected);
        form.setValue("expertises", newSelected);
    };

    const handleCategoryToggle = (categoryId: string) => {
        const newSelected = selectedCategories.includes(categoryId)
            ? selectedCategories.filter((id) => id !== categoryId)
            : [...selectedCategories, categoryId];

        setSelectedCategories(newSelected);
        form.setValue("courseCategoryIds", newSelected);
    };

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        setPhotoError(null);

        if (file) {
            if (!file.type.startsWith("image/")) {
                setPhotoError("Image type is invalid, please upload again.");
                e.target.value = "";
                return;
            }

            if (file.size > 5 * 1024 * 1024) {
                setPhotoError("Image must be less than or equal to 5 MB.");
                e.target.value = "";
                return;
            }

            onAvatarChange(e);
        }
    };

    const getExpertiseIcon = (name: string) => {
        switch (name.toLowerCase()) {
            case "leadership":
                return Users;
            case "programming":
                return Code;
            case "design":
                return Palette;
            case "marketing":
                return BarChart4;
            case "data science":
                return Database;
            case "business":
                return Briefcase;
            case "project management":
                return GraduationCap;
            case "communication":
                return MessageSquare;
            default:
                return Lightbulb;
        }
    };

    const handleAvailabilityChange = (
        availability:
            | "Weekdays"
            | "Weekends"
            | "Mornings"
            | "Afternoons"
            | "Evenings",
    ) => {
        const currentAvailability = form.getValues("availability") || [];
        const updatedAvailability = currentAvailability.includes(availability)
            ? currentAvailability.filter((a) => a !== availability)
            : [...currentAvailability, availability];

        form.setValue("availability", updatedAvailability, {
            shouldValidate: true,
        });
    };

    const handleCommunicationChange = (
        method: "Video call" | "Audio call" | "Text chat",
    ) => {
        form.setValue("communicationPreference", method, {
            shouldValidate: true,
        });
    };

    const handleLearningStyleChange = (style: string) => {
        form.setValue("learningStyle", style, {
            shouldValidate: true,
        });
    };

    const handleTeachingStyleChange = (
        style: "handson" | "discussion" | "project" | "lecture",
    ) => {
        form.setValue("teachingStyles", style, {
            shouldValidate: true,
        });
    };

    const getCategoryName = (id: string) => {
        const category = courseCategories.find((cat: any) => cat.id === id);
        return category ? category.name : id;
    };

    const filteredCategories = useMemo(() => {
        return courseCategories.filter(
            (category: any) =>
                category.name
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase()) &&
                !selectedCategories.includes(category.id),
        );
    }, [courseCategories, searchTerm, selectedCategories]);

    const getBioCharCount = () => {
        const bio = form.watch("bio") || "";
        return bio.replace(/\r\n/g, "\n").trim().length;
    };

    const getProfessionalSkillsCharCount = () => {
        const skills = form.watch("professionalSkill") || "";
        return skills.replace(/\r\n/g, "\n").trim().length;
    };

    const getIndustryExperienceCharCount = () => {
        const experience = form.watch("experience") || "";
        return experience.replace(/\r\n/g, "\n").trim().length;
    };

    const getGoalsCharCount = () => {
        const goals = form.watch("goals") || "";
        return goals.replace(/\r\n/g, "\n").trim().length;
    };

    return (
        <div className="space-y-8">
            {/* Dirty State Indicator */}
            {isDirty && (
                <div className="flex items-center justify-between rounded-lg border border-orange-200 bg-orange-50 p-3">
                    <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-orange-500"></div>
                        <span className="text-sm text-orange-700">
                            You have unsaved changes
                        </span>
                    </div>
                    {onReset && (
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={onReset}
                            className="border-orange-300 text-orange-700 hover:bg-orange-100"
                        >
                            Reset Changes
                        </Button>
                    )}
                </div>
            )}

            {/* Profile Information Block */}
            <div className="rounded-lg border p-6">
                <h3 className="mb-4 text-lg font-medium">
                    Basic Profile Information
                </h3>
                <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                    <div className="space-y-6">
                        <div className="space-y-3">
                            <Label htmlFor="fullName">Full Name</Label>
                            <Input
                                id="fullName"
                                placeholder=""
                                {...form.register("fullName", {
                                    onChange: (e) => {
                                        const value = e.target.value;
                                        if (value.length > 200) {
                                            e.target.value = value.slice(
                                                0,
                                                200,
                                            );
                                        }
                                    },
                                })}
                            />
                            {form.formState.errors.fullName && (
                                <p className="text-sm text-red-500">
                                    {form.formState.errors.fullName.message}
                                </p>
                            )}
                        </div>

                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <Label htmlFor="bio">Bio</Label>
                                <span className="text-muted-foreground text-xs">
                                    {getBioCharCount()}/2000
                                </span>
                            </div>
                            <Textarea
                                id="bio"
                                placeholder="Tell us about yourself..."
                                className="field-sizing-fixed resize-none"
                                maxLength={2000}
                                rows={5}
                                {...form.register("bio", {
                                    onChange: (e) => {
                                        const value = e.target.value;
                                        const normalizedAndTrimmedValue = value
                                            .replace(/\r\n/g, "\n")
                                            .trim();
                                        if (
                                            normalizedAndTrimmedValue.length >
                                            2000
                                        ) {
                                            const normalizedValue =
                                                value.replace(/\r\n/g, "\n");
                                            let trimmedValue =
                                                normalizedValue.trim();
                                            if (trimmedValue.length > 2000) {
                                                trimmedValue =
                                                    trimmedValue.slice(0, 2000);
                                            }
                                            e.target.value = trimmedValue;
                                            form.setValue("bio", trimmedValue, {
                                                shouldValidate: true,
                                            });
                                        } else {
                                            form.setValue("bio", value, {
                                                shouldValidate: true,
                                            });
                                        }
                                    },
                                })}
                            />
                            {form.formState.errors.bio && (
                                <p className="text-sm text-red-500">
                                    {form.formState.errors.bio.message}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="space-y-3">
                            <Label>Profile Picture</Label>
                            <div className="flex flex-col items-center space-y-2">
                                <Avatar className="h-24 w-24">
                                    <AvatarImage src={avatarPreview || ""} />
                                    <AvatarFallback>
                                        {form
                                            .getValues("fullName")
                                            ?.charAt(0) || "U"}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="relative">
                                    <Input
                                        id="photo"
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleAvatarChange}
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() =>
                                            document
                                                .getElementById("photo")
                                                ?.click()
                                        }
                                    >
                                        Upload Photo
                                    </Button>
                                </div>
                                <p className="text-muted-foreground text-xs">
                                    Maximum file size: 5MB
                                </p>
                                {photoError && (
                                    <p className="text-sm text-red-500">
                                        {photoError}
                                    </p>
                                )}
                                {form.formState.errors.photo && (
                                    <p className="text-sm text-red-500">
                                        {String(
                                            form.formState.errors.photo.message,
                                        )}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Expertise Block */}
            <div className="rounded-lg border p-6">
                <h3 className="mb-4 text-lg font-medium">Expertise & Skills</h3>
                <div className="space-y-6">
                    <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                        <div className="space-y-3">
                            <Label>Areas of Expertise</Label>
                            {isLoadingExpertises ? (
                                <div className="flex items-center justify-center rounded-lg border p-8">
                                    <LoadingSpinner size="sm" />
                                    <span className="text-muted-foreground ml-2 text-sm">
                                        Loading areas of expertise...
                                    </span>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 gap-2">
                                    {expertises.map((expertise: any) => {
                                        const Icon = getExpertiseIcon(
                                            expertise.name,
                                        );
                                        return (
                                            <div
                                                key={expertise.id}
                                                className={`flex cursor-pointer items-center rounded-lg border p-2 transition-all ${
                                                    selectedExpertises.includes(
                                                        expertise.id,
                                                    )
                                                        ? "border-primary bg-primary/5"
                                                        : "hover:border-gray-400"
                                                }`}
                                                onClick={() =>
                                                    handleExpertiseToggle(
                                                        expertise.id,
                                                    )
                                                }
                                            >
                                                <div className="flex h-6 w-6 items-center justify-center">
                                                    <Icon className="text-primary h-4 w-4" />
                                                </div>
                                                <span className="ml-2 text-sm">
                                                    {expertise.name}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                            <p className="text-muted-foreground text-xs">
                                Select areas that best represent your expertise
                            </p>
                            {form.formState.errors.expertises && (
                                <p className="text-sm text-red-500">
                                    {form.formState.errors.expertises.message}
                                </p>
                            )}
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <Label>Professional Skills</Label>
                                    <span className="text-muted-foreground text-xs">
                                        {getProfessionalSkillsCharCount()}/200
                                    </span>
                                </div>
                                <Textarea
                                    id="professionalSkills"
                                    placeholder="e.g. JavaScript, Project Management, Research"
                                    className="field-sizing-fixed resize-none"
                                    rows={3}
                                    maxLength={200}
                                    {...form.register("professionalSkill", {
                                        onChange: (e) => {
                                            const value = e.target.value;
                                            const normalizedAndTrimmedValue =
                                                value
                                                    .replace(/\r\n/g, "\n")
                                                    .trim();
                                            if (
                                                normalizedAndTrimmedValue.length >
                                                200
                                            ) {
                                                const normalizedValue =
                                                    value.replace(
                                                        /\r\n/g,
                                                        "\n",
                                                    );
                                                let trimmedValue =
                                                    normalizedValue.trim();
                                                if (trimmedValue.length > 200) {
                                                    trimmedValue =
                                                        trimmedValue.slice(
                                                            0,
                                                            200,
                                                        );
                                                }
                                                e.target.value = trimmedValue;
                                                form.setValue(
                                                    "professionalSkill",
                                                    trimmedValue,
                                                    {
                                                        shouldValidate: true,
                                                    },
                                                );
                                            } else {
                                                form.setValue(
                                                    "professionalSkill",
                                                    value,
                                                    {
                                                        shouldValidate: true,
                                                    },
                                                );
                                            }
                                        },
                                    })}
                                />
                                {form.formState.errors.professionalSkill && (
                                    <p className="text-sm text-red-500">
                                        {
                                            form.formState.errors
                                                .professionalSkill.message
                                        }
                                    </p>
                                )}
                            </div>

                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <Label htmlFor="industryExperience">
                                        Industry Experience
                                    </Label>
                                    <span className="text-muted-foreground text-xs">
                                        {getIndustryExperienceCharCount()}/200
                                    </span>
                                </div>
                                <Textarea
                                    id="industryExperience"
                                    placeholder="e.g. 5 years in Tech, 3 years in Finance"
                                    className="field-sizing-fixed resize-none"
                                    rows={3}
                                    maxLength={200}
                                    {...form.register("experience", {
                                        onChange: (e) => {
                                            const value = e.target.value;
                                            const normalizedAndTrimmedValue =
                                                value
                                                    .replace(/\r\n/g, "\n")
                                                    .trim();
                                            if (
                                                normalizedAndTrimmedValue.length >
                                                200
                                            ) {
                                                const normalizedValue =
                                                    value.replace(
                                                        /\r\n/g,
                                                        "\n",
                                                    );
                                                let trimmedValue =
                                                    normalizedValue.trim();
                                                if (trimmedValue.length > 200) {
                                                    trimmedValue =
                                                        trimmedValue.slice(
                                                            0,
                                                            200,
                                                        );
                                                }
                                                e.target.value = trimmedValue;
                                                form.setValue(
                                                    "experience",
                                                    trimmedValue,
                                                    {
                                                        shouldValidate: true,
                                                    },
                                                );
                                            } else {
                                                form.setValue(
                                                    "experience",
                                                    value,
                                                    {
                                                        shouldValidate: true,
                                                    },
                                                );
                                            }
                                        },
                                    })}
                                />
                                {form.formState.errors.experience && (
                                    <p className="text-sm text-red-500">
                                        {
                                            form.formState.errors.experience
                                                .message
                                        }
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1">
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <Label htmlFor="goals">Goals</Label>
                                <span className="text-muted-foreground text-xs">
                                    {getGoalsCharCount()}/200
                                </span>
                            </div>
                            <Textarea
                                id="goals"
                                placeholder="What do you want to achieve?"
                                className="field-sizing-fixed resize-none"
                                rows={3}
                                maxLength={200}
                                {...form.register("goals", {
                                    onChange: (e) => {
                                        const value = e.target.value;
                                        const normalizedAndTrimmedValue = value
                                            .replace(/\r\n/g, "\n")
                                            .trim();
                                        if (
                                            normalizedAndTrimmedValue.length >
                                            200
                                        ) {
                                            const normalizedValue =
                                                value.replace(/\r\n/g, "\n");
                                            let trimmedValue =
                                                normalizedValue.trim();
                                            if (trimmedValue.length > 200) {
                                                trimmedValue =
                                                    trimmedValue.slice(0, 200);
                                            }
                                            e.target.value = trimmedValue;
                                            form.setValue(
                                                "goals",
                                                trimmedValue,
                                                {
                                                    shouldValidate: true,
                                                },
                                            );
                                        } else {
                                            form.setValue("goals", value, {
                                                shouldValidate: true,
                                            });
                                        }
                                    },
                                })}
                            />
                            {form.formState.errors.goals && (
                                <p className="text-sm text-red-500">
                                    {form.formState.errors.goals.message}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Communication & Availability Block */}
            <div className="rounded-lg border p-6">
                <h3 className="mb-4 text-lg font-medium">
                    Communication & Availability
                </h3>
                <div className="space-y-6">
                    <div className="space-y-3">
                        <Label htmlFor="communicationMethod">
                            Preferred Communication Method
                        </Label>
                        <div className="grid grid-cols-3 gap-2">
                            <div
                                className={`flex cursor-pointer items-center space-x-2 rounded-lg border p-3 transition-all ${
                                    form.getValues(
                                        "communicationPreference",
                                    ) === "Video call"
                                        ? "border-primary bg-primary/5"
                                        : "hover:border-gray-400"
                                }`}
                                onClick={() =>
                                    handleCommunicationChange("Video call")
                                }
                            >
                                <div className="flex h-6 w-6 items-center justify-center">
                                    <Video className="text-primary h-4 w-4" />
                                </div>
                                <span className="text-sm font-medium">
                                    Video Call
                                </span>
                            </div>
                            <div
                                className={`flex cursor-pointer items-center space-x-2 rounded-lg border p-3 transition-all ${
                                    form.getValues(
                                        "communicationPreference",
                                    ) === "Audio call"
                                        ? "border-primary bg-primary/5"
                                        : "hover:border-gray-400"
                                }`}
                                onClick={() =>
                                    handleCommunicationChange("Audio call")
                                }
                            >
                                <div className="flex h-6 w-6 items-center justify-center">
                                    <Phone className="text-primary h-4 w-4" />
                                </div>
                                <span className="text-sm font-medium">
                                    Audio Call
                                </span>
                            </div>
                            <div
                                className={`flex cursor-pointer items-center space-x-2 rounded-lg border p-3 transition-all ${
                                    form.getValues(
                                        "communicationPreference",
                                    ) === "Text chat"
                                        ? "border-primary bg-primary/5"
                                        : "hover:border-gray-400"
                                }`}
                                onClick={() =>
                                    handleCommunicationChange("Text chat")
                                }
                            >
                                <div className="flex h-6 w-6 items-center justify-center">
                                    <MessageSquare className="text-primary h-4 w-4" />
                                </div>
                                <span className="text-sm font-medium">
                                    Text Chat
                                </span>
                            </div>
                        </div>
                        <p className="text-muted-foreground text-xs">
                            Select your preferred method for mentorship sessions
                        </p>
                        {form.formState.errors.communicationPreference && (
                            <p className="text-sm text-red-500">
                                {
                                    form.formState.errors
                                        .communicationPreference.message
                                }
                            </p>
                        )}
                    </div>

                    <div className="space-y-3">
                        <Label>Your Availability</Label>
                        <div className="grid grid-cols-3 gap-2">
                            <div
                                className={`flex cursor-pointer items-center space-x-2 rounded-lg border p-3 transition-all ${
                                    (
                                        form.getValues("availability") || []
                                    ).includes("Weekdays")
                                        ? "border-primary bg-primary/5"
                                        : "hover:border-gray-400"
                                }`}
                                onClick={() =>
                                    handleAvailabilityChange("Weekdays")
                                }
                            >
                                <span className="text-sm font-medium">
                                    Weekdays
                                </span>
                            </div>
                            <div
                                className={`flex cursor-pointer items-center space-x-2 rounded-lg border p-3 transition-all ${
                                    (
                                        form.getValues("availability") || []
                                    ).includes("Weekends")
                                        ? "border-primary bg-primary/5"
                                        : "hover:border-gray-400"
                                }`}
                                onClick={() =>
                                    handleAvailabilityChange("Weekends")
                                }
                            >
                                <span className="text-sm font-medium">
                                    Weekends
                                </span>
                            </div>
                            <div
                                className={`flex cursor-pointer items-center space-x-2 rounded-lg border p-3 transition-all ${
                                    (
                                        form.getValues("availability") || []
                                    ).includes("Mornings")
                                        ? "border-primary bg-primary/5"
                                        : "hover:border-gray-400"
                                }`}
                                onClick={() =>
                                    handleAvailabilityChange("Mornings")
                                }
                            >
                                <span className="text-sm font-medium">
                                    Mornings
                                </span>
                            </div>
                            <div
                                className={`flex cursor-pointer items-center space-x-2 rounded-lg border p-3 transition-all ${
                                    (
                                        form.getValues("availability") || []
                                    ).includes("Afternoons")
                                        ? "border-primary bg-primary/5"
                                        : "hover:border-gray-400"
                                }`}
                                onClick={() =>
                                    handleAvailabilityChange("Afternoons")
                                }
                            >
                                <span className="text-sm font-medium">
                                    Afternoons
                                </span>
                            </div>
                            <div
                                className={`flex cursor-pointer items-center space-x-2 rounded-lg border p-3 transition-all ${
                                    (
                                        form.getValues("availability") || []
                                    ).includes("Evenings")
                                        ? "border-primary bg-primary/5"
                                        : "hover:border-gray-400"
                                }`}
                                onClick={() =>
                                    handleAvailabilityChange("Evenings")
                                }
                            >
                                <span className="text-sm font-medium">
                                    Evenings
                                </span>
                            </div>
                        </div>
                        <p className="text-muted-foreground text-xs">
                            Select when you're typically available for sessions
                        </p>
                        {form.formState.errors.availability && (
                            <p className="text-sm text-red-500">
                                {form.formState.errors.availability.message}
                            </p>
                        )}
                    </div>
                </div>
            </div>

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
                                    {isLoadingCategories ? (
                                        <div className="flex w-full items-center justify-center py-2">
                                            <LoadingSpinner size="sm" />
                                            <span className="text-muted-foreground ml-2 text-sm">
                                                Loading topics...
                                            </span>
                                        </div>
                                    ) : (
                                        <>
                                            {selectedCategories.map(
                                                (categoryId) => (
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
                                                            onClick={() =>
                                                                handleCategoryToggle(
                                                                    categoryId,
                                                                )
                                                            }
                                                        >
                                                            <X className="h-3 w-3" />
                                                        </button>
                                                    </div>
                                                ),
                                            )}
                                            {selectedCategories.length ===
                                                0 && (
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
                                        onValueChange={(value) =>
                                            handleCategoryToggle(value)
                                        }
                                    >
                                        <SelectTrigger className="h-8 w-full">
                                            <SelectValue placeholder="Add more topics..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <div className="top-0 border-b px-2 py-2">
                                                <div className="flex items-center gap-2 rounded border px-1 py-1">
                                                    <Search className="text-muted-foreground h-4 w-4" />
                                                    <Input
                                                        key="search-input"
                                                        className="h-7 border-0 px-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                                                        placeholder="Search topics..."
                                                        value={searchTerm}
                                                        onChange={(e) => {
                                                            e.stopPropagation();
                                                            setSearchTerm(
                                                                e.target.value,
                                                            );
                                                        }}
                                                        onKeyDown={(e) => {
                                                            e.stopPropagation();
                                                        }}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                        }}
                                                        onFocus={(e) => {
                                                            e.stopPropagation();
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                            {filteredCategories.length > 0 ? (
                                                filteredCategories.map(
                                                    (category: any) => (
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

                        {userRole === "Mentor" && (
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
                                value={form.getValues("sessionFrequency") || ""}
                                onValueChange={(
                                    value:
                                        | "Weekly"
                                        | "Every two weeks"
                                        | "Monthly"
                                        | "As Needed",
                                ) => {
                                    form.setValue("sessionFrequency", value, {
                                        shouldValidate: true,
                                    });
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
                                value={form.getValues("duration") || ""}
                                onValueChange={(
                                    value:
                                        | "30 minutes"
                                        | "45 minutes"
                                        | "1 hour"
                                        | "1.5 hours"
                                        | "2 hours",
                                ) => {
                                    form.setValue("duration", value, {
                                        shouldValidate: true,
                                    });
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
                                checked={form.getValues("isPrivateProfile")}
                                onCheckedChange={(checked) => {
                                    form.setValue(
                                        "isPrivateProfile",
                                        checked === true,
                                        {
                                            shouldValidate: true,
                                        },
                                    );
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
                                checked={form.getValues("isReceiveMessage")}
                                onCheckedChange={(checked) => {
                                    form.setValue(
                                        "isReceiveMessage",
                                        checked === true,
                                        {
                                            shouldValidate: true,
                                        },
                                    );
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
                                checked={form.getValues("isNotification")}
                                onCheckedChange={(checked) => {
                                    form.setValue(
                                        "isNotification",
                                        checked === true,
                                        {
                                            shouldValidate: true,
                                        },
                                    );
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
        </div>
    );
};
