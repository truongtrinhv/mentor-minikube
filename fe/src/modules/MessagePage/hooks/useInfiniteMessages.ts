import { useCallback, useEffect, useRef, useState } from "react";

import { useHubContext } from "@/common/context/auth-context";

import type { ConversationResponse, MessageResponse } from "../types";

type UseInfiniteMessagesProps = {
    conversationId: string | null;
    currentConversation: ConversationResponse | null;
};

export const useInfiniteMessages = ({
    conversationId,
    currentConversation,
}: UseInfiniteMessagesProps) => {
    const { dataCenter } = useHubContext();
    const [messages, setMessages] = useState<MessageResponse[]>([]);
    const [hasMore, setHasMore] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [page, setPage] = useState(1);
    const observerRef = useRef<IntersectionObserver | null>(null);
    const prevConversationIdRef = useRef<string | null>(null);
    const lastMessageCountRef = useRef<number>(0);

    const MESSAGES_PER_PAGE = 20;

    // Reset when conversation changes
    useEffect(() => {
        if (conversationId !== prevConversationIdRef.current) {
            setMessages([]);
            setHasMore(false);
            setPage(1);
            setIsLoading(false);
            prevConversationIdRef.current = conversationId;
            lastMessageCountRef.current = 0;

            if (conversationId) {
                // Get the latest conversation data from dataCenter or fallback to currentConversation
                const latestConversation =
                    dataCenter?.conversations.find(
                        (conv) => conv.id === conversationId,
                    ) || currentConversation;

                if (latestConversation) {
                    const conversationMessages =
                        latestConversation.messages || [];

                    // Load most recent messages first
                    const totalMessages = conversationMessages.length;
                    const startIndex = Math.max(
                        0,
                        totalMessages - MESSAGES_PER_PAGE,
                    );
                    const recentMessages =
                        conversationMessages.slice(startIndex);

                    setTimeout(() => {
                        setMessages(recentMessages);
                        setPage(1);
                        setHasMore(totalMessages > MESSAGES_PER_PAGE);
                        setIsLoading(false);
                        lastMessageCountRef.current = totalMessages;
                    }, 0);
                }
            }
        }
    }, [conversationId, dataCenter, currentConversation]);

    // Listen for real-time message updates from dataCenter
    useEffect(() => {
        if (!conversationId || !dataCenter?.conversations) return;

        const latestConversation = dataCenter.conversations.find(
            (conv) => conv.id === conversationId,
        );

        if (!latestConversation) return;

        const conversationMessages = latestConversation.messages || [];
        const totalMessages = conversationMessages.length;

        // Only update if there are new messages
        if (totalMessages > lastMessageCountRef.current) {
            // Calculate current messages to show based on page
            const messagesToShow = page * MESSAGES_PER_PAGE;
            const startIndex = Math.max(0, totalMessages - messagesToShow);
            const updatedMessages = conversationMessages.slice(startIndex);

            setMessages(updatedMessages);
            setHasMore(startIndex > 0);
            lastMessageCountRef.current = totalMessages;
        }
    }, [dataCenter?.conversations, conversationId, page]);

    const loadMoreMessages = useCallback(() => {
        if (!conversationId || !hasMore || isLoading) return;

        setIsLoading(true);

        // Get the latest conversation data from dataCenter
        const latestConversation = dataCenter?.conversations.find(
            (conv) => conv.id === conversationId,
        );

        if (!latestConversation) {
            setIsLoading(false);
            return;
        }

        // Simulate API delay
        setTimeout(() => {
            const conversationMessages = latestConversation.messages || [];
            const totalMessages = conversationMessages.length;
            const nextPage = page + 1;
            const messagesToShow = nextPage * MESSAGES_PER_PAGE;

            // Calculate the range for messages to show
            const startIndex = Math.max(0, totalMessages - messagesToShow);
            const newMessages = conversationMessages.slice(startIndex);

            setMessages(newMessages);
            setPage(nextPage);
            setHasMore(startIndex > 0);
            setIsLoading(false);
            lastMessageCountRef.current = totalMessages;
        }, 500);
    }, [conversationId, page, hasMore, isLoading, dataCenter]);

    // Intersection Observer ref callback
    const lastMessageElementRef = useCallback(
        (node: HTMLDivElement | null) => {
            if (isLoading) return;
            if (observerRef.current) observerRef.current.disconnect();

            observerRef.current = new IntersectionObserver(
                (entries) => {
                    if (entries[0].isIntersecting && hasMore && !isLoading) {
                        loadMoreMessages();
                    }
                },
                {
                    threshold: 0.1,
                    rootMargin: "20px 0px",
                },
            );

            if (node) observerRef.current.observe(node);
        },
        [isLoading, hasMore, loadMoreMessages],
    );

    useEffect(() => {
        return () => {
            if (observerRef.current) {
                observerRef.current.disconnect();
            }
        };
    }, []);

    return {
        messages,
        hasMore,
        isLoading,
        loadMoreMessages,
        lastMessageElementRef,
    };
};
