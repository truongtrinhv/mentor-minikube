import { httpClient } from "@/common/api/instance.axios";
import type { Result } from "@/common/types/result";

import type { FileMessageRequest } from "../types";

const conversationService = {
    sendFileMessage: (request: FileMessageRequest): Promise<Result<void>> => {
        const formData = new FormData();
        formData.append("conversationId", request.conversationId);
        formData.append("content", request.content);

        request.files.forEach((file) => formData.append("files", file));

        return httpClient.post<void>("conversations/file-message", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
    },
};

export default conversationService;
