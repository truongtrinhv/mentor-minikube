namespace MentorPlatform.Application.Commons.Models.Responses.ConversationResponses;
public class AttachmentResponse
{
    public Guid Id { get; set; }
    public string Url { get; set; }
    public string? Type { get; set; }
    public int Size { get; set; }
}
