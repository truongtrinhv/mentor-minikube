using MentorPlatform.Application.Commons.Models.Responses.NotificationResponses;
using MentorPlatform.Domain.Entities;

namespace MentorPlatform.Application.Commons.Mappings;
public static class NotificationMapping
{
    public static NotificationResponse ToResponse(this Notification noti)
    {
        return new NotificationResponse
        {
            Id = noti.Id,
            Title = noti.Title,
            Message = noti.Message,
            IsRead = noti.IsRead,
            CreatedAt = noti.CreatedAt,
        };
    }
}
