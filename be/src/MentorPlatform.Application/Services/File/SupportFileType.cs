namespace MentorPlatform.Application.Services.File;

public static class SupportFileType
{
    public static class Images
    {
        public const string Jpg = ".jpg";
        public const string Jpeg = ".jpeg";
        public const string Png = ".png";
        public const string Gif = ".gif";
        public const string Webp = ".webp";
        public const string Svg = ".svg";

        public static readonly string[] AllowedExtensions =
            [ Jpg, Jpeg, Png, Gif, Webp, Svg ];


    }

    public static class Videos
    {
        public const string Mp4 = ".mp4";
        public const string Avi = ".avi";
        public const string Mov = ".mov";
        public const string Wmv = ".wmv";
        public const string Webm = ".webm";

        public static readonly string[] AllowedExtensions =
            [ Mp4, Avi, Mov, Wmv, Webm ];


    }

    public static class Documents
    {
        public const string Pdf = ".pdf";
        public const string Docx = ".docx";
        public const string Doc = ".doc";
        public const string Pptx = ".pptx";
        public const string Ppt = ".ppt";
        public const string Txt = ".txt";

        public static readonly string[] AllowedExtensions =
            [ Pdf, Docx, Doc, Pptx, Ppt, Txt ];


    }
}
