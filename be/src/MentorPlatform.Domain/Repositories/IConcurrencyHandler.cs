
namespace MentorPlatform.Domain.Repositories;

public interface IConcurrencyHandler
{
    Task ApplyUpdatedValuesFromDataSource(Exception ex);
    bool IsDbUpdateConcurrencyException(Exception ex); 
}
