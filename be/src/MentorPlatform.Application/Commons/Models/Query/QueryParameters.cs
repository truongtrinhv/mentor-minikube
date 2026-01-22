namespace MentorPlatform.Application.Commons.Models.Query;
public class QueryParameters
{
    private int? _pageSize;
    private int? _pageNumber;

    public int PageSize
    {
        get => _pageSize is null or < 0 ? 10 : _pageSize.Value;
        set => _pageSize = value;
    }

    public int PageNumber
    {
        get => _pageNumber >= 1 ? _pageNumber.Value : 1;
        set => _pageNumber = value;
    }

    public string Search { get; set; } = string.Empty;
}
