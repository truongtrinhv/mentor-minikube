namespace MentorPlatform.Application.Commons.Models.Requests.ConversationRequests;
public class CreateConversationRequest
{
    public List<Guid> UserIds { get; set; }
    public string? ConversationName { get; set; }
    public bool IsGroup { get; set; }
}
