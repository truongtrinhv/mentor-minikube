import { httpClient } from "@/common/api/instance.axios";

import type { UserDetailResponse, UserPassword } from "../types";

const profileService = {
    getUserDetail: () => httpClient.get<UserDetailResponse>("auth/me/detail"),
    editProfile: (formData: FormData) => {
        return httpClient.post<{ message: string }>("auth/me", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
    },
    updatePassword: (data: UserPassword) => {
        return httpClient.post<{ message: string }>(
            "auth/change-password",
            data,
        );
    },
};

export default profileService;
