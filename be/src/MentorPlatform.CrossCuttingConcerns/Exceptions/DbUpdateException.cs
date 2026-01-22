
namespace MentorPlatform.CrossCuttingConcerns.Exceptions;

public class DbUpdateException : ExceptionBase
{
    public DbUpdateException(string message) : base(message)
    {
    }
}
