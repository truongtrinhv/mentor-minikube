/* eslint-disable @typescript-eslint/no-explicit-any */
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import LoadingSpinner from "@/common/components/loading-spinner";
import { Button } from "@/common/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/common/components/ui/card";
import { Input } from "@/common/components/ui/input";
import { Label } from "@/common/components/ui/label";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/common/components/ui/tabs";

import { ConfirmationDialog } from "./components/confirmation-dialog";
import { ProfileUpdateForm } from "./components/profile-update-form";
import { useAuth } from "./hooks/use-auth";
import type { EditProfileRequest } from "./types";
import {
    availabilityFromEnum,
    availabilityToEnum,
    communicationFromEnum,
    communicationToEnum,
    durationFromEnum,
    durationToEnum,
    learningStyleFromEnum,
    learningStyleToEnum,
    sessionFrequencyFromEnum,
    sessionFrequencyToEnum,
    teachingStyleFromEnum,
    teachingStyleToEnum,
} from "./types";
import {
    type AccountUpdateFormValues,
    type ProfileUpdateFormValues,
    accountUpdateSchema,
    profileUpdateSchema,
} from "./utils/schemas";

export default function ProfilePage() {
    const [activeTab, setActiveTab] = useState("profile");
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [userRole, setUserRole] = useState<"Learner" | "Mentor">("Learner");

    const [initialProfileValues, setInitialProfileValues] =
        useState<ProfileUpdateFormValues | null>(null);
    const [initialAccountValues, setInitialAccountValues] =
        useState<AccountUpdateFormValues | null>(null);
    const [isProfileDirty, setIsProfileDirty] = useState(false);
    const [isAccountDirty, setIsAccountDirty] = useState(false);

    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [pendingTab, setPendingTab] = useState<string | null>(null);

    const {
        userDetail,
        isLoadingUserDetail,
        editProfile,
        isEditingProfile,
        updatePassword,
        isUpdatingPassword,
    } = useAuth();

    const profileForm = useForm<ProfileUpdateFormValues>({
        resolver: zodResolver(profileUpdateSchema),
        defaultValues: {
            fullName: "",
            bio: "",
            photo: undefined,
            expertises: [],
            professionalSkill: "",
            experience: "",
            goals: "",
            availability: [],
            communicationPreference: undefined,
            courseCategoryIds: [],
            sessionFrequency: undefined,
            duration: undefined,
            learningStyle: null,
            teachingStyles: null,
            isPrivateProfile: false,
            isReceiveMessage: true,
            isNotification: true,
        },
    });

    const accountForm = useForm<AccountUpdateFormValues>({
        resolver: zodResolver(accountUpdateSchema),
        defaultValues: {
            email: "",
            currentPassword: "",
            password: "",
            confirmPassword: "",
        },
    });

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event: ProgressEvent<FileReader>) => {
                const result = event.target?.result as string;
                setAvatarPreview(result);
                profileForm.setValue("photo", file);
            };
            reader.readAsDataURL(file);
        }
    };

    useEffect(() => {
        if (userDetail) {
            setUserRole(userDetail.role === 1 ? "Mentor" : "Learner");

            setAvatarPreview(userDetail.avatarUrl || null);

            const accountInitialValues = {
                email: userDetail.email,
                currentPassword: "",
                password: "",
                confirmPassword: "",
            };

            accountForm.reset(accountInitialValues);
            setInitialAccountValues(accountInitialValues);

            const profileInitialValues = {
                fullName: userDetail.fullName,
                bio: userDetail.bio || "",
                photo: undefined,
                expertises:
                    userDetail.expertises?.map(
                        (e: { id: string; name: string }) => e.id,
                    ) || [],
                professionalSkill: userDetail.professionalSkill || "",
                experience: userDetail.experience || "",
                goals: userDetail.goals || "",
                availability: (userDetail.availability?.map(
                    availabilityFromEnum,
                ) as (
                    | "Weekdays"
                    | "Weekends"
                    | "Mornings"
                    | "Afternoons"
                    | "Evenings"
                )[]) || ["Weekdays"],
                communicationPreference:
                    userDetail.communicationPreference !== undefined
                        ? (communicationFromEnum(
                              userDetail.communicationPreference,
                          ) as "Video call" | "Audio call" | "Text chat")
                        : "Video call",
                courseCategoryIds:
                    userDetail.courseCategories?.map(
                        (c: { id: string; name: string }) => c.id,
                    ) || [],
                sessionFrequency:
                    userDetail.sessionFrequency !== undefined
                        ? (sessionFrequencyFromEnum(
                              userDetail.sessionFrequency,
                          ) as
                              | "Weekly"
                              | "Every two weeks"
                              | "Monthly"
                              | "As Needed")
                        : "Weekly",
                duration:
                    userDetail.duration !== undefined
                        ? (durationFromEnum(userDetail.duration) as
                              | "30 minutes"
                              | "45 minutes"
                              | "1 hour"
                              | "1.5 hours"
                              | "2 hours")
                        : "1 hour",
                learningStyle:
                    userDetail.learningStyle !== undefined
                        ? (learningStyleFromEnum(userDetail.learningStyle) as
                              | "Visual"
                              | "Auditory"
                              | "Reading/Writing"
                              | "Kinesthetic")
                        : "Visual",
                teachingStyles:
                    userDetail.teachingStyles !== undefined
                        ? (teachingStyleFromEnum(userDetail.teachingStyles) as
                              | "handson"
                              | "discussion"
                              | "project"
                              | "lecture")
                        : userDetail.role === 1
                          ? "handson"
                          : null,
                isPrivateProfile: userDetail.isPrivateProfile || false,
                isReceiveMessage:
                    userDetail.isReceiveMessage !== undefined
                        ? userDetail.isReceiveMessage
                        : true,
                isNotification:
                    userDetail.isNotification !== undefined
                        ? userDetail.isNotification
                        : true,
            };

            profileForm.reset(profileInitialValues);
            setInitialProfileValues(profileInitialValues);
        }
    }, [userDetail, accountForm, profileForm]);

    const areArraysEqual = (arr1: any[], arr2: any[]) => {
        if (arr1.length !== arr2.length) return false;
        return arr1.every((item, index) => item === arr2[index]);
    };

    const isProfileValuesDifferent = (
        current: ProfileUpdateFormValues,
        initial: ProfileUpdateFormValues,
    ) => {
        if (current.fullName !== initial.fullName) return true;
        if (current.bio !== initial.bio) return true;
        if (current.professionalSkill !== initial.professionalSkill)
            return true;
        if (current.experience !== initial.experience) return true;
        if (current.goals !== initial.goals) return true;
        if (current.communicationPreference !== initial.communicationPreference)
            return true;
        if (current.sessionFrequency !== initial.sessionFrequency) return true;
        if (current.duration !== initial.duration) return true;
        if (current.learningStyle !== initial.learningStyle) return true;
        if (current.teachingStyles !== initial.teachingStyles) return true;
        if (current.isPrivateProfile !== initial.isPrivateProfile) return true;
        if (current.isReceiveMessage !== initial.isReceiveMessage) return true;
        if (current.isNotification !== initial.isNotification) return true;
        if (current.photo !== initial.photo) return true;

        if (!areArraysEqual(current.expertises || [], initial.expertises || []))
            return true;
        if (
            !areArraysEqual(
                current.courseCategoryIds || [],
                initial.courseCategoryIds || [],
            )
        )
            return true;
        if (
            !areArraysEqual(
                current.availability || [],
                initial.availability || [],
            )
        )
            return true;

        return false;
    };

    const isAccountValuesDifferent = (current: AccountUpdateFormValues) => {
        const hasCurrentPassword = !!(
            current.currentPassword && current.currentPassword.trim() !== ""
        );
        const hasNewPassword = !!(
            current.password && current.password.trim() !== ""
        );
        const hasConfirmPassword = !!(
            current.confirmPassword && current.confirmPassword.trim() !== ""
        );

        return hasCurrentPassword || hasNewPassword || hasConfirmPassword;
    };

    const profileValues = profileForm.watch();
    const accountValues = accountForm.watch();

    useEffect(() => {
        if (initialProfileValues) {
            setIsProfileDirty(
                isProfileValuesDifferent(profileValues, initialProfileValues),
            );
        }
    }, [profileValues, initialProfileValues]);

    useEffect(() => {
        if (initialAccountValues) {
            setIsAccountDirty(isAccountValuesDifferent(accountValues));
        }
    }, [accountValues, initialAccountValues]);

    const saveProfileChanges = async () => {
        try {
            await profileForm.trigger();
            if (!profileForm.formState.isValid) {
                return;
            }

            const formData = profileForm.getValues();
            const editData: EditProfileRequest = {
                fullName: formData.fullName,
                bio: formData.bio,
                professionalSkill: formData.professionalSkill,
                experience: formData.experience,
                goals: formData.goals,
                expertises: formData.expertises,
                courseCategoryIds: formData.courseCategoryIds,
                avatarUrl: formData.photo,
                availability: formData.availability?.map(availabilityToEnum),
                communicationPreference: formData.communicationPreference
                    ? communicationToEnum(formData.communicationPreference)
                    : undefined,
                sessionFrequency: formData.sessionFrequency
                    ? sessionFrequencyToEnum(formData.sessionFrequency)
                    : undefined,
                duration: formData.duration
                    ? durationToEnum(formData.duration)
                    : undefined,
                learningStyle: formData.learningStyle
                    ? learningStyleToEnum(formData.learningStyle)
                    : undefined,
                teachingStyles: formData.teachingStyles
                    ? teachingStyleToEnum(formData.teachingStyles)
                    : undefined,
                isNotification: formData.isNotification,
                isReceiveMessage: formData.isReceiveMessage,
                isPrivateProfile: formData.isPrivateProfile,
            };

            editProfile(editData);

            setInitialProfileValues(formData);
            setIsProfileDirty(false);
        } catch (error) {
            console.error("Failed to save profile changes:", error);
        }
    };

    const saveAccountChanges = async () => {
        try {
            const currentPasswordValue =
                accountForm.getValues("currentPassword");
            const passwordValue = accountForm.getValues("password");
            const confirmPasswordValue =
                accountForm.getValues("confirmPassword");

            const hasPasswordChange =
                passwordValue && passwordValue.trim() !== "";
            const hasCurrentPassword =
                currentPasswordValue && currentPasswordValue.trim() !== "";

            if (hasCurrentPassword && !hasPasswordChange) {
                toast.error(
                    "Please enter a new password or clear the current password field",
                );
                return;
            }

            if (hasPasswordChange && !hasCurrentPassword) {
                toast.error("Current password is required to change password");
                return;
            }

            if (!hasPasswordChange && !hasCurrentPassword) {
                return;
            }

            await accountForm.trigger();
            if (!accountForm.formState.isValid) {
                return;
            }

            updatePassword({
                currentPassword: currentPasswordValue!,
                password: passwordValue!,
                confirmPassword: confirmPasswordValue!,
            });

            const resetValues = {
                email: accountForm.getValues("email"),
                currentPassword: "",
                password: "",
                confirmPassword: "",
            };

            accountForm.reset(resetValues);
            setInitialAccountValues(resetValues);
            setIsAccountDirty(false);
        } catch (error) {
            console.error("Failed to save account changes:", error);
        }
    };

    const resetProfileToInitial = () => {
        if (initialProfileValues) {
            profileForm.reset(initialProfileValues);
            setAvatarPreview(userDetail?.avatarUrl || null);
            setIsProfileDirty(false);
        }
    };

    const resetAccountToInitial = () => {
        if (initialAccountValues) {
            accountForm.reset(initialAccountValues);
            setIsAccountDirty(false);
        }
    };

    const handleTabChange = (newTab: string) => {
        const currentTab = activeTab;
        const hasUnsavedChanges =
            (currentTab === "profile" && isProfileDirty) ||
            (currentTab === "account" && isAccountDirty);

        if (hasUnsavedChanges) {
            setPendingTab(newTab);
            setShowConfirmDialog(true);
            return;
        }

        setActiveTab(newTab);
    };

    const handleConfirmTabChange = () => {
        if (pendingTab) {
            const currentTab = activeTab;

            if (currentTab === "profile") {
                resetProfileToInitial();
            } else if (currentTab === "account") {
                resetAccountToInitial();
            }

            setActiveTab(pendingTab);
            setPendingTab(null);
        }
        setShowConfirmDialog(false);
    };

    if (isLoadingUserDetail) {
        return (
            <div className="container mx-auto py-10">
                <div className="flex h-[60vh] items-center justify-center">
                    <LoadingSpinner size="lg" text="Loading profile..." />
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-10">
            <Card className="mx-auto w-full max-w-4xl">
                <CardHeader>
                    <CardTitle className="text-2xl">Profile Settings</CardTitle>
                    <CardDescription>
                        Manage your account settings and profile information
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs value={activeTab} onValueChange={handleTabChange}>
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="profile" className="relative">
                                Profile & Preferences
                                {isProfileDirty && (
                                    <div className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-orange-500"></div>
                                )}
                            </TabsTrigger>
                            <TabsTrigger value="account" className="relative">
                                Account
                                {isAccountDirty && (
                                    <div className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-orange-500"></div>
                                )}
                            </TabsTrigger>
                        </TabsList>

                        {/* Profile & Preferences Tab */}
                        <TabsContent value="profile" className="py-4">
                            <div className="space-y-4">
                                <ProfileUpdateForm
                                    form={profileForm}
                                    avatarPreview={avatarPreview}
                                    onAvatarChange={handleAvatarChange}
                                    userRole={userRole}
                                    isDirty={isProfileDirty}
                                    onReset={resetProfileToInitial}
                                />
                                <div className="flex justify-end">
                                    <Button
                                        onClick={saveProfileChanges}
                                        disabled={
                                            isEditingProfile || !isProfileDirty
                                        }
                                    >
                                        {isEditingProfile ? (
                                            <div className="flex items-center justify-center gap-2">
                                                <Loader2 className="animate-spin" />
                                                <span>Saving...</span>
                                            </div>
                                        ) : (
                                            "Save changes"
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </TabsContent>

                        {/* Account Tab */}
                        <TabsContent value="account" className="py-4">
                            <div className="space-y-4">
                                {isAccountDirty && (
                                    <div className="flex items-center justify-between rounded-lg border border-orange-200 bg-orange-50 p-3">
                                        <div className="flex items-center gap-2">
                                            <div className="h-2 w-2 rounded-full bg-orange-500"></div>
                                            <span className="text-sm text-orange-700">
                                                You have unsaved password
                                                changes
                                            </span>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={resetAccountToInitial}
                                            className="border-orange-300 text-orange-700 hover:bg-orange-100"
                                        >
                                            Reset Changes
                                        </Button>
                                    </div>
                                )}

                                <div>
                                    <div className="rounded-lg border p-6">
                                        <div className="space-y-6">
                                            <div className="space-y-3">
                                                <div className="grid w-full items-center gap-1.5">
                                                    <Label>
                                                        Current Password
                                                    </Label>
                                                    <Input
                                                        id="currentPassword"
                                                        type="password"
                                                        placeholder="Enter your current password"
                                                        {...accountForm.register(
                                                            "currentPassword",
                                                        )}
                                                        disabled={
                                                            isEditingProfile
                                                        }
                                                    />
                                                    {accountForm.formState
                                                        .errors
                                                        .currentPassword && (
                                                        <p className="text-sm text-red-500">
                                                            {
                                                                accountForm
                                                                    .formState
                                                                    .errors
                                                                    .currentPassword
                                                                    .message
                                                            }
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="space-y-3">
                                                <div className="grid w-full items-center gap-1.5">
                                                    <Label>New Password</Label>
                                                    <Input
                                                        id="password"
                                                        type="password"
                                                        placeholder="New password should have to enter"
                                                        {...accountForm.register(
                                                            "password",
                                                        )}
                                                        disabled={
                                                            isEditingProfile
                                                        }
                                                    />
                                                    {accountForm.formState
                                                        .errors.password && (
                                                        <p className="text-sm text-red-500">
                                                            {
                                                                accountForm
                                                                    .formState
                                                                    .errors
                                                                    .password
                                                                    .message
                                                            }
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="space-y-3">
                                                <div className="grid w-full items-center gap-1.5">
                                                    <Label>
                                                        Confirm New Password
                                                    </Label>
                                                    <Input
                                                        id="confirmPassword"
                                                        type="password"
                                                        placeholder="Confirm new password"
                                                        {...accountForm.register(
                                                            "confirmPassword",
                                                        )}
                                                        disabled={
                                                            isEditingProfile
                                                        }
                                                    />
                                                    {accountForm.formState
                                                        .errors
                                                        .confirmPassword && (
                                                        <p className="text-sm text-red-500">
                                                            {
                                                                accountForm
                                                                    .formState
                                                                    .errors
                                                                    .confirmPassword
                                                                    .message
                                                            }
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex justify-end">
                                    <Button
                                        onClick={saveAccountChanges}
                                        disabled={
                                            isUpdatingPassword ||
                                            !isAccountDirty
                                        }
                                    >
                                        {isUpdatingPassword ? (
                                            <div className="flex items-center justify-center gap-2">
                                                <Loader2 className="animate-spin" />
                                                <span>Saving...</span>
                                            </div>
                                        ) : (
                                            "Save Changes"
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>

            {/* Confirmation Dialog */}
            <ConfirmationDialog
                open={showConfirmDialog}
                onOpenChange={setShowConfirmDialog}
                title="Confirm tab change"
                description="You have unsaved changes. Are you sure you want to switch tabs? Your changes will be lost."
                confirmText="Continue"
                cancelText="Cancel"
                onConfirm={handleConfirmTabChange}
                variant="destructive"
            />
        </div>
    );
}
