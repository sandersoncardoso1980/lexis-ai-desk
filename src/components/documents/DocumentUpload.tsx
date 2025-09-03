import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Upload, FileText, X, Check } from "lucide-react";
import { StorageService } from "@/services/storageService";

interface DocumentUploadProps {
  onUploadComplete?: (files: UploadedFile[]) => void;
  maxFiles?: number;
  allowedTypes?: string[];
}

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  filePath: string;
  signedUrl?: string;
}

export function DocumentUpload({ onUploadComplete, maxFiles = 5, allowedTypes }: DocumentUploadProps) {
  const [uploadingFiles, setUploadingFiles] = useState<Array<{
    file: File;
    progress: number;
    status: 'uploading' | 'completed' | 'error';
    error?: string;
  }>>([]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    // Initialize upload states
    const initialUploads = acceptedFiles.map(file => ({
      file,
      progress: 0,
      status: 'uploading' as const
    }));

    setUploadingFiles(initialUploads);

    const uploadResults: UploadedFile[] = [];

    // Upload files sequentially to show progress
    for (let i = 0; i < acceptedFiles.length; i++) {
      const file = acceptedFiles[i];
      
      try {
        // Simulate progress updates
        const progressInterval = setInterval(() => {
          setUploadingFiles(prev => prev.map((upload, index) => 
            index === i && upload.progress < 90
              ? { ...upload, progress: upload.progress + 10 }
              : upload
          ));
        }, 200);

        const result = await StorageService.uploadFile(file, 'documents');
        
        clearInterval(progressInterval);

        // Complete the upload
        setUploadingFiles(prev => prev.map((upload, index) => 
          index === i 
            ? { ...upload, progress: 100, status: 'completed' }
            : upload
        ));

        uploadResults.push({
          id: Math.random().toString(36).substring(2),
          name: file.name,
          size: file.size,
          type: file.type,
          filePath: result.filePath,
          signedUrl: result.signedUrl
        });

        toast.success(`${file.name} enviado com sucesso!`);

      } catch (error: any) {
        setUploadingFiles(prev => prev.map((upload, index) => 
          index === i 
            ? { ...upload, status: 'error', error: error.message }
            : upload
        ));

        toast.error(`Erro ao enviar ${file.name}: ${error.message}`);
      }
    }

    // Call completion callback
    if (uploadResults.length > 0 && onUploadComplete) {
      onUploadComplete(uploadResults);
    }

    // Clear upload states after 3 seconds
    setTimeout(() => {
      setUploadingFiles([]);
    }, 3000);

  }, [onUploadComplete]);

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop,
    maxFiles,
    accept: allowedTypes ? Object.fromEntries(allowedTypes.map(type => [type, []])) : {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt'],
      'image/*': ['.png', '.jpg', '.jpeg', '.gif']
    },
    maxSize: 10 * 1024 * 1024 // 10MB
  });

  const removeUpload = (index: number) => {
    setUploadingFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <Card className="border-dashed">
        <CardContent className="p-6">
          <div
            {...getRootProps()}
            className={`cursor-pointer text-center p-8 rounded-lg border-2 border-dashed transition-colors ${
              isDragActive 
                ? 'border-primary bg-primary/5' 
                : 'border-muted-foreground/25 hover:border-primary/50'
            }`}
          >
            <input {...getInputProps()} />
            
            <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            
            {isDragActive ? (
              <p className="text-lg text-primary">Solte os arquivos aqui...</p>
            ) : (
              <div>
                <p className="text-lg font-medium mb-2">
                  Arraste e solte os arquivos aqui
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  ou clique para selecionar arquivos
                </p>
                <Button variant="outline">
                  Selecionar Arquivos
                </Button>
              </div>
            )}
            
            <div className="mt-4 text-xs text-muted-foreground">
              <p>Formatos aceitos: PDF, DOC, DOCX, TXT, PNG, JPG</p>
              <p>Tamanho máximo: 10MB por arquivo</p>
              <p>Máximo de {maxFiles} arquivos</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* File rejections */}
      {fileRejections.length > 0 && (
        <Card className="border-destructive">
          <CardContent className="p-4">
            <h4 className="text-sm font-medium text-destructive mb-2">
              Arquivos rejeitados:
            </h4>
            {fileRejections.map(({ file, errors }) => (
              <div key={file.name} className="text-sm text-destructive">
                <span className="font-medium">{file.name}</span>
                {errors.map(error => (
                  <p key={error.code} className="ml-2">• {error.message}</p>
                ))}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Upload progress */}
      {uploadingFiles.length > 0 && (
        <div className="space-y-2">
          {uploadingFiles.map((upload, index) => (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <FileText className="h-8 w-8 text-primary" />
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {upload.file.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {(upload.file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    
                    {upload.status === 'uploading' && (
                      <Progress value={upload.progress} className="mt-2" />
                    )}
                    
                    {upload.status === 'error' && (
                      <p className="text-xs text-destructive mt-1">
                        {upload.error}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {upload.status === 'completed' && (
                      <Check className="h-5 w-5 text-success" />
                    )}
                    
                    {upload.status === 'uploading' && (
                      <span className="text-xs text-muted-foreground">
                        {upload.progress}%
                      </span>
                    )}
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeUpload(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}