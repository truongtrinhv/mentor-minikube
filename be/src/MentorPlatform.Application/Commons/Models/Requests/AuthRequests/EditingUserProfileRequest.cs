using FluentValidation;
using MentorPlatform.Application.Commons.ValidationMessages;
using MentorPlatform.CrossCuttingConcerns.Helpers;
using MentorPlatform.Domain.Constants;
using MentorPlatform.Domain.Enums;
using Microsoft.AspNetCore.Http;

namespace MentorPlatform.Application.Commons.Models.Requests.AuthRequests;

public class EditingUserProfileRequest
{
    public IFormFile? AvatarUrl { get; set; } = default;
    public string FullName { get; set; } = default!;
    public string? Bio { get; set; } = default;
    public List<Guid>? Expertises { get; set; } = default;
    public string? ProfessionalSkill { get; set; } = default;
    public string? Experience { get; set; } = default;
    public bool IsNotification { get; set; } = true;
    public bool IsReceiveMessage { get; set; } = true;
    public bool IsPrivateProfile { get; set; } = false;
    public int? CommunicationPreference { get; set; }
    public string? Goals { get; set; } = default;
    public List<int>? Availability { get; set; } = default;
    public List<Guid>? CourseCategoryIds { get; set; } = default;
    public int SessionFrequency { get; set; }
    public int Duration { get; set; }
    public int? LearningStyle { get; set; } = default!;
    public List<int>? TeachingStyles { get; set; } = default!;
}


public class EditingUserProfileRequestValidator : AbstractValidator<EditingUserProfileRequest>
{
    public EditingUserProfileRequestValidator()
    {

        RuleFor(u => u.AvatarUrl)
            .Must(u => u!.Length <= 5 * 1024 * 1024)
            .When(u => u.AvatarUrl != null)
            .WithMessage(
                StringHelper.ReplacePlaceholders(
                    AuthModelsValidationMessages.AvatarShouldLessThanMaxLength,
                    UserConstants.MaxSizeAvatarMb.ToString()));

        RuleFor(u => u.FullName)
            .NotEmpty()
            .WithMessage(AuthModelsValidationMessages.FullNameNotEmpty)
            .Must(u => u.Length <= UserConstants.MaxLengthFullName
                       && u.Length >= UserConstants.MinLengthFullName)
            .WithMessage(AuthModelsValidationMessages.FullNameMustBeInRange);
        RuleFor(x => x.Expertises)
            .Must(list => list == null || list.Distinct().Count() == list.Count)
            .WithMessage(AuthModelsValidationMessages.UserExpertiseInvalid);
        RuleFor(u => u.Bio)
            .Must(u => string.IsNullOrEmpty(u) || u.Replace("\r\n", "\n").Trim().Length <= UserConstants.MaxLengthBio)
            .WithMessage(AuthModelsValidationMessages.BioShouldLessThanMaxLength);

        RuleFor(u => u.Experience)
            .Must(u => string.IsNullOrEmpty(u) || u.Replace("\r\n", "\n").Trim().Length <= UserConstants.MaxLengthIndustryExperience)
            .WithMessage(AuthModelsValidationMessages.IndustryExperienceShouldLessThanMaxLength);

        RuleFor(u => u.ProfessionalSkill)
            .Must(u => string.IsNullOrEmpty(u) || u.Replace("\r\n", "\n").Trim().Length <= UserConstants.MaxLengthProfessionalSkills)
            .WithMessage(AuthModelsValidationMessages.ProfessionalSkillShouldLessThanMaxLength);

        RuleFor(u => u.CommunicationPreference)
            .Must(u => Enum.IsDefined(typeof(CommunicationPreference), u))
            .When(u => u.CommunicationPreference != null)
            .WithMessage(AuthModelsValidationMessages.PreferredCommunicationInvalid);

        RuleFor(x => x.Availability)
            .Must(list => list!.All(id => Enum.IsDefined(typeof(UserAvailability), id)))
            .When(u => u.Availability != null && u.Availability.Count > 0)
            .WithMessage(AuthModelsValidationMessages.AvailabilityInvalid);
        RuleFor(x => x.Goals)
            .Must(x => string.IsNullOrEmpty(x) || x.Replace("\r\n", "\n").Trim().Length <= UserConstants.MaxLengthGoals)
            .WithMessage(AuthModelsValidationMessages.GoalsMustLessThanMaxLength);
        RuleFor(x => x.SessionFrequency)
            .Must(x => Enum.IsDefined(typeof(SessionFrequency), x))
            .WithMessage(AuthModelsValidationMessages.PreferredSessionIsInvalid);
        RuleFor(x => x.LearningStyle)
            .Must(val => val == null || Enum.IsDefined(typeof(LearningStyle), val.Value))
            .WithMessage(AuthModelsValidationMessages.PreferredLearningStyleInvalid);

        RuleFor(x => x.TeachingStyles)
            .Must(list => list == null || list!.Distinct().Count() == list.Count &&
                                           list!.All(id => Enum.IsDefined(typeof(TeachingStyle), id)))
            .WithMessage(AuthModelsValidationMessages.PreferredTeachingStyleInvalid);
    }
}