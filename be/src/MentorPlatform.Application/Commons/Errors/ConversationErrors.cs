using MentorPlatform.Domain.Shared;

namespace MentorPlatform.Application.Commons.Errors;

public static class ConversationErrorMessages
{
    public const string InvalidUserId = "User Id is invalid";
    public const string UserNotFound = "User not found";
    public const string CannotAddUsersToConversation = "Can't add users to conversation";
    public const string UserIdRequired = "User Id is required";
    public const string GroupNeedMoreThanTwoMembers = "Group conversation needs more than two members";
    public const string CannotAddYourselfToConversation = "You cannot add yourself to a conversation";
    public const string ConversationNotFound = "Conversation not found";
    public const string ConversationNameRequired = "Conversation name is required for group conversations";
    public const string UserNotInConversation = "User is not in the conversation";
    public const string MessageContentEmpty = "Message content cannot be empty";
    public const string SearchKeywordRequired = "Keyword is required";
    public const string ConversationAlreadyExists = "Conversation with these users already exists";
    public const string AtLeastOneFileRequired = "At least 1 file is required";
    public const string NotificationNotFound = "Notification not found";
    public const string NotificationNotBelongToUser = "Notification is not belong to user";
}


public static class ConversationErrors
{
    public static Error InvalidUserId => new(nameof(InvalidUserId), ConversationErrorMessages.InvalidUserId);
    public static Error UserNotFound => new(nameof(UserNotFound), ConversationErrorMessages.UserNotFound);
    public static Error CannotAddUsersToConversation =>
        new(nameof(CannotAddUsersToConversation), ConversationErrorMessages.CannotAddUsersToConversation);
    public static Error UserIdRequired => new(nameof(UserIdRequired), ConversationErrorMessages.UserIdRequired);
    public static Error GroupNeedMoreThanTwoMembers =>
        new(nameof(GroupNeedMoreThanTwoMembers), ConversationErrorMessages.GroupNeedMoreThanTwoMembers);
    public static Error CannotAddYourselfToConversation => new(nameof(CannotAddYourselfToConversation), ConversationErrorMessages.CannotAddYourselfToConversation);
    public static Error ConversationNotFound => new(nameof(ConversationNotFound), ConversationErrorMessages.ConversationNotFound);
    public static Error ConversationNameRequired => new(nameof(ConversationNameRequired), ConversationErrorMessages.ConversationNameRequired);
    public static Error UserNotInConversation => new(nameof(UserNotInConversation), ConversationErrorMessages.UserNotInConversation);
    public static Error MessageContentEmpty => new(nameof(MessageContentEmpty), ConversationErrorMessages.MessageContentEmpty);
    public static Error SearchKeywordRequired => new(nameof(SearchKeywordRequired), ConversationErrorMessages.SearchKeywordRequired);
    public static Error ConversationAlreadyExists => new(nameof(ConversationAlreadyExists), ConversationErrorMessages.ConversationAlreadyExists);
    public static Error NotificationNotFound => new(nameof(NotificationNotFound), ConversationErrorMessages.NotificationNotFound);
    public static Error NotificationNotBelongToUser => new(nameof(NotificationNotBelongToUser), ConversationErrorMessages.NotificationNotBelongToUser);
}
