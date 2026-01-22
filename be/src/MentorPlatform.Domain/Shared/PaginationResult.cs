
namespace MentorPlatform.Domain.Shared;
public class PaginationResult<T>
{
    public PaginationResult(int pageSize, int pageNumber, int totalCount, List<T> data)
    {
        PageSize = pageSize;
        PageNumber = pageNumber;
        TotalCount = totalCount;
        Items = data;
    }
    public PaginationResult(int totalCount, List<T> data)
    {
        PageSize = 10;
        PageNumber = 1;
        TotalCount = totalCount;
        Items = data;
    }

    public static PaginationResult<T> Create(int pageSize, int pageNumber, int totalCount, List<T> data)
    {
        return new PaginationResult<T>(pageSize, pageNumber, totalCount, data);
    }
    public static PaginationResult<T> Create(int totalCount, List<T> data)
    {
        return new PaginationResult<T>(totalCount, data);
    }
    public int PageSize { get; set; }

    public int PageNumber { get; set; }
    public int TotalCount { get; set; }

    public IEnumerable<T>? Items { get; set; }
}
