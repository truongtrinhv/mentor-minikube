using FluentValidation;
using MentorPlatform.Application.Commons.Errors;
using Microsoft.AspNetCore.Http;

namespace MentorPlatform.Application.Commons.Models.Requests.ConversationRequests;
public class FileMessageRequest
{
    public Guid ConversationId { get; set; }
    public string Content { get; set; }
    public List<IFormFile> Files { get; set; }
}

public class FileMessageRequestValidator : AbstractValidator<FileMessageRequest>
{
    public FileMessageRequestValidator()
    {
        RuleFor(f => f.Files)
            .Must(f => f.Count > 0)
            .WithMessage(ConversationErrorMessages.AtLeastOneFileRequired);
    }
}
