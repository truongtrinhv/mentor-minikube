
namespace MentorPlatform.CrossCuttingConcerns.Exceptions;

public class BadRequestException : ExceptionBase
{
    public BadRequestException(string message) : base(message)
    {
    }

}
