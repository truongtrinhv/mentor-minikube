
using System.Reflection;

namespace MentorPlatform.CrossCuttingConcerns.Helpers;

public static class FileHelper
{
    public static async Task<string> GetTemplateFile(string fileName)
    {
        try
        {
            var projectPath = Directory.GetParent(Directory.GetCurrentDirectory())!.FullName;
            var templateProject = Assembly.GetExecutingAssembly().GetName().Name;

            string templatesPath = Path.Combine(projectPath, templateProject!, "Templates");

            if (!Directory.Exists(templatesPath))
            {
                throw new DirectoryNotFoundException("Directory Not Found");
            }

            string filePath = Path.Combine(templatesPath, fileName);

            if (!File.Exists(filePath))
            {
                throw new FileNotFoundException("File Not Found");
            }

            using var reader = new StreamReader(filePath);
            return await reader.ReadToEndAsync();
        }
        catch (Exception ex)
        {
            throw new InvalidOperationException("Invalid Operation");
        }
    }
}
