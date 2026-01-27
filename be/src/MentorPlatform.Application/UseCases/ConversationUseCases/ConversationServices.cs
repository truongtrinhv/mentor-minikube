using MentorPlatform.Application.Commons.Enums;
using MentorPlatform.Application.Commons.Errors;
using MentorPlatform.Application.Commons.Mappings;
using MentorPlatform.Application.Commons.Models.Requests.ConversationRequests;
using MentorPlatform.Application.Commons.Models.Responses.ConversationResponses;
using MentorPlatform.Application.Services.File;
using MentorPlatform.Application.Services.FileStorage;
using MentorPlatform.CrossCuttingConcerns.Options;
using MentorPlatform.Domain.Entities;
using MentorPlatform.Domain.Enums;
using MentorPlatform.Domain.Repositories;
using MentorPlatform.Domain.Shared;
using Microsoft.Extensions.Options;
using System.Text.RegularExpressions;

namespace MentorPlatform.Application.UseCases.ConversationUseCases;
public class ConversationServices : IConversationServices
{
    private readonly IConversationRepository _conversationRepository;
    private readonly IUserRepository _userRepository;
    private readonly IMessageRepository _messageRepository;
    private readonly INotificationRepository _notificationRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IFileStorageServices _fileStorageServices;
    private readonly FileStorageOptions _fileStorageOptions;

    public ConversationServices(IConversationRepository conversationRepository,
        IUserRepository userRepository,
        IUnitOfWork unitOfWork,
        IFileStorageFactory fileStorageFactory,
        IOptions<FileStorageOptions> fileStorageOptions,
        IMessageRepository messageRepository,
        INotificationRepository notificationRepository)
    {
        _conversationRepository = conversationRepository;
        _userRepository = userRepository;
        _messageRepository = messageRepository;
        _notificationRepository = notificationRepository;
        _unitOfWork = unitOfWork;
        _fileStorageServices = fileStorageFactory.Get();
        _fileStorageOptions = fileStorageOptions.Value;
    }

    public async Task<Result<SyncData>> GetSyncingData(Guid userId)
    {
        var user = await _userRepository.GetByIdAsync(userId, nameof(User.UserDetail));
        if (user == null)
        {
            return Result<SyncData>.Failure(ConversationErrors.UserNotFound);
        }

        var conversationsQuery = _conversationRepository.GetQueryable()
            .Where(c => c.Participants.Any(p => p.UserId == userId));
        var selectedConversations = await _conversationRepository
            .ToListAsync(conversationsQuery, nameof(Conversation.Participants), nameof(Conversation.Messages),
            $"{nameof(Conversation.Participants)}.{nameof(Participant.User)}",
            $"{nameof(Conversation.Participants)}.{nameof(Participant.User)}.{nameof(User.UserDetail)}",
            $"{nameof(Conversation.Messages)}.{nameof(Message.Attachments)}");
        var notificationsQuery = _notificationRepository.GetQueryable()
            .Where(n => n.OwnerId == userId)
            .OrderByDescending(n => n.CreatedAt)
            .Take(8);
        var selectedNotifications = await _notificationRepository.ToListAsync(notificationsQuery);

        var syncData = new SyncData
        {
            Conversations = (selectedConversations.Select(c => c.ToResponse(userId)) ?? []).ToList(),
            Notifications = selectedNotifications.Select(c => c.ToResponse()).ToList()
        };
        return syncData;
    }

    public async Task<Result<ConversationResponse>> CreateConversation(Guid userId, CreateConversationRequest request)
    {
        if (request.UserIds.Count == 0)
        {
            return Result<ConversationResponse>.Failure(ConversationErrors.UserIdRequired);
        }
        if (request.IsGroup && (string.IsNullOrWhiteSpace(request.ConversationName) || request.UserIds.Count < 2))
        {
            return Result<ConversationResponse>.Failure(ConversationErrors.GroupNeedMoreThanTwoMembers);
        }
        if (request.UserIds.Contains(userId))
        {
            return Result<ConversationResponse>.Failure(ConversationErrors.CannotAddYourselfToConversation);
        }

        var usersQuery = _userRepository.GetQueryable()
            .Where(u => request.UserIds.Contains(u.Id));
        var selectedUsers = await _userRepository.ToListAsync(usersQuery, nameof(User.UserDetail));
        if (selectedUsers.Any(u => !u.IsReceiveMessage))
        {
            return Result<ConversationResponse>.Failure();
        }

        if (!request.IsGroup && request.UserIds.Count == 1)
        {
            var isConversationExistedQuery = _conversationRepository.GetQueryable()
                .Where(c => c.Participants.Any(p => p.UserId == userId) &&
                          c.Participants.Any(p => request.UserIds[0] == p.UserId) &&
                          !c.IsGroup);
            var isConversationExisted = await _conversationRepository.AnyAsync(isConversationExistedQuery);
            if (isConversationExisted)
            {
                return Result<ConversationResponse>.Failure(ConversationErrors.ConversationAlreadyExists);
            }
        }

        var user = await _userRepository.GetByIdAsync(userId, nameof(User.UserDetail));
        var notificationList = new List<Notification>();
        var newConversation = new Conversation
        {
            ConversationName = request.IsGroup ? request.ConversationName! : "",
            IsGroup = request.IsGroup,
        };

        newConversation.Participants = [new Participant { UserId = userId, LastRead = DateTime.UtcNow }];
        foreach (var selectedUser in selectedUsers)
        {
            newConversation.Participants.Add(new Participant { UserId = selectedUser.Id, LastRead = DateTime.UtcNow });
            var newNotification = new Notification
            {
                Title = "New Conversation",
                Message = request.IsGroup ? $"{user.UserDetail.FullName} added you to a new conversation" : $"{user.UserDetail.FullName} started a new conversation with you",
                OwnerId = selectedUser.Id,
                IsRead = false
            };
            notificationList.Add(newNotification);
        }

        _notificationRepository.AddRange(notificationList);
        _conversationRepository.Add(newConversation);
        await _unitOfWork.SaveChangesAsync();
        newConversation = await _conversationRepository
            .GetByIdAsync(newConversation.Id, nameof(Conversation.Participants), nameof(Conversation.Messages),
            $"{nameof(Conversation.Participants)}.{nameof(Participant.User)}",
            $"{nameof(Conversation.Participants)}.{nameof(Participant.User)}.{nameof(User.UserDetail)}");
        var result = newConversation.ToResponse(userId);
        result.Notification = notificationList.Count > 0 ? notificationList[0].ToResponse() : null;
        return result;
    }

    public async Task<Result<MessageResponse>> CreateMessage(Guid userId, SendMessageRequest request)
    {
        var selectedConversation = await _conversationRepository.GetByIdAsync(request.ConversationId, nameof(Conversation.Participants));
        if (selectedConversation == null)
        {
            return Result<MessageResponse>.Failure(ConversationErrors.ConversationNotFound);
        }

        var processedContent = request.Content?.Replace("\r\n", "\n")?.Trim();
        if (string.IsNullOrWhiteSpace(processedContent))
        {
            return Result<MessageResponse>.Failure(ConversationErrors.MessageContentEmpty);
        }
        if (!selectedConversation.Participants!.Any(p => p.UserId == userId))
        {
            return Result<MessageResponse>.Failure(ConversationErrors.UserNotInConversation);
        }

        var newMessage = new Message
        {
            Content = processedContent,
            SenderId = userId,
            ConversationId = request.ConversationId
        };

        _messageRepository.Add(newMessage);
        await _unitOfWork.SaveChangesAsync();

        selectedConversation.Participants.First(p => p.UserId == userId).LastRead = DateTime.UtcNow;
        await _unitOfWork.SaveChangesAsync();

        return newMessage.ToResponse();
    }

    public async Task<Result<MessageResponse>> CreateMessageWithFile(Guid userId, FileMessageRequest request)
    {
        var selectedConversation = await _conversationRepository.GetByIdAsync(request.ConversationId, nameof(Conversation.Participants));
        if (selectedConversation == null)
        {
            return Result<MessageResponse>.Failure(ConversationErrors.ConversationNotFound);
        }
        if (!selectedConversation.Participants!.Any(p => p.UserId == userId))
        {
            return Result<MessageResponse>.Failure(ConversationErrors.UserNotInConversation);
        }

        try
        {
            var processedContent = request.Content?.Replace("\r\n", "\n")?.Trim() ?? "";

            var newMessage = new Message
            {
                Content = processedContent,
                SenderId = userId,
                ConversationId = request.ConversationId,
                Attachments = []
            };

            foreach (var file in request.Files)
            {
                var fileUrl = await _fileStorageServices.UploadFileAsync(file, UploadType.Default);

                string fileExtension = Path.GetExtension(file.FileName).ToLowerInvariant();
                string fileType = string.Empty;
                if (_fileStorageOptions.MediaSettings?.Images?.AllowedExtensions != null &&
                    _fileStorageOptions.MediaSettings.Images.AllowedExtensions.Contains(fileExtension))
                {
                    fileType = "Image";
                }
                else if (_fileStorageOptions.MediaSettings?.Videos?.AllowedExtensions != null &&
                         _fileStorageOptions.MediaSettings.Videos.AllowedExtensions.Contains(fileExtension))
                {
                    fileType = "Video";
                }
                else if (_fileStorageOptions.MediaSettings?.Documents?.AllowedExtensions != null &&
                        _fileStorageOptions.MediaSettings.Documents.AllowedExtensions.Contains(fileExtension))
                {
                    fileType = "Document";
                }
                var attachment = new Attachment
                {
                    Url = fileUrl,
                    Type = fileType,
                    Size = (int)file.Length,
                };
                newMessage.Attachments.Add(attachment);
            }

            selectedConversation.Participants.First(p => p.UserId == userId).LastRead = DateTime.UtcNow;
            _messageRepository.Add(newMessage);
            await _unitOfWork.SaveChangesAsync();

            return newMessage.ToResponse();
        }
        catch
        {
            return Result<MessageResponse>.Failure();
        }
    }

    public async Task<Result> LeaveGroup(Guid userId, Guid conversationId)
    {
        var selectedConversation = await _conversationRepository.GetByIdAsync(conversationId, nameof(Conversation.Participants));
        if (selectedConversation == null)
        {
            return Result<MessageResponse>.Failure(ConversationErrors.ConversationNotFound);
        }
        if (!selectedConversation.Participants!.Any(p => p.UserId == userId))
        {
            return Result<MessageResponse>.Failure(ConversationErrors.UserNotInConversation);
        }

        selectedConversation.Participants.Remove(selectedConversation.Participants.First(p => p.UserId == userId));
        await _unitOfWork.SaveChangesAsync();
        return Result.Success();
    }

    public async Task<Result<ConversationResponse>> GetSyncingConversation(Guid userId, Guid conversationId)
    {
        var conversation = await _conversationRepository
            .GetByIdAsync(conversationId, nameof(Conversation.Participants), nameof(Conversation.Messages),
            $"{nameof(Conversation.Participants)}.{nameof(Participant.User)}",
            $"{nameof(Conversation.Participants)}.{nameof(Participant.User)}.{nameof(User.UserDetail)}",
            $"{nameof(Conversation.Messages)}.{nameof(Message.Attachments)}");
        if (conversation == null)
        {
            return Result<ConversationResponse>.Failure(ConversationErrors.ConversationNotFound);
        }
        return conversation.ToResponse(userId);
    }

    public async Task<Result<List<UserResponse>>> SearchUsers(Guid userId, string keyword)
    {
        if (string.IsNullOrWhiteSpace(keyword))
        {
            return Result<List<UserResponse>>.Failure(ConversationErrors.SearchKeywordRequired);
        }
        var processedKeyword = keyword.Trim().ToLower();
        var usersQuery = _userRepository.GetQueryable()
            .Where(u => u.Id != userId &&
                        u.IsActive &&
                        u.IsReceiveMessage &&
                        (u.Role != Role.Mentor || (u.ApplicationRequests != null && u.ApplicationRequests.Any(ar => ar.Status == ApplicationRequestStatus.Approved))) &&
                        (u.UserDetail.FullName.ToLower().Contains(processedKeyword) || u.Email.ToLower().Contains(processedKeyword)));
        var selectedUsers = await _userRepository.ToListAsync(usersQuery, nameof(User.UserDetail));

        return selectedUsers.Select(u => u.ToSyncResponse()).ToList();
    }

    public async Task<Result> MarkConversationAsRead(Guid userId, Guid conversationId)
    {
        var conversation = await _conversationRepository.GetByIdAsync(conversationId, nameof(Conversation.Participants));
        if (conversation == null)
        {
            return Result.Failure(ConversationErrors.ConversationNotFound);
        }

        var participant = conversation.Participants!.FirstOrDefault(p => p.UserId == userId);
        if (participant == null)
        {
            return Result.Failure(ConversationErrors.UserNotInConversation);
        }

        participant.LastRead = DateTime.UtcNow;
        await _unitOfWork.SaveChangesAsync();

        return Result.Success();
    }

    public async Task<NotificationsComplex> CreateMentionNotification(Guid userId, Guid conversationId, MessageResponse message)
    {
        var user = await _userRepository.GetByIdAsync(userId, nameof(User.UserDetail));
        var conversation = await _conversationRepository.GetByIdAsync(conversationId);
        var listIds = ExtractUserIds(message.Content);

        var listNoti = new List<Notification>();
        var conversationName = conversation?.IsGroup == true ? conversation.ConversationName : "your conversation";
        var userName = user?.UserDetail?.FullName ?? "Someone";
        foreach (var id in listIds)
        {
            if (Guid.TryParse(id, out var guid))
            {
                listNoti.Add(new Notification
                {
                    Title = "Message",
                    Message = $"{userName} mention you in {conversationName}",
                    OwnerId = guid
                });
            }
        }

        _notificationRepository.AddRange(listNoti);
        await _unitOfWork.SaveChangesAsync();

        var notificationsComplex = new NotificationsComplex
        {
            Notification = listNoti.Count > 0 ? listNoti[0].ToResponse() : null,
            UserIds = listIds,
            Mentioner = userId
        };
        return notificationsComplex;
    }

    public async Task<Result> MarkNotificationAsRead(Guid userId, Guid notificationId)
    {
        var selectedNotification = await _notificationRepository.GetByIdAsync(notificationId);
        if (selectedNotification == null)
        {
            return Result.Failure(ConversationErrors.NotificationNotFound);
        }
        if (selectedNotification.OwnerId != userId)
        {
            return Result.Failure(ConversationErrors.NotificationNotBelongToUser);
        }
        selectedNotification.IsRead = true;
        await _unitOfWork.SaveChangesAsync();
        return Result.Success();
    }

    public async Task<Result> MarkNotificationsAsRead(Guid userId, List<Guid> notificationIds)
    {
        if (notificationIds.Count == 0)
        {
            return Result.Failure();
        }
        var selectedNotifications = await _notificationRepository.GetByIdsAsync(notificationIds);
        if (selectedNotifications.Any(n => n.OwnerId != userId))
        {
            return Result.Failure();
        }
        selectedNotifications.ForEach(n =>
        {
            n.IsRead = true;
        });
        await _unitOfWork.SaveChangesAsync();
        return Result.Success();
    }

    private static List<string> ExtractUserIds(string input)
    {
        var userIds = new List<string>();
        var pattern = @"@\[(.+?)\]";

        var matches = Regex.Matches(input, pattern);
        foreach (Match match in matches)
        {
            if (match.Success && match.Groups.Count > 1)
            {
                userIds.Add(match.Groups[1].Value);
            }
        }

        return userIds;
    }
}
