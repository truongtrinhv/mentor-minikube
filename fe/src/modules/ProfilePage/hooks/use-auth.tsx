/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import profileService from "../services/profileService";
import type { EditProfileRequest } from "../types";

export const useAuth = () => {
    const queryClient = useQueryClient();

    const {
        data: userDetail,
        isLoading: isLoadingUserDetail,
        error: userDetailError,
        refetch: refetchUserDetail,
    } = useQuery({
        queryKey: ["auth", "user-detail"],
        queryFn: async () => {
            const response = await profileService.getUserDetail();
            return response.data;
        },
        retry: false,
    });

    const editProfileMutation = useMutation({
        mutationFn: (data: EditProfileRequest) => {
            const formData = new FormData();

            Object.entries(data).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    if (key === "avatarUrl" && value instanceof File) {
                        formData.append(key, value);
                    } else if (Array.isArray(value)) {
                        value.forEach((item, index) =>
                            formData.append(
                                `${key}[${index}]`,
                                item.toString(),
                            ),
                        );
                    } else {
                        formData.append(key, String(value));
                    }
                }
            });

            return profileService.editProfile(formData);
        },
        onSuccess: () => {
            toast.success("Profile updated successfully!");
            queryClient.invalidateQueries({
                queryKey: ["auth", "user-detail"],
            });
            queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
        },
        onError: (error: any) => {
            console.error("Edit profile error:", error);
        },
    });

    const updatePasswordMutation = useMutation({
        mutationFn: (data: {
            currentPassword: string;
            password: string;
            confirmPassword: string;
        }) => profileService.updatePassword(data),
        onSuccess: () => {
            toast.success("Password updated successfully!");
        },
        onError: (error: any) => {
            console.error("Update password error:", error);
        },
    });

    return {
        userDetail,
        isLoadingUserDetail,
        userDetailError,
        refetchUserDetail,
        editProfile: editProfileMutation.mutate,
        isEditingProfile: editProfileMutation.isPending,
        editProfileError: editProfileMutation.error,
        updatePassword: updatePasswordMutation.mutate,
        isUpdatingPassword: updatePasswordMutation.isPending,
        updatePasswordError: updatePasswordMutation.error,
    };
};

export default useAuth;
