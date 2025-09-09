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
import { Upload, File as FileIcon, X } from "lucide-react"
import { LawFirmService, type LawDocument } from "@/services/lawFirmService"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"

const documentSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  description: z.string().optional(),
  document_type: z.string().min(1, "Tipo do documento é obrigatório"),
  case_id: z.string().uuid("ID do caso deve ser um UUID válido").optional().or(z.literal("")),
  client_id: z.string().uuid("ID do cliente deve ser um UUID válido").optional().or(z.literal("")),
  status: z.enum(["draft", "review", "approved", "signed", "archived"]),
  encrypted: z.boolean().default(false),
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

  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    return user
  }

  const form = useForm<DocumentFormData>({
    resolver: zodResolver(documentSchema),
    defaultValues: {
      name: document?.name || "",
      description: document?.description || "",
      document_type: document?.document_type || "",
      case_id: document?.case_id || "",
      client_id: document?.client_id || "",
      status: (document?.status as "draft" | "review" | "approved" | "signed" | "archived") || "draft",
      encrypted: false,
    },
  })

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        setFile(acceptedFiles[0])
        if (!form.getValues("name")) {
          form.setValue("name", acceptedFiles[0].name.split(".")[0])
        }
      }
    },
    [form]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 1,
    accept: {
      "application/pdf": [".pdf"],
      "application/msword": [".doc"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
      "text/plain": [".txt"],
      "image/*": [".jpg", ".jpeg", ".png"],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
  })

  // --- sanitização do nome do arquivo (remove acentos e caracteres inválidos) ---
  const sanitizeFileName = (name: string) => {
    return name
      .normalize("NFD")                   // separa acentos
      .replace(/[\u0300-\u036f]/g, "")    // remove marcas de acentuação
      .replace(/[^a-zA-Z0-9._-]/g, "_");  // permite apenas letras, números, . _ -
  }

  // --- upload com nome seguro ---
  const uploadFile = async (file: File) => {
    const safeFileName = sanitizeFileName(file.name)
    const fileName = `${Math.random().toString(36).substring(2, 15)}-${safeFileName}`

    const { data, error } = await supabase.storage.from("documents").upload(fileName, file)

    if (error) {
      console.error("Erro no upload Supabase:", error)
      throw error
    }

    return { path: data.path }
  }

  // --- limpa campos vazios do formulário ---
  const cleanFormData = (data: DocumentFormData) => {
    const cleanedData: any = { ...data }
    if (cleanedData.case_id === "") delete cleanedData.case_id
    if (cleanedData.client_id === "") delete cleanedData.client_id
    if (cleanedData.description === "") delete cleanedData.description
    return cleanedData
  }

  // --- lista de campos permitidos (ajuste conforme seu schema real se necessário) ---
  const allowedFields = [
    "case_id",
    "client_id",
    "created_by",
    "user_id",
    "description",
    "document_type",
    "encrypted",
    "encryption_key",
    "encryption_metadata", // <--- CORRETO
    "file_path",
    "file_type",
    "file_size",
    "mime_type",
    "name",
    "status",
    "tags",
    "version",
    "document_hash",
    "signature_hash",
    "metadata",
    "modification_history",
    "access_log"
  ]

  async function onSubmit(data: DocumentFormData) {
    if (!document && !file) {
      toast({
        title: "Erro",
        description: "Selecione um arquivo para fazer upload",
        variant: "destructive",
      })
      return
    }

    setUploading(true)
    try {
      let fileInfo = null
      const user = await getCurrentUser()
      if (!user) throw new Error("Usuário não autenticado")

      if (file) {
        fileInfo = await uploadFile(file)
      }

      const cleanedData = cleanFormData(data)

      // montar o objeto com os campos CORRETOS (atenção: não incluir typos)
      const documentData: Record<string, any> = {
        user_id: user.id,
        created_by: user.id,
        file_path: fileInfo?.path || document?.file_path || "",
        file_type: file?.type || document?.file_type || "application/octet-stream",
        file_size: file?.size || document?.file_size || 0,
        mime_type: file?.type || document?.mime_type || "application/octet-stream",
        encrypted: false,
        version: document?.version || 1,
        tags: document?.tags || [],
        // obrigatórios (garantidos com defaults)
        name: cleanedData.name || document?.name || "Documento sem nome",
        document_type: cleanedData.document_type || document?.document_type || "other",
        status: cleanedData.status || document?.status || "draft",
        description: cleanedData.description || document?.description || "",
        case_id: cleanedData.case_id || document?.case_id || null,
        client_id: cleanedData.client_id || document?.client_id || null,
        encryption_key: null,
        // se você precisa enviar metadados de criptografia, use O NOME CORRETO:
        // encryption_metadata: {...}
      }

      // Filtrar apenas keys permitidas (remove qualquer typo como "encrypition_metadata")
      const payload: Record<string, any> = {}
      Object.entries(documentData).forEach(([k, v]) => {
        if (allowedFields.includes(k)) payload[k] = v
      })

      if (document) {
        // Atualiza (update) — aqui o update aceita campos parciais
        await LawFirmService.updateDocument(document.id, payload as Partial<LawDocument>)
        toast({ title: "Sucesso", description: "Documento atualizado com sucesso" })
      } else {
        // Cria — cast para o tipo esperado pela service
        await LawFirmService.createDocument(payload as Omit<LawDocument, "id" | "created_at" | "updated_at">)
        toast({ title: "Sucesso", description: "Documento criado com sucesso" })
      }

      onSuccess()
    } catch (error: any) {
      console.error("Erro completo:", error)
      toast({
        title: "Erro",
        description: error?.message || "Não foi possível salvar o documento",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {!document && (
          <Card>
            <CardContent className="p-4 sm:p-6">
              <div
                {...getRootProps()}
                className="border-2 border-dashed rounded-lg p-4 sm:p-6 text-center cursor-pointer transition-colors hover:border-primary/50 border-muted-foreground/25"
              >
                <input {...getInputProps()} />
                {file ? (
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <FileIcon className="h-6 w-6 sm:h-8 sm:w-8 text-primary flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="font-medium truncate text-sm sm:text-base">{file.name}</p>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        setFile(null)
                      }}
                      className="flex-shrink-0 mt-2 sm:mt-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Upload className="h-8 w-8 sm:h-12 sm:w-12 text-muted-foreground mx-auto" />
                    <div>
                      <p className="text-base sm:text-lg font-medium mb-1 sm:mb-2">
                        {isDragActive ? "Solte o arquivo aqui" : "Clique ou arraste um arquivo"}
                      </p>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        PDF, DOC, DOCX, TXT ou imagens (máx. 10MB)
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-6 md:grid-cols-1">
          <div className="space-y-4">
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
                      <SelectItem value="archived">Arquivado</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descrição do documento (opcional)"
                      className="min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t">
          <Button type="button" variant="outline" onClick={onCancel} className="w-full sm:w-auto">
            Cancelar
          </Button>
          <Button type="submit" disabled={uploading} className="w-full sm:w-auto">
            {uploading ? "Salvando..." : document ? "Atualizar" : "Criar Documento"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
