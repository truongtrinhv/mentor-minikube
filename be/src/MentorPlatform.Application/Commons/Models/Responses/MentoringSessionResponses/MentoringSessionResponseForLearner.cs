namespace MentorPlatform.Application.Commons.Models.Responses.MentoringSessionResponses;

public class MentoringSessionResponseForLearner : MentoringSessionResponse
{
    public string MentorName { get; set; } = default!;
    public string NewStartTime { get; set; } = string.Empty;
    public string NewEndTime { get; set; } = string.Empty;
    public string Notes { get; set; } = string.Empty;
}