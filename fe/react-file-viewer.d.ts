declare module "react-file-viewer" {
    type FileViewerProps = {
        fileType: string;
        filePath: string;
        onError?: (error: any) => void;
        errorComponent?: React.ReactNode;
        unsupportedComponent?: React.ReactNode;
    };

    const FileViewer: React.FC<FileViewerProps>;
    export default FileViewer;
}
