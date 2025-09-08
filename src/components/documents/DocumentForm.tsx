import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Upload, File, X, Shield, Lock } from "lucide-react"
import { LawFirmService, type LawDocument, type LawCase, type LawClient } from "@/services/lawFirmService"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"

const documentSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  description: z.string().optional(),
  document_type: z.string().min(1, "Tipo do documento é obrigatório"),
  case_id: z.string().optional(),
  client_id: z.string().optional(),
  status: z.enum(["draft", "review", "approved", "signed"]),
  encrypted: z.boolean().default(true)
})

type DocumentFormData = z.infer<typeof documentSchema>

interface DocumentFormProps {
  document?: LawDocument
  onSuccess: () => void
  onCancel: () => void
}

export function DocumentForm({ document, onSuccess, onCancel }: DocumentFormProps) {
  const { toast } = useToast()
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [cases, setCases] = useState<LawCase[]>([])
  const [clients, setClients] = useState<LawClient[]>([])
  
  const form = useForm<DocumentFormData>({
    resolver: zodResolver(documentSchema),
    defaultValues: {
      name: document?.name || "",
      description: document?.description || "",
      document_type: document?.document_type || "",
      case_id: document?.case_id || "",
      client_id: document?.client_id || "",
      status: document?.status as "draft" | "review" | "approved" | "signed" || "draft",
      encrypted: document?.encrypted ?? true
    }
  })

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0])
      if (!form.getValues("name")) {
        form.setValue("name", acceptedFiles[0].name.split('.')[0])
      }
    }
  }, [form])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 1,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt'],
      'image/*': ['.jpg', '.jpeg', '.png']
    }
  })

  // Função simples de criptografia (em produção, usar uma biblioteca robusta)
  const encryptFile = async (file: File, password: string): Promise<ArrayBuffer> => {
    const arrayBuffer = await file.arrayBuffer()
    const encoder = new TextEncoder()
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(password.padEnd(32, '0')),
      { name: 'AES-GCM' },
      false,
      ['encrypt']
    )
    
    const iv = crypto.getRandomValues(new Uint8Array(12))
    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      arrayBuffer
    )
    
    // Combinar IV + dados criptografados
    const combined = new Uint8Array(iv.length + encrypted.byteLength)
    combined.set(iv)
    combined.set(new Uint8Array(encrypted), iv.length)
    
    return combined.buffer
  }

  const uploadFile = async (file: File, encrypted: boolean) => {
    const fileName = `${Date.now()}-${file.name}`
    let fileToUpload = file
    let encryptionKey = null

    if (encrypted) {
      // Gerar chave de criptografia
      encryptionKey = crypto.getRandomValues(new Uint8Array(32)).toString()
      const encryptedBuffer = await encryptFile(file, encryptionKey)
      fileToUpload = new File([encryptedBuffer], fileName)
    }

    const { data, error } = await supabase.storage
      .from('legal-documents')
      .upload(fileName, fileToUpload)

    if (error) throw error

    const { data: urlData } = supabase.storage
      .from('legal-documents')
      .getPublicUrl(fileName)

    return {
      path: data.path,
      url: urlData.publicUrl,
      encryptionKey
    }
  }

  async function onSubmit(data: DocumentFormData) {
    if (!document && !file) {
      toast({
        title: "Erro",
        description: "Selecione um arquivo para fazer upload",
        variant: "destructive"
      })
      return
    }

    setUploading(true)
    try {
      let fileInfo = null
      
      if (file) {
        fileInfo = await uploadFile(file, data.encrypted)
      }

      const documentData = {
        ...data,
        ...(fileInfo && {
          file_path: fileInfo.path,
          file_url: fileInfo.url,
          file_type: file?.type.split('/')[1] || 'unknown',
          file_size: file?.size || 0,
          mime_type: file?.type || 'application/octet-stream',
          encryption_key: fileInfo.encryptionKey
        })
      }

      if (document) {
        await LawFirmService.updateDocument(document.id, documentData)
        toast({
          title: "Sucesso",
          description: "Documento atualizado com sucesso"
        })
      } else {
        await LawFirmService.createDocument(documentData as any)
        toast({
          title: "Sucesso",
          description: "Documento criado com sucesso"
        })
      }
      onSuccess()
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível salvar o documento",
        variant: "destructive"
      })
    } finally {
      setUploading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {!document && (
          <Card>
            <CardContent className="p-6">
              <div {...getRootProps()} className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50'
              }`}>
                <input {...getInputProps()} />
                {file ? (
                  <div className="flex items-center justify-center space-x-2">
                    <File className="h-8 w-8 text-primary" />
                    <div>
                      <p className="font-medium">{file.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        setFile(null)
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div>
                    <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-lg font-medium">
                      {isDragActive ? 'Solte o arquivo aqui' : 'Clique ou arraste um arquivo'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      PDF, DOC, DOCX, TXT ou imagens (máx. 10MB)
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome do Documento</FormLabel>
              <FormControl>
                <Input placeholder="Nome do documento" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="document_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo do Documento</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="contract">Contrato</SelectItem>
                  <SelectItem value="petition">Petição</SelectItem>
                  <SelectItem value="evidence">Prova</SelectItem>
                  <SelectItem value="correspondence">Correspondência</SelectItem>
                  <SelectItem value="certificate">Certidão</SelectItem>
                  <SelectItem value="report">Relatório</SelectItem>
                  <SelectItem value="other">Outro</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="draft">Rascunho</SelectItem>
                    <SelectItem value="review">Em Revisão</SelectItem>
                    <SelectItem value="approved">Aprovado</SelectItem>
                    <SelectItem value="signed">Assinado</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="encrypted"
            render={({ field }) => (
              <FormItem className="flex flex-col justify-end">
                <FormLabel className="flex items-center space-x-2">
                  <Shield className="h-4 w-4" />
                  <span>Criptografia E2E</span>
                </FormLabel>
                <div className="flex items-center space-x-2 h-10">
                  <input
                    type="checkbox"
                    checked={field.value}
                    onChange={field.onChange}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm text-muted-foreground">
                    {field.value ? 'Ativada' : 'Desativada'}
                  </span>
                  {field.value && <Lock className="h-3 w-3 text-success" />}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição</FormLabel>
              <FormControl>
                <Textarea placeholder="Descrição do documento" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit" disabled={uploading}>
            {uploading ? "Salvando..." : document ? "Atualizar" : "Criar"}
          </Button>
        </div>
      </form>
    </Form>
  )
}