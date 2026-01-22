
namespace MentorPlatform.CrossCuttingConcerns.Exceptions;

public class ConcurrencyConflictException : ExceptionBase
{
    public ConcurrencyConflictException(string message) : base(message)
    {
    }
}
