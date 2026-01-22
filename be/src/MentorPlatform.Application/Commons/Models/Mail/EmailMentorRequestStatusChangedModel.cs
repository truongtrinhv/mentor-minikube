namespace MentorPlatform.Application.Commons.Models.Mail;

public class EmailMentorRequestStatusChangedModel : EmailAbstractModel
{

        public string RecipientName { get; set; } = default!;
        public string OldStatus { get; set; } = default!;
        public string NewStatus { get; set; } = default!;
        public string? Note { get; set; } = default!;
    

}
