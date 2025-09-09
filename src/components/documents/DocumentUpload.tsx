import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Upload, FileText, X, Check, AlertCircle } from "lucide-react";
import { StorageService } from "@/services/storageService";

interface DocumentUploadProps {
  onUploadComplete?: (files: UploadedFile[]) => void;
  maxFiles?: number;
  allowedTypes?: string[];
  className?: string;
}

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  filePath: string;
  signedUrl?: string;
}

export function DocumentUpload({ 
  onUploadComplete, 
  maxFiles = 5, 
  allowedTypes,
  className = ""
}: DocumentUploadProps) {
  const [uploadingFiles, setUploadingFiles] = useState<Array<{
    file: File;
    progress: number;
    status: 'uploading' | 'completed' | 'error';
    error?: string;
  }>>([]);

  // Validação de arquivo melhorada
  const validateFile = useCallback((file: File): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    const maxSize = 10 * 1024 * 1024; // 10MB
    const defaultAllowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'image/jpeg',
      'image/png',
      'image/jpg'
    ];

    const typesToCheck = allowedTypes || defaultAllowedTypes;

    if (file.size > maxSize) {
      errors.push(`Arquivo muito grande: ${(file.size / 1024 / 1024).toFixed(2)}MB (máx. 10MB)`);
    }

    if (!typesToCheck.includes(file.type)) {
      errors.push(`Tipo de arquivo não permitido: ${file.type}`);
    }

    if (file.name.length > 255) {
      errors.push(`Nome do arquivo muito longo (máx. 255 caracteres)`);
    }

    // Verificar caracteres especiais no nome do arquivo
    const invalidChars = /[<>:"/\\|?*]/;
    if (invalidChars.test(file.name)) {
      errors.push(`Nome do arquivo contém caracteres inválidos`);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }, [allowedTypes]);

  const onDrop = useCallback(async (acceptedFiles: File[], rejectedFiles: any[]) => {
    // Tratar arquivos rejeitados
    if (rejectedFiles.length > 0) {
      rejectedFiles.forEach(rejection => {
        const errors = rejection.errors.map((error: any) => error.message).join(', ');
        toast.error(`${rejection.file.name}: ${errors}`);
      });
    }

    if (acceptedFiles.length === 0) return;

    // Validar arquivos aceitos
    const validFiles: File[] = [];
    const invalidFiles: { file: File; errors: string[] }[] = [];

    acceptedFiles.forEach(file => {
      const validation = validateFile(file);
      if (validation.isValid) {
        validFiles.push(file);
      } else {
        invalidFiles.push({ file, errors: validation.errors });
      }
    });

    // Mostrar erros de validação
    invalidFiles.forEach(({ file, errors }) => {
      toast.error(`${file.name}: ${errors.join(', ')}`);
    });

    if (validFiles.length === 0) return;

    // Initialize upload states para arquivos válidos
    const initialUploads = validFiles.map(file => ({
      file,
      progress: 0,
      status: 'uploading' as const
    }));

    setUploadingFiles(prev => [...prev, ...initialUploads]);

    const uploadResults: UploadedFile[] = [];

    // Upload files sequentially to show progress
    for (let i = 0; i < validFiles.length; i++) {
      const file = validFiles[i];
      const uploadIndex = uploadingFiles.length + i;
      
      try {
        // Simulate progress updates mais realista
        const progressInterval = setInterval(() => {
          setUploadingFiles(prev => prev.map((upload, index) => 
            index === uploadIndex && upload.progress < 80
              ? { ...upload, progress: Math.min(upload.progress + Math.random() * 15, 80) }
              : upload
          ));
        }, 300);

        const result = await StorageService.uploadFile(file, 'documents');
        
        clearInterval(progressInterval);

        // Complete the upload
        setUploadingFiles(prev => prev.map((upload, index) => 
          index === uploadIndex 
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
          index === uploadIndex 
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

    // Clear completed uploads after 5 seconds
    setTimeout(() => {
      setUploadingFiles(prev => prev.filter(upload => upload.status !== 'completed'));
    }, 5000);

  }, [onUploadComplete, uploadingFiles.length, validateFile]);

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
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: maxFiles > 1
  });

  const removeUpload = (index: number) => {
    setUploadingFiles(prev => prev.filter((_, i) => i !== index));
  };

  const retryUpload = async (index: number) => {
    const upload = uploadingFiles[index];
    if (!upload || upload.status !== 'error') return;

    setUploadingFiles(prev => prev.map((item, i) => 
      i === index ? { ...item, status: 'uploading', progress: 0, error: undefined } : item
    ));

    try {
      const result = await StorageService.uploadFile(upload.file, 'documents');
      
      setUploadingFiles(prev => prev.map((item, i) => 
        i === index ? { ...item, progress: 100, status: 'completed' } : item
      ));

      if (onUploadComplete) {
        onUploadComplete([{
          id: Math.random().toString(36).substring(2),
          name: upload.file.name,
          size: upload.file.size,
          type: upload.file.type,
          filePath: result.filePath,
          signedUrl: result.signedUrl
        }]);
      }

      toast.success(`${upload.file.name} enviado com sucesso!`);

    } catch (error: any) {
      setUploadingFiles(prev => prev.map((item, i) => 
        i === index ? { ...item, status: 'error', error: error.message } : item
      ));
      toast.error(`Erro ao enviar ${upload.file.name}: ${error.message}`);
    }
  };

  return (
    <div className={`space-y-4 w-full ${className}`}>
      {/* Área de Upload Principal */}
      <Card className="border-dashed">
        <CardContent className="p-4 sm:p-6">
          <div
            {...getRootProps()}
            className={`
              cursor-pointer text-center p-4 sm:p-8 rounded-lg border-2 border-dashed 
              transition-all duration-200 ease-in-out
              ${isDragActive 
                ? 'border-primary bg-primary/5 scale-[1.02]' 
                : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/20'
              }
            `}
          >
            <input {...getInputProps()} />
            
            <Upload className={`
              mx-auto mb-4 text-muted-foreground transition-all duration-200
              ${isDragActive ? 'h-16 w-16 text-primary' : 'h-8 w-8 sm:h-12 sm:w-12'}
            `} />
            
            {isDragActive ? (
              <p className="text-lg text-primary font-medium">Solte os arquivos aqui...</p>
            ) : (
              <div className="space-y-2 sm:space-y-4">
                <div>
                  <p className="text-sm sm:text-lg font-medium mb-1 sm:mb-2">
                    Arraste e solte os arquivos aqui
                  </p>
                  <p className="text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-4">
                    ou clique para selecionar arquivos
                  </p>
                  <Button variant="outline" size="sm" className="text-xs sm:text-sm">
                    Selecionar Arquivos
                  </Button>
                </div>
              </div>
            )}
            
            <div className="mt-3 sm:mt-4 text-xs text-muted-foreground space-y-1">
              <p>Formatos aceitos: PDF, DOC, DOCX, TXT, PNG, JPG</p>
              <p>Tamanho máximo: 10MB por arquivo</p>
              <p>Máximo de {maxFiles} arquivo{maxFiles > 1 ? 's' : ''}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* File rejections - Melhorado */}
      {fileRejections.length > 0 && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle className="h-4 w-4 text-destructive" />
              <h4 className="text-sm font-medium text-destructive">
                Arquivos rejeitados:
              </h4>
            </div>
            <div className="space-y-2">
              {fileRejections.map(({ file, errors }) => (
                <div key={file.name} className="text-sm">
                  <span className="font-medium text-destructive">{file.name}</span>
                  <div className="ml-2 space-y-1">
                    {errors.map(error => (
                      <p key={error.code} className="text-destructive/80">• {error.message}</p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upload progress - Layout Melhorado */}
      {uploadingFiles.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-muted-foreground">
            Uploads em andamento ({uploadingFiles.length})
          </h4>
          {uploadingFiles.map((upload, index) => (
            <Card key={index} className={`
              transition-all duration-200
              ${upload.status === 'completed' ? 'bg-green-50 border-green-200' : ''}
              ${upload.status === 'error' ? 'bg-red-50 border-red-200' : ''}
            `}>
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center gap-3">
                  <FileText className={`
                    h-6 w-6 sm:h-8 sm:w-8 flex-shrink-0
                    ${upload.status === 'completed' ? 'text-green-600' : 'text-primary'}
                    ${upload.status === 'error' ? 'text-red-600' : ''}
                  `} />
                  
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium truncate">
                        {upload.file.name}
                      </p>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {upload.status === 'completed' && (
                          <Check className="h-4 w-4 text-green-600" />
                        )}
                        {upload.status === 'error' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => retryUpload(index)}
                            className="text-xs h-6 px-2"
                          >
                            Tentar novamente
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeUpload(index)}
                          className="h-6 w-6 p-0"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    
                    <p className="text-xs text-muted-foreground">
                      {(upload.file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    
                    {upload.status === 'uploading' && (
                      <div className="space-y-1">
                        <Progress value={upload.progress} className="h-2" />
                        <p className="text-xs text-muted-foreground">
                          {Math.round(upload.progress)}% enviado
                        </p>
                      </div>
                    )}
                    
                    {upload.status === 'error' && (
                      <p className="text-xs text-red-600 bg-red-50 p-2 rounded border">
                        <AlertCircle className="h-3 w-3 inline mr-1" />
                        {upload.error}
                      </p>
                    )}

                    {upload.status === 'completed' && (
                      <p className="text-xs text-green-600 bg-green-50 p-2 rounded border">
                        <Check className="h-3 w-3 inline mr-1" />
                        Upload concluído com sucesso
                      </p>
                    )}
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

