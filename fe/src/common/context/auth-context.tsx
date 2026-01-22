/* eslint-disable react-refresh/only-export-components */
import {
    type HubConnection,
    HubConnectionBuilder,
    HubConnectionState,
} from "@microsoft/signalr";
import React, {
    type ReactNode,
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
} from "react";
import { toast } from "sonner";

import { ApplicationStatus } from "@/modules/AdminPage/MentorApprovalsPage/types";
import { applicationStatusService } from "@/modules/MentorPages/ApplicationStatusPage/services/applicationStatusService";
import type {
    CreateConversationRequest,
    HubSyncData,
    MessageResponse,
    NotificationResponse,
    SendMessageRequest,
} from "@/modules/MessagePage/types";

import { FullscreenLoading } from "../components/loading-spinner";
import { PATH } from "../constants/paths";
import {
    getAccessToken,
    getClientToken,
    getRefreshToken,
    isLoginPage,
    removeClientToken,
    setClientToken,
} from "../lib/token";
import { isTokenExpired } from "../lib/utils";
import authService from "../services/authServices";
import {
    type CurrentUser,
    type LoginRequest,
    Role,
    type Token,
    type VerifyEmailRequest,
    type VerifyEmailResponse,
} from "../types/auth";
import type { Result } from "../types/result";

type AuthContextType = {
    isAuthenticated: boolean;
    setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
    user: CurrentUser | undefined;
    setUser: React.Dispatch<React.SetStateAction<CurrentUser | undefined>>;
    logout: () => void;
    login: (data: LoginRequest) => Promise<string>;
    loading: boolean;
    verify: (data: VerifyEmailRequest) => Promise<Result<VerifyEmailResponse>>;
};

const AuthContext = createContext<AuthContextType>({
    isAuthenticated: false,
    setIsAuthenticated: () => {},
    user: undefined,
    setUser: () => {},
    logout: () => {},
    login: async () => {
        return {} as string;
    },
    loading: false,
    verify: async () => {
        return {} as Result<VerifyEmailResponse>;
    },
});

type HubContextType = {
    hubConnectionState: HubConnectionState;
    dataCenter: HubSyncData;
    setActiveConversationId: (conversationId: string | undefined) => void;
    createConversation: (
        request: CreateConversationRequest,
    ) => Promise<boolean>;
    sendMessage: (request: SendMessageRequest) => Promise<boolean>;
    syncConversation: (conversationId: string) => Promise<void>;
    searchUser: (keyword: string) => Promise<any[]>;
    readConversation: (conversationId: string) => void;
    leaveGroup: (conversationId: string) => Promise<boolean>;
    readNotification: (notificationId: string) => void;
    readNotifications: (notificationIds: string[]) => void;
};

const HubContext = createContext<HubContextType>({
    hubConnectionState: HubConnectionState.Disconnected,
    dataCenter: {
        conversations: [],
        activeConversationId: undefined,
        notifications: [],
    },
    setActiveConversationId: () => {},
    createConversation: async () => false,
    sendMessage: async () => false,
    syncConversation: async () => {},
    searchUser: async () => [],
    readConversation: () => {},
    leaveGroup: async () => false,
    readNotification: () => {},
    readNotifications: () => {},
});

export const useAuthContext = () => useContext(AuthContext);
export const useHubContext = () => useContext(HubContext);

const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const accessToken = getClientToken();
    const [isAuthenticated, setIsAuthenticated] = useState(!!accessToken);
    const [user, setUser] = useState<CurrentUser>();
    const [loading, setLoading] = useState(true);
    const [hubConnection, setHubConnection] = useState<
        HubConnection | undefined
    >(undefined);
    const [hubDataCenter, setHubDataCenter] = useState<HubSyncData>({
        conversations: [],
        activeConversationId: undefined,
        notifications: [],
    });
    const [hubConnectionState, setHubConnectionState] =
        useState<HubConnectionState>(HubConnectionState.Disconnected);

    useEffect(() => {
        if (!isAuthenticated) {
            return;
        }
        const connection = new HubConnectionBuilder()
            .withUrl(
                import.meta.env.VITE_API_URL_ROOT.replace("/api", "/hubs/live"),
                {
                    accessTokenFactory: async () => {
                        let accessToken = getAccessToken();
                        if (!accessToken) {
                            return "";
                        }
                        if (isTokenExpired(accessToken)) {
                            let newTokens = await authService.getRefreshToken({
                                accessToken,
                                refreshToken: getRefreshToken()!,
                            });
                            accessToken = newTokens.data!.accessToken;
                            setClientToken({
                                accessToken,
                                refreshToken: newTokens.data!.refreshToken,
                            });
                        }
                        return accessToken;
                    },
                },
            )
            .build();

        setUpConnection(connection);
        setHubConnection(connection);
        connection.start();
        setHubConnectionState(HubConnectionState.Connected);
        return () => {
            if (connection) {
                connection.stop();
            }
        };
    }, [isAuthenticated]);

    useEffect(() => {
        if (!isAuthenticated || isLoginPage()) {
            setLoading(false);
            return;
        }
        getCurrentUser();
    }, []);

    const setUpConnection = (connection: HubConnection) => {
        const refreshHubConnectionState = () => {
            setHubConnectionState(connection.state);
        };
        connection.onclose(refreshHubConnectionState);
        connection.onreconnecting(refreshHubConnectionState);
        connection.onreconnected(refreshHubConnectionState);

        connection.on("ReceiveSyncData", (result: Result<HubSyncData>) => {
            if (result.data) {
                setHubDataCenter((prev) => {
                    return {
                        ...prev,
                        conversations: result.data?.conversations ?? [],
                        notifications: result.data?.notifications ?? [],
                    };
                });
            }
        });

        connection.on("RemoveToken", () => {
            logout();
            toast.error("Your account has been deactivated.");
        });

        connection.on("SyncConversation", async (conversationId: string) => {
            try {
                const result = await connection.invoke(
                    "SyncConversation",
                    conversationId,
                );

                if (result?.data && result.isSuccess) {
                    setHubDataCenter((prev) => {
                        // Validate the conversation belongs to the expected ID
                        if (result.data.id !== conversationId) {
                            console.warn(
                                `Conversation ID mismatch: expected ${conversationId}, got ${result.data.id}`,
                            );
                            return prev;
                        }

                        const existingIndex = prev.conversations.findIndex(
                            (conv) => conv.id === conversationId,
                        );

                        if (existingIndex >= 0) {
                            const updatedConversation = {
                                ...result.data,
                                messages: result.data.messages
                                    ? [...result.data.messages]
                                    : [],
                                participants: result.data.participants
                                    ? [...result.data.participants]
                                    : [],
                                hasUnreadMessage: result.data.hasUnreadMessage,
                            };

                            // Create new conversations array with only the target conversation updated
                            const newConversations = prev.conversations.map(
                                (conversation) => {
                                    if (conversation.id === conversationId) {
                                        return updatedConversation;
                                    }
                                    // Keep other conversations unchanged
                                    return conversation;
                                },
                            );

                            return {
                                ...prev,
                                conversations: newConversations,
                            };
                        } else {
                            // Add new conversation
                            return {
                                ...prev,
                                conversations: [
                                    ...prev.conversations,
                                    result.data,
                                ],
                            };
                        }
                    });
                }
            } catch (error) {
                console.error("Error syncing conversation:", error);
            }
        });

        connection.on(
            "ReceiveMessage",
            (conversationId: string, message: MessageResponse) => {
                setHubDataCenter((prev) => {
                    const conversationIndex = prev.conversations.findIndex(
                        (conv) => conv.id === conversationId,
                    );
                    if (conversationIndex >= 0) {
                        const updatedConversation = {
                            ...prev.conversations[conversationIndex],
                            messages: [
                                ...prev.conversations[conversationIndex]
                                    .messages,
                                message,
                            ],
                            hasUnreadMessage:
                                prev.activeConversationId !== conversationId,
                        };
                        const updatedConversations = [
                            ...prev.conversations.slice(0, conversationIndex),
                            updatedConversation,
                            ...prev.conversations.slice(conversationIndex + 1),
                        ];
                        return {
                            ...prev,
                            conversations: updatedConversations,
                        };
                    }
                    return prev;
                });
            },
        );

        connection.on(
            "ReceiveNotification",
            (notification: NotificationResponse) => {
                setHubDataCenter((prev) => {
                    return {
                        ...prev,
                        notifications: [
                            ...prev.notifications,
                            notification,
                        ].sort(
                            (a, b) =>
                                new Date(b.createdAt).getTime() -
                                new Date(a.createdAt).getTime(),
                        ),
                    };
                });
            },
        );
    };

    const checkMentorApplicationStatus = async () => {
        const response =
            await applicationStatusService.getCurrentUserApplication();
        return response.data;
    };

    const logout = () => {
        const refreshToken = getRefreshToken();
        const accesshToken = getAccessToken();
        if (refreshToken || accesshToken) {
            authService.logout().finally(() => removeClientToken());
        }
        removeClientToken();
        setIsAuthenticated(false);
        setUser(undefined);
    };

    const login = async (data: LoginRequest): Promise<string> => {
        const res = await authService.login(data);
        if (res.data && res.data.isVerifyEmail == false) {
            return `${PATH.VerifyOTP}?email=${encodeURIComponent(data.email)}&purpose=login`;
        } else if (res.data && res.data.isVerifyEmail == true) {
            const token: Token = {
                accessToken: res.data?.accessToken ?? "",
                refreshToken: res.data?.refreshToken ?? "",
            };
            setClientToken(token);
            setIsAuthenticated(true);
            const userResponse = await authService.getCurrentUser();
            const currentUser = userResponse.data;
            setUser(currentUser);

            if (currentUser?.role === Role.Admin) {
                return PATH.AdminDashboard;
            } else if (currentUser?.role === Role.Learner) {
                return PATH.LearnerDashboard;
            } else if (currentUser?.role === Role.Mentor) {
                try {
                    const applicationStatus =
                        await checkMentorApplicationStatus();

                    if (
                        !applicationStatus ||
                        applicationStatus.status !== ApplicationStatus.Approved
                    ) {
                        return PATH.MentorApplication;
                    }

                    return PATH.MentorDashboard;
                } catch (error) {
                    console.error(
                        "Error checking mentor application status:",
                        error,
                    );
                    return PATH.MentorApplication;
                }
            }

            return PATH.Home;
        } else {
            return PATH.VerifyFailure;
        }
    };

    const verify = async (
        data: VerifyEmailRequest,
    ): Promise<Result<VerifyEmailResponse>> => {
        const res = await authService.verifyEmail(data);
        const token: Token = {
            accessToken: res.data?.accessToken ?? "",
            refreshToken: res.data?.refreshToken ?? "",
        };
        setClientToken(token);
        setIsAuthenticated(true);
        getCurrentUser();
        return res;
    };

    const getCurrentUser = async () => {
        authService
            .getCurrentUser()
            .then((res) => {
                setUser(res.data);
            })
            .catch(() => {
                removeClientToken();
                setUser(undefined);
                setIsAuthenticated(false);
            })
            .finally(() => setLoading(false));
    };

    const contextValue: AuthContextType = {
        isAuthenticated,
        setIsAuthenticated,
        user,
        setUser,
        login,
        logout,
        loading,
        verify,
    };
    const hubContextValue: HubContextType = {
        hubConnectionState,
        dataCenter: hubDataCenter,
        setActiveConversationId: useCallback(
            (conversationId: string | undefined) => {
                setHubDataCenter((prev) => ({
                    ...prev,
                    activeConversationId: conversationId,
                }));
            },
            [setHubDataCenter],
        ),
        createConversation: async (request: CreateConversationRequest) => {
            if (!hubConnection) {
                return false;
            }
            try {
                const result = await hubConnection.invoke(
                    "CreateConversation",
                    request,
                );
                return result?.isSuccess || false;
            } catch (error) {
                console.error("Create conversation error:", error);
                return false;
            }
        },
        sendMessage: async (request: SendMessageRequest) => {
            if (!hubConnection) {
                return false;
            }
            try {
                const result = await hubConnection.invoke(
                    "SendMessage",
                    request,
                );
                return result?.isSuccess || false;
            } catch (error) {
                console.error("Send message error:", error);
                return false;
            }
        },
        syncConversation: async (conversationId: string) => {
            if (!hubConnection) {
                return;
            }
            const result = await hubConnection.invoke(
                "SyncConversation",
                conversationId,
            );
            if (result.isSuccess) {
                setHubDataCenter((prev) => {
                    return {
                        ...prev,
                        conversations: prev?.conversations.map(
                            (conversation) => {
                                if (conversation.id === conversationId) {
                                    return {
                                        ...conversation,
                                    };
                                }
                                return conversation;
                            },
                        ),
                    };
                });
            }
        },
        searchUser: async (keyword: string) => {
            if (!hubConnection) {
                return [];
            }
            try {
                const result = await hubConnection.invoke(
                    "SearchUser",
                    keyword,
                );
                return result?.data || [];
            } catch (error) {
                console.error("Search users error:", error);
                return [];
            }
        },
        readConversation: (conversationId: string) => {
            if (!hubConnection) {
                return;
            }
            try {
                hubConnection.send("ReadConversation", conversationId);
            } catch (error) {
                console.error("Read conversation error:", error);
            }
        },
        leaveGroup: async (conversationId: string) => {
            if (!hubConnection) {
                return false;
            }
            try {
                const result = await hubConnection.invoke(
                    "LeaveGroup",
                    conversationId,
                );
                if (result.isSuccess) {
                    setHubDataCenter((prev) => {
                        return {
                            ...prev,
                            conversations:
                                prev?.conversations.filter((conversation) => {
                                    return conversation.id !== conversationId;
                                }) || [],
                        };
                    });
                    return true;
                }
                return false;
            } catch (error) {
                console.error("Leave group error:", error);
                return false;
            }
        },
        readNotification: (notificationId: string) => {
            if (!hubConnection) {
                return;
            }
            try {
                hubConnection.send("ReadNotification", notificationId);
                setHubDataCenter((prev) => {
                    return {
                        ...prev,
                        notifications:
                            prev?.notifications?.map((n) => {
                                if (n.id === notificationId) {
                                    return {
                                        ...n,
                                        isRead: true,
                                    };
                                }
                                return n;
                            }) || [],
                    };
                });
            } catch (error) {
                console.error("Read notification error:", error);
            }
        },
        readNotifications: (notificationIds: string[]) => {
            if (!hubConnection) {
                return;
            }
            try {
                hubConnection.send("ReadNotifications", notificationIds);
                setHubDataCenter((prev) => ({
                    ...prev,
                    notifications:
                        prev?.notifications?.map((n) => {
                            if (notificationIds.includes(n.id)) {
                                return {
                                    ...n,
                                    isRead: true,
                                };
                            }
                            return n;
                        }) || [],
                }));
            } catch (error) {
                console.error("Read notifications error:", error);
            }
        },
    };
    return loading ? (
        <FullscreenLoading />
    ) : (
        <AuthContext.Provider value={contextValue}>
            <HubContext.Provider value={hubContextValue}>
                {children}
            </HubContext.Provider>
        </AuthContext.Provider>
    );
};

export default AuthProvider;
