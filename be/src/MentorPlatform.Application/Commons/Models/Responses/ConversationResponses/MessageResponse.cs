namespace MentorPlatform.Application.Commons.Models.Responses.ConversationResponses;
public class MessageResponse
{
    public Guid Id { get; set; }
    public string Content { get; set; }
    public Guid SenderId { get; set; }
    public DateTime CreatedAt { get; set; }
    public ICollection<AttachmentResponse>? Attachments { get; set; }
}
