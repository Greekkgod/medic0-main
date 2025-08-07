import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Upload, File, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface FileUploadProps {
  onFileContent: (content: string, filename: string) => void;
  className?: string;
}

const FileUpload = ({ onFileContent, className }: FileUploadProps) => {
  const { toast } = useToast();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        onFileContent(content, file.name);
        toast({
          title: "File uploaded successfully",
          description: `${file.name} has been loaded into the transcript area.`,
        });
      };
      reader.readAsText(file);
    }
  }, [onFileContent, toast]);

  const { getRootProps, getInputProps, isDragActive, acceptedFiles } = useDropzone({
    onDrop,
    accept: {
      'text/plain': ['.txt'],
      'text/csv': ['.csv'],
      'application/rtf': ['.rtf'],
      'text/html': ['.html']
    },
    maxFiles: 1,
    onDropRejected: () => {
      toast({
        title: "Invalid file type",
        description: "Please upload a text file (.txt, .csv, .rtf, .html)",
        variant: "destructive",
      });
    }
  });

  return (
    <div className={className}>
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          isDragActive
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25 hover:border-primary/50"
        }`}
      >
        <input {...getInputProps()} />
        <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
        {isDragActive ? (
          <p className="text-primary">Drop the transcript file here...</p>
        ) : (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Drag & drop a transcript file here, or click to select
            </p>
            <p className="text-xs text-muted-foreground">
              Supports: .txt, .csv, .rtf, .html files
            </p>
          </div>
        )}
      </div>
      
      {acceptedFiles.length > 0 && (
        <div className="mt-4">
          {acceptedFiles.map((file, index) => (
            <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded">
              <File className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm flex-1">{file.name}</span>
              <span className="text-xs text-muted-foreground">
                {(file.size / 1024).toFixed(1)} KB
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FileUpload;