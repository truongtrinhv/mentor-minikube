
namespace MentorPlatform.CrossCuttingConcerns.Helpers;

public static class StringHelper
{
    public static string ReplacePlaceholders(string template, params string[] values)
    {
        foreach (var value in values)
        {
            int start = template.IndexOf('{');
            if (start == -1) break;

            int end = template.IndexOf('}', start + 1);
            if (end == -1) break;

            string placeholder = template.Substring(start, end - start + 1);
            template = template.Replace(placeholder, value);
        }
        return template;
    }
}
