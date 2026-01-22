using MentorPlatform.Application.Commons.Models.Responses.ConversationResponses;
using MentorPlatform.Domain.Entities;

namespace MentorPlatform.Application.Commons.Mappings;
public static class ConversationMappings
{
    public static ConversationResponse ToResponse(this Conversation conversation, Guid userId)
    {
        var lastMessage = conversation.Messages.MaxBy(m => m.CreatedAt);
        var hasUnreadMessage = (lastMessage?.CreatedAt ?? DateTime.MinValue) > conversation.Participants.First(p => p.UserId == userId).LastRead &&
                                lastMessage?.SenderId != userId;
        return new ConversationResponse()
        {
            Id = conversation.Id,
            ConversationName = conversation.ConversationName,
            IsGroup = conversation.IsGroup,
            HasUnreadMessage = hasUnreadMessage,
            Messages = conversation.Messages?.OrderBy(m => m.CreatedAt).Select(m => m.ToResponse()).ToList() ?? [],
            Participants = conversation.Participants?.Select(p => p.User.ToSyncResponse()).ToList() ?? [],
        };
    }

    public static UserResponse ToSyncResponse(this User user)
    {
        return new UserResponse()
        {
            Id = user.Id,
            FullName = user.UserDetail.FullName,
            AvatarUrl = user.UserDetail.AvatarUrl,
            Role = user.Role,
        };
    }
    public static MessageResponse ToResponse(this Message message)
    {
        return new MessageResponse()
        {
            Id = message.Id,
            Content = message.Content,
            SenderId = message.SenderId,
            CreatedAt = message.CreatedAt,
            Attachments = message.Attachments?.Select(a => a.ToResponse()).ToList(),
        };
    }
    public static AttachmentResponse ToResponse(this Attachment attachment)
    {
        return new AttachmentResponse()
        {
            Id = attachment.Id,
            Url = attachment.Url,
            Type = attachment.Type,
            Size = attachment.Size,
        };
    }
}
