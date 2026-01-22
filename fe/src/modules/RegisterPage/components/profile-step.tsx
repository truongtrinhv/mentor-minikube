import {
    BarChart4,
    Briefcase,
    Code,
    Database,
    GraduationCap,
    Lightbulb,
    MessageSquare,
    Palette,
    Phone,
    Users,
    Video,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import LoadingSpinner from "@/common/components/loading-spinner";
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/common/components/ui/avatar";
import { Button } from "@/common/components/ui/button";
import { Input } from "@/common/components/ui/input";
import { Label } from "@/common/components/ui/label";
import { Textarea } from "@/common/components/ui/textarea";

import { registerService } from "../services/registerServices";
import { type Expertise, type ProfileStepProps } from "../types";

export function ProfileStep({
    form,
    avatarPreview,
    onAvatarChange,
    hideRoleSelection = false,
}: ProfileStepProps) {
    const [expertises, setExpertises] = useState<Expertise[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [previousRole, setPreviousRole] = useState<"Learner" | "Mentor">(
        form.getValues("role") || "Learner",
    );
    const [photoError, setPhotoError] = useState<string | null>(null);

    useEffect(() => {
        const fetchExpertises = async () => {
            try {
                setIsLoading(true);
                const response = await registerService.getAllExpertises();
                if (response && response.data) {
                    setExpertises(response.data);
                } else {
                    setExpertises([]);
                }
            } catch (error) {
                console.error("Failed to fetch expertises:", error);
                toast.error(
                    "Failed to fetch areas of expertise. Please try again!",
                );
            } finally {
                setIsLoading(false);
            }
        };

        fetchExpertises();
    }, []);

    useEffect(() => {
        const subscription = form.watch((value, { name }) => {
            if (name === "role" && value.role !== previousRole) {
                setPreviousRole(value.role || "Learner");
            }
        });

        return () => subscription.unsubscribe();
    }, [form, previousRole]);

    const handleExpertiseChange = (expertiseId: string) => {
        const currentExpertise = form.getValues("expertises") || [];
        const updatedExpertise = currentExpertise.includes(expertiseId)
            ? currentExpertise.filter((id) => id !== expertiseId)
            : [...currentExpertise, expertiseId];

        form.setValue("expertises", updatedExpertise, {
            shouldValidate: true,
        });
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
        const currentMethod = form.getValues("communicationPreference");
        if (currentMethod === method) {
            form.setValue("communicationPreference", "Video call", {
                shouldValidate: true,
            });
        } else {
            form.setValue("communicationPreference", method, {
                shouldValidate: true,
            });
        }
    };

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
        <form className="space-y-8">
            {!hideRoleSelection && (
                <div className="mb-6 pt-2">
                    <h3 className="mb-2 text-lg font-medium">
                        I am joining as:
                    </h3>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div
                            className={`flex cursor-pointer flex-col items-center rounded-lg border p-4 text-center transition-all ${
                                form.getValues("role") === "Learner"
                                    ? "border-primary bg-primary/5"
                                    : "hover:border-gray-400"
                            }`}
                            onClick={() => {
                                form.setValue("role", "Learner", {
                                    shouldValidate: true,
                                });
                            }}
                        >
                            <div className="mb-2 flex h-16 w-16 items-center justify-center">
                                <GraduationCap className="text-primary h-12 w-12" />
                            </div>
                            <h4 className="text-lg font-medium">Learner</h4>
                            <p className="text-muted-foreground text-sm">
                                I want to find mentors
                            </p>
                        </div>

                        <div
                            className={`flex cursor-pointer flex-col items-center rounded-lg border p-4 text-center transition-all ${
                                form.getValues("role") === "Mentor"
                                    ? "border-primary bg-primary/5"
                                    : "hover:border-gray-400"
                            }`}
                            onClick={() => {
                                form.setValue("role", "Mentor", {
                                    shouldValidate: true,
                                });
                            }}
                        >
                            <div className="mb-2 flex h-16 w-16 items-center justify-center">
                                <Users className="text-primary h-12 w-12" />
                            </div>
                            <h4 className="text-lg font-medium">Mentor</h4>
                            <p className="text-muted-foreground text-sm">
                                I want to mentor others
                            </p>
                        </div>
                    </div>
                    {form.formState.errors.role && (
                        <p className="mt-2 text-sm text-red-500">
                            {form.formState.errors.role.message}
                        </p>
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
                                rows={5}
                                maxLength={2000}
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
                                        accept=".jpg,.jpeg,.png,.gif,.webp,.svg"
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
                                        {form.formState.errors.photo.message?.toString()}
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
                    {/* Expertise and Skills row */}
                    <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                        <div className="space-y-3">
                            <Label>Areas of Expertise</Label>
                            {isLoading ? (
                                <div className="flex items-center justify-center rounded-lg border p-8">
                                    <LoadingSpinner size="sm" />
                                    <span className="text-muted-foreground ml-2 text-sm">
                                        Loading areas of expertise...
                                    </span>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 gap-2">
                                    {expertises.map((expertise) => {
                                        const Icon = getExpertiseIcon(
                                            expertise.name,
                                        );
                                        return (
                                            <div
                                                key={expertise.id}
                                                className={`flex cursor-pointer items-center rounded-lg border p-2 transition-all ${
                                                    (
                                                        form.getValues(
                                                            "expertises",
                                                        ) || []
                                                    ).includes(expertise.id)
                                                        ? "border-primary bg-primary/5"
                                                        : "hover:border-gray-400"
                                                }`}
                                                onClick={() =>
                                                    handleExpertiseChange(
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

                    {/* Goals row */}
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
                                rows={5}
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

            {/* Availability Block */}
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
        </form>
    );
}
