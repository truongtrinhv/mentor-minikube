
namespace MentorPlatform.CrossCuttingConcerns.Exceptions;

public class UploadFileException : BadRequestException
{
    public UploadFileException(string message) : base(message)
    {
    }
}
