using MentorPlatform.Application.Commons.CommandMessages;
using MentorPlatform.Application.Commons.Errors;
using MentorPlatform.Application.Commons.Mappings;
using MentorPlatform.Application.Commons.Models.Mail;
using MentorPlatform.Application.Commons.Models.Requests.AuthRequests;
using MentorPlatform.Application.Commons.Models.Responses.AuthResponses;
using MentorPlatform.Application.Identity;
using MentorPlatform.Application.Services.File;
using MentorPlatform.Application.Services.FileStorage;
using MentorPlatform.Application.Services.HostedServices;
using MentorPlatform.Application.Services.Mail;
using MentorPlatform.Application.Services.Security;
using MentorPlatform.CrossCuttingConcerns.Caching;
using MentorPlatform.CrossCuttingConcerns.Exceptions;
using MentorPlatform.CrossCuttingConcerns.Helpers;
using MentorPlatform.Domain.Entities;
using MentorPlatform.Domain.Enums;
using MentorPlatform.Domain.Repositories;
using MentorPlatform.Domain.Shared;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using RazorLight;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace MentorPlatform.Application.UseCases.Authentication;

public class AuthServices : IAuthServices
{
    private readonly IJwtTokenServices _jwtServices;
    private readonly IUserRepository _userRepository;
    private readonly JwtTokenOptions _jwtTokenOptions;
    private readonly IRepository<Domain.Entities.CourseCategory, Guid> _courseCategoryRepository;
    private readonly IFileStorageServices _fileStorageServices;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IExecutionContext _executionContext;
    private readonly IRazorLightEngine _razorLightEngine;
    private readonly IRepository<RefreshToken, Guid> _refreshTokenRepository;
    private readonly IMemoryCache _memoryCache;
    private readonly IRepository<Expertise, Guid> _expertiseRepository;
    private readonly IBackgroundTaskQueue<Func<IServiceProvider, CancellationToken, ValueTask>> _mailQueue;
    private readonly ILogger<AuthServices> _logger;
    public AuthServices(IJwtTokenServices jwtServices,
        ILogger<AuthServices> logger,
        IUnitOfWork unitOfWork,
        IUserRepository userRepository,
        IFileStorageFactory fileStorageFactory,
        IOptions<JwtTokenOptions> jwtTokenOptions,
        IExecutionContext executionContext,
        IRepository<Domain.Entities.CourseCategory, Guid> courseCategoryRepository,
        IRepository<RefreshToken, Guid> refreshTokenRepository,
        IRepository<Expertise, Guid> expertiseRepository,
        IRazorLightEngine razorLightEngine,
        IMemoryCache memoryCache,
        IBackgroundTaskQueue<Func<IServiceProvider, CancellationToken, ValueTask>> mailQueue)
    {
        _expertiseRepository = expertiseRepository;
        _mailQueue = mailQueue;
        _logger = logger;
        _executionContext = executionContext;
        _jwtServices = jwtServices;
        _userRepository = userRepository;
        _jwtTokenOptions = jwtTokenOptions.Value;
        _unitOfWork = unitOfWork;
        _expertiseRepository = expertiseRepository;
        _razorLightEngine = razorLightEngine;
        _refreshTokenRepository = refreshTokenRepository;
        _memoryCache = memoryCache;
        _fileStorageServices = fileStorageFactory.Get();
        _courseCategoryRepository = courseCategoryRepository;
    }

    public async Task<Result<LoginResponse>> LoginAsync(LoginRequest loginRequest)
    {
        var user = await _userRepository.GetByEmailAsync(loginRequest.Email);

        if (user == null)
        {
            return Result<LoginResponse>.Failure(UserErrors.EmailOrPasswordIncorrect);
        }

        if (!IsPasswordLoginMatchWithPassword(loginRequest.Password, user.Password))
        {
            return Result<LoginResponse>.Failure(UserErrors.EmailOrPasswordIncorrect);
        }
        if (!IsUserDeactivated(user))
        {
            return Result<LoginResponse>.Failure(UserErrors.UserIsDeactivated);
        }

        if (!HasUserVerifiedEmail(user))
        {
            await SendVerifyEmailCodeUserAsync(user);
            return new LoginResponse
            {
                AccessToken = string.Empty,
                RefreshToken = string.Empty,
                IsVerifyEmail = false
            };
        }

        var refreshToken = _jwtServices.GenerateRefreshToken();
        var freshTokenObject = new RefreshToken
        {
            UserId = user.Id,
            Value = HashingHelper.HashData(refreshToken),
            Expired = DateTime.UtcNow.AddDays(_jwtTokenOptions.ExpireRefreshTokenDays),
        };
        _refreshTokenRepository.Add(freshTokenObject);

        await _unitOfWork.SaveChangesAsync();

        var accessToken = _jwtServices.GenerateAccessToken(user, freshTokenObject.Id);

        return new LoginResponse { AccessToken = accessToken, RefreshToken = refreshToken };
    }

    public async Task<Result> RegisterAsync(RegisterRequest registerRequest)
    {
        var userByEmail = await _userRepository.GetByEmailAsync(registerRequest.Email!);
        if (userByEmail != null)
        {
            return Result.Failure(400, UserErrors.EmailAlreadyRegister);
        }

        if (registerRequest.Expertises != null && !await ValidateExpertiseValidAsync(registerRequest.Expertises))
        {
            return Result.Failure(400, UserErrors.UserExpertiseInvalid);
        }

        if (registerRequest.CourseCategoryIds != null && !await ValidateCourseCategoryValidAsync(registerRequest.CourseCategoryIds))
        {
            return Result.Failure(400, UserErrors.UserCourseCategoryInvalid);
        }

        var userCourseCategories = GetUserCourseCategories(registerRequest.CourseCategoryIds);
        var userExpertises = GetUserExpertises(registerRequest.Expertises);

        var user = registerRequest.ToUser();
        user.UserCourseCategories = userCourseCategories;
        user.UserExpertises = userExpertises;

        var userAvatarUrl = await UploadImageAndGetAvatarUrlAsync(registerRequest.AvatarUrl);
        user.UserDetail.AvatarUrl = userAvatarUrl;


        _userRepository.Add(user);

        await _unitOfWork.SaveChangesAsync();

        await SendVerifyEmailCodeUserAsync(user);

        return Result<string>.Success(AuthCommandMessages.RegisterSuccessfully);
    }

    public async Task<Result<string>> LogoutAsync()
    {
        var userId = _executionContext.GetUserId();
        var user = await _userRepository.GetByIdAsync(userId);
        await RecallUserAccessAndRefreshTokenAsync(user!);
        return AuthCommandMessages.LogoutSuccessfully;
    }

    public async Task<Result> ForgotPasswordAsync(ForgotPasswordRequest forgotPasswordRequest)
    {
        var user = await _userRepository.GetByEmailAsync(forgotPasswordRequest.Email);
        if (user == null)
        {
            return Result.Failure(400, UserErrors.EmailNotAlreadyRegister);
        }

        await SendEmailForgotPasswordCodeUserAsync(user);
        return Result.Success();
    }

    public async Task<Result> VerifyEmailAsync(VerifyEmailModel verifyEmailModel)
    {
        var user = await _userRepository.GetByEmailAsync(verifyEmailModel.Email);
        if (user == null)
        {
            return Result.Failure(400, UserErrors.EmailNotAlreadyRegister);
        }

        var code = GetVerifyCodeEmailFromMemory(user);
        if (code != verifyEmailModel.Code)
        {
            return Result.Failure(400, UserErrors.VerifyEmailCodeIncorrect);
        }

        user.IsVerifyEmail = true;
        var refreshToken = _jwtServices.GenerateRefreshToken();
        var freshTokenObject = new RefreshToken
        {
            UserId = user.Id,
            Value = HashingHelper.HashData(refreshToken),
            Expired = DateTime.UtcNow.AddDays(_jwtTokenOptions.ExpireRefreshTokenDays),
        };
        _refreshTokenRepository.Add(freshTokenObject);

        await _unitOfWork.SaveChangesAsync();

        var accessToken = _jwtServices.GenerateAccessToken(user, freshTokenObject.Id);
        _userRepository.Update(user);

        await _unitOfWork.SaveChangesAsync();

        return Result<VerifyEmailResponse>.Success(new VerifyEmailResponse
        {
            AccessToken = accessToken,
            RefreshToken = refreshToken
        });
    }

    public async Task<Result> ResendVerifyEmailAsync(ResendVerifyEmailRequest resendVerifyEmailRequest)
    {
        var userByEmail = await _userRepository.GetByEmailAsync(resendVerifyEmailRequest.Email);
        if (userByEmail == null)
        {
            return Result.Failure(400, UserErrors.EmailNotAlreadyRegister);
        }

        if (HasUserVerifiedEmail(userByEmail))
        {
            return Result.Failure(400, UserErrors.EmailAlreadyVerified);
        }

        var userWithDetail = await _userRepository.GetByIdAsync(userByEmail.Id, nameof(User.UserDetail));

        await SendVerifyEmailCodeUserAsync(userWithDetail!);

        return Result<string>.Success(AuthCommandMessages.ResendVerifyEmailSuccessfully);
    }

    public async Task<Result> RefreshTokenAsync(RefreshTokenRequest refreshTokenRequest)
    {
        var claimPrincipal = _jwtServices.ValidateAndDecode(refreshTokenRequest.AccessToken);

        var userId = GetUserIdFromTokenClaims(claimPrincipal);
        var refreshTokenId = GetRefreshTokenIdFromTokenClaims(claimPrincipal);
        var user = await _userRepository.GetByIdAsync(userId);

        ValidateUserNotNull(user);

        await ValidateAndRevokeRefreshTokenAsync(user!, refreshTokenRequest.RefreshToken, refreshTokenId);
        var refreshToken = _jwtServices.GenerateRefreshToken();
        var freshTokenObject = new RefreshToken
        {
            UserId = user!.Id,
            Value = HashingHelper.HashData(refreshToken),
            Expired = DateTime.UtcNow.AddDays(_jwtTokenOptions.ExpireRefreshTokenDays),
        };
        _refreshTokenRepository.Add(freshTokenObject);

        await _unitOfWork.SaveChangesAsync();
        var accessToken = _jwtServices.GenerateAccessToken(user!, freshTokenObject.Id);

        return Result<RefreshTokenResponse>.Success(new RefreshTokenResponse
        {
            AccessToken = accessToken,
            RefreshToken = refreshToken,
        });
    }

    public async Task<Result> VerifyForgotPasswordAsync(VerifyForgotPasswordRequest verifyForgotPasswordRequest)
    {
        var user = await _userRepository.GetByEmailAsync(verifyForgotPasswordRequest.Email);
        if (user == null)
        {
            return Result.Failure(400, UserErrors.EmailNotAlreadyRegister);
        }

        var code = GetForgotPasswordCodeFromMemory(user);
        if (code != verifyForgotPasswordRequest.Code)
        {
            return Result.Failure(400, UserErrors.VerifyEmailCodeIncorrect);
        }
        return Result<string>.Success(AuthCommandMessages.VerifyForgotPasswordCodeSuccessfully);
    }

    public async Task<Result> ResetPasswordAsync(ResetPasswordRequest resetPasswordRequest)
    {
        var user = await _userRepository.GetByEmailAsync(resetPasswordRequest.Email);
        if (user == null)
        {
            return Result.Failure(400, UserErrors.EmailNotAlreadyRegister);
        }

        var code = GetForgotPasswordCodeFromMemory(user);
        if (code != resetPasswordRequest.Code)
        {
            return Result.Failure(400, UserErrors.VerifyEmailCodeIncorrect);
        }

        user.Password = HashingHelper.HashData(resetPasswordRequest.NewPassword);
        _userRepository.Update(user);
        await _unitOfWork.SaveChangesAsync();

        return Result<string>.Success(AuthCommandMessages.ResetPasswordSuccessfully);
    }

    public async Task<Result> GetCurrentUserAsync()
    {
        var userId = _executionContext.GetUserId();
        var user = await _userRepository.GetByIdAsync(userId, nameof(User.UserDetail));
        ValidateUserNotNull(user);
        var currentUser = new CurrentUserResponse
        {
            Id = user!.Id,
            Email = user.Email,
            Role = user.Role,
            FullName = user.UserDetail.FullName,
            AvatarUrl = user.UserDetail.AvatarUrl
        };
        return Result<CurrentUserResponse>.Success(currentUser);
    }

    public async Task<Result> GetCurrentUserDetailAsync()
    {
        var userId = _executionContext.GetUserId();
        var user = await _userRepository.GetByIdAsync(userId,
            nameof(User.UserDetail),
            nameof(User.UserExpertises),
            nameof(User.UserCourseCategories));

        ValidateUserNotNull(user);

        var expertises = new List<ExpertiseResponse>();
        if (user!.UserExpertises != null)
        {
            var expertiseIds = user.UserExpertises.Select(ue => ue.ExpertiseId).ToList();
            var expertiseEntities = await _expertiseRepository.GetByIdsAsync(expertiseIds);
            expertises = expertiseEntities.Select(e => new ExpertiseResponse
            {
                Id = e.Id,
                Name = e.Name
            }).ToList();
        }

        var courseCategories = new List<CourseCategoryResponse>();
        if (user.UserCourseCategories != null)
        {
            var categoryIds = user.UserCourseCategories.Select(ucc => ucc.CourseCategoryId).ToList();
            var categoryEntities = await _courseCategoryRepository.GetByIdsAsync(categoryIds);
            courseCategories = categoryEntities.Select(c => new CourseCategoryResponse
            {
                Id = c.Id,
                Name = c.Name,
                Description = c.Description
            }).ToList();
        }

        var currentUserDetail = user.ToCurrentUserDetailResponse(expertises, courseCategories);

        return Result<CurrentUserDetailResponse>.Success(currentUserDetail);
    }

    public async Task<Result> EditingProfileUserAsync(EditingUserProfileRequest editingUserProfileRequest)
    {
        var userId = _executionContext.GetUserId();
        var user = await _userRepository.GetByIdAsync(userId, nameof(User.UserDetail), nameof(User.UserExpertises), nameof(User.UserCourseCategories));
        ValidateUserNotNull(user);

        if (editingUserProfileRequest.Expertises != null && !await ValidateExpertiseValidAsync(editingUserProfileRequest.Expertises))
        {
            return Result.Failure(400, UserErrors.UserExpertiseInvalid);
        }

        if (editingUserProfileRequest.CourseCategoryIds != null && !await ValidateCourseCategoryValidAsync(editingUserProfileRequest.CourseCategoryIds))
        {
            return Result.Failure(400, UserErrors.UserCourseCategoryInvalid);
        }

        user.IsNotification = editingUserProfileRequest.IsNotification;
        user.IsPrivateProfile = editingUserProfileRequest.IsPrivateProfile;
        user.IsReceiveMessage = editingUserProfileRequest.IsReceiveMessage;

        if (user.UserDetail != null)
        {
            user.UserDetail.FullName = editingUserProfileRequest.FullName?.Trim();
            user.UserDetail.Bio = editingUserProfileRequest.Bio?.Replace("\r\n", "\n")?.Trim();
            user.UserDetail.Experience = editingUserProfileRequest.Experience?.Replace("\r\n", "\n")?.Trim();
            user.UserDetail.ProfessionalSkill = editingUserProfileRequest.ProfessionalSkill?.Replace("\r\n", "\n")?.Trim();
            user.UserDetail.Goals = editingUserProfileRequest.Goals?.Replace("\r\n", "\n")?.Trim();
            user.UserDetail.Duration = editingUserProfileRequest.Duration;
            user.UserDetail.SessionFrequency = (SessionFrequency)editingUserProfileRequest.SessionFrequency;

            if (editingUserProfileRequest.CommunicationPreference != null)
            {
                user.UserDetail.CommunicationPreference = (CommunicationPreference)editingUserProfileRequest.CommunicationPreference.Value;
            }

            if (editingUserProfileRequest.LearningStyle != null)
            {
                user.UserDetail.LearningStyle = (LearningStyle)editingUserProfileRequest.LearningStyle.Value;
            }

            if (editingUserProfileRequest.TeachingStyles != null)
            {
                user.UserDetail.TeachingStyles = editingUserProfileRequest.TeachingStyles
                    .Select(t => (TeachingStyle)t)
                    .ToList();
            }

            if (editingUserProfileRequest.Availability != null)
            {
                user.UserDetail.Availability = editingUserProfileRequest.Availability
                    .Select(a => (UserAvailability)a)
                    .ToList();
            }

        if (editingUserProfileRequest.Expertises != null)
        {
            if (user.UserExpertises?.Any() == true)
            {
                user.UserExpertises.Clear();
            }

            var userExpertises = GetUserExpertises(editingUserProfileRequest.Expertises);
            if (userExpertises != null)
            {
                user.UserExpertises = userExpertises;
                foreach (var userExpertise in userExpertises)
                {
                    userExpertise.UserId = user.Id;
                }
            }
        }

        if (editingUserProfileRequest.CourseCategoryIds != null)
        {
            if (user.UserCourseCategories?.Any() == true)
            {
                user.UserCourseCategories.Clear();
            }

            var userCourseCategories = GetUserCourseCategories(editingUserProfileRequest.CourseCategoryIds);
            if (userCourseCategories != null)
            {
                user.UserCourseCategories = userCourseCategories;
                foreach (var userCourseCategory in userCourseCategories)
                {
                    userCourseCategory.UserId = user.Id;
                }
            }
        }

        if (editingUserProfileRequest.AvatarUrl != null)
        {
            var userAvatarUrl = await UploadImageAndGetAvatarUrlAsync(editingUserProfileRequest.AvatarUrl);
            if (user.UserDetail != null)
            {
                user.UserDetail.AvatarUrl = userAvatarUrl;
            }
        }
        }

        _userRepository.Update(user);
        await _unitOfWork.SaveChangesAsync();

        return Result<string>.Success(AuthCommandMessages.EditingUserProfileSuccessfully);
    }

    public async Task<Result> ChangePasswordAsync(ChangePasswordRequest changePasswordRequest)
    {
        var userId = _executionContext.GetUserId();
        var user = await _userRepository.GetByIdAsync(userId);

        if (user == null)
        {
            return Result.Failure(400, UserErrors.UserNotExists);
        }

        if (!IsPasswordLoginMatchWithPassword(changePasswordRequest.CurrentPassword, user.Password))
        {
            return Result.Failure(400, UserErrors.CurrentPasswordIncorrect);
        }

        user.Password = HashingHelper.HashData(changePasswordRequest.Password);
        _userRepository.Update(user);
        await _unitOfWork.SaveChangesAsync();

        return Result<string>.Success(AuthCommandMessages.ChangePasswordSuccessfully);
    }

    private async Task ValidateAndRevokeRefreshTokenAsync(User user, string refreshToken, Guid refreshTokenId)
    {
        var refreshTokenObject = await _refreshTokenRepository.GetByIdAsync(refreshTokenId);

        if (refreshTokenObject == null || refreshTokenObject.UserId != user.Id || !HashingHelper.VerifyData(refreshToken, refreshTokenObject!.Value)
            || refreshTokenObject.Expired < DateTime.UtcNow)
        {
            throw new BadRequestException(ApplicationExceptionMessage.RefreshTokenNotExists);
        }

        _refreshTokenRepository.Remove(refreshTokenObject);
        await _unitOfWork.SaveChangesAsync();
    }
    private string GetVerifyCodeEmailFromMemory(User user)
    {
        var cacheKey = StringHelper.ReplacePlaceholders(CacheKeyConstants.VerifyEmailCode,
            user.Id.ToString());
        return _memoryCache.Get(cacheKey)?.ToString() ?? string.Empty;
    }
    private string GetForgotPasswordCodeFromMemory(User user)
    {
        var cacheKey = StringHelper.ReplacePlaceholders(CacheKeyConstants.ForgotPasswordCode,
            user.Id.ToString());
        return _memoryCache.Get(cacheKey)?.ToString() ?? string.Empty;
    }
    private static Guid GetUserIdFromTokenClaims(ClaimsPrincipal claimsPrincipal)
    {
        if (!Guid.TryParse(claimsPrincipal.FindFirst(JwtRegisteredClaimNames.Sid)!.Value, out Guid userId))
        {
            throw new BadRequestException(ApplicationExceptionMessage.UserIdInExecutionContextInvalid);
        }
        return userId;
    }

    private static Guid GetRefreshTokenIdFromTokenClaims(ClaimsPrincipal claimsPrincipal)
    {
        if (!Guid.TryParse(claimsPrincipal.FindFirst(JwtRegisteredClaimNames.Jti)!.Value, out Guid userId))
        {
            throw new BadRequestException(ApplicationExceptionMessage.RefreshTokenIdInExecutionContextInvalid);
        }
        return userId;
    }
    private async Task<string> UploadImageAndGetAvatarUrlAsync(IFormFile? formFile)
    {
        var imageUrl = string.Empty;
        if (formFile != null)
        {
            try
            {
                imageUrl = await _fileStorageServices.UploadFileAsync(formFile);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, ex.Message);
            }
        }
        return imageUrl;
    }
    private async Task SendVerifyEmailCodeUserAsync(User user)
    {
        var mailContent = await GetVerifyEmailContentAsync(user);

        var sendMailData = new SendMailData
        {
            ToEmail = user.Email,
            Subject = MailInformationConstants.TitleVerifyCodeEmail,
            Body = mailContent,
        };

        await AddEmailWorkItemIntoQueueAsync(sendMailData);
    }

    private static void ValidateUserNotNull(User? user)
    {
        if (user == null)
        {
            throw new BadRequestException(ApplicationExceptionMessage.UserNotExists);
        }
    }

    private async Task AddEmailWorkItemIntoQueueAsync(SendMailData sendMailData)
    {
        await _mailQueue.QueueBackgroundWorkItemAsync(async (sp, cancellationToken) =>
        {
            var mailServices = sp.GetRequiredService<IApplicationMailServices>();
            await mailServices.SendMailAsync(
                sendMailData,
                cancellationToken: cancellationToken
            );
        });
    }

    private async Task SendEmailForgotPasswordCodeUserAsync(User user)
    {
        var mailContent = await GetForgotPasswordMailAsync(user);


        var sendMailData = new SendMailData
        {
            ToEmail = user.Email,
            Subject = MailInformationConstants.TitleVerifyCodeEmail,
            Body = mailContent,
        };
        await AddEmailWorkItemIntoQueueAsync(sendMailData);

    }

    private async Task<bool> ValidateCourseCategoryValidAsync(List<Guid> courseCategoryIds)
    {
        var courseCategory = await _courseCategoryRepository.GetByIdsAsync(courseCategoryIds);
        if (courseCategory.Count != courseCategoryIds.Count)
        {
            return false;
        }

        return true;
    }

    private static List<UserExpertise>? GetUserExpertises(List<Guid>? expertiseIds)
    {
        return expertiseIds?
            .Select(id => new UserExpertise { ExpertiseId = id })
            .ToList();
    }
    private static List<UserCourseCategory>? GetUserCourseCategories(List<Guid>? courseCategoryIds)
    {
        return courseCategoryIds?
            .Select(id => new UserCourseCategory { CourseCategoryId = id })
            .ToList();
    }
    private async Task<bool> ValidateExpertiseValidAsync(List<Guid> expertiseIds)
    {
        var expertise = await _expertiseRepository.GetByIdsAsync(expertiseIds);
        if (expertise.Count != expertiseIds.Count)
        {
            return false;
        }

        return true;
    }

    private async Task<string> GetForgotPasswordMailAsync(User user)
    {

        var code = GenerateVerifyCode();

        SetForgotPasswordCodeIntoMemory(user, code, EmailForgotPasswordModel.ExpireMinutesDefault);

        var emailVerificationModel = new EmailForgotPasswordModel
        {
            Code = code,
            RecipientName = user.UserDetail.FullName
        };
        return await _razorLightEngine.CompileRenderAsync("Templates.ForgotPasswordTemplate", emailVerificationModel);
    }

    private async Task<string> GetVerifyEmailContentAsync(User user)
    {

        var code = GenerateVerifyCode();

        SetVerifyCodeIntoMemory(user, code, EmailVerificationModel.ExpireMinutesDefault);

        var emailVerificationModel = new EmailVerificationModel
        {
            Code = code,
            RecipientName = user.UserDetail.FullName
        };
        return await _razorLightEngine.CompileRenderAsync("Templates.VerifyMailTemplate", emailVerificationModel);
    }

    private static string GenerateVerifyCode()
    {
        var random = new Random();
        int code = random.Next(0, 1_000_000);

        return code.ToString("D6");
    }

    private void SetVerifyCodeIntoMemory(User user, string code, int expireMinutes = 5)
    {
        var cacheKey = StringHelper.ReplacePlaceholders(CacheKeyConstants.VerifyEmailCode,
                                                user.Id.ToString());
        _memoryCache.Set(cacheKey, code, TimeSpan.FromMinutes(expireMinutes));
    }
    private void SetForgotPasswordCodeIntoMemory(User user, string code, int expireMinutes = 5)
    {
        var cacheKey = StringHelper.ReplacePlaceholders(CacheKeyConstants.ForgotPasswordCode,
            user.Id.ToString());
        _memoryCache.Set(cacheKey, code, TimeSpan.FromMinutes(expireMinutes));
    }

    private static bool IsPasswordLoginMatchWithPassword(string passwordLogin, string password)
    {
        return HashingHelper.VerifyData(passwordLogin, password);
    }

    private static bool IsUserDeactivated(User user)
    {
        return user.IsActive;
    }

    private static bool HasUserVerifiedEmail(User user)
    {
        return user.IsVerifyEmail;
    }

    private async Task RecallUserAccessAndRefreshTokenAsync(User user)
    {
        var refreshTokenId = _executionContext.GetIdentityTokenId();
        var refreshToken = await _refreshTokenRepository.GetByIdAsync(refreshTokenId);

        _refreshTokenRepository.Remove(refreshToken!);
        _jwtServices.RecallAccessToken();
        await _unitOfWork.SaveChangesAsync();
    }

}
