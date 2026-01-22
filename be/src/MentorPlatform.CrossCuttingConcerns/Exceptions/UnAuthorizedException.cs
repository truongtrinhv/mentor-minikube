
namespace MentorPlatform.CrossCuttingConcerns.Exceptions;

public class UnauthorizedException : ExceptionBase
{
    public UnauthorizedException(string message) : base(message)
    {
    }
}
