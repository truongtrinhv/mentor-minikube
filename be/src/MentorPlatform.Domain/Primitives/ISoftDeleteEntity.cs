
namespace MentorPlatform.Domain.Primitives;

public interface ISoftDeleteEntity
{
    bool IsDeleted { get; set; }
}
