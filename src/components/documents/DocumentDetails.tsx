import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FileText, Edit, Trash2, Download, Eye, Shield, Lock, Calendar, User } from "lucide-react"
import { type LawDocument } from "@/services/lawFirmService"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"

interface DocumentDetailsProps {
  document: LawDocument
  onEdit: () => void
  onDelete: () => void
}

export function DocumentDetails({ document, onEdit, onDelete }: DocumentDetailsProps) {
  const { toast } = useToast()
  const [showPasswordDialog, setShowPasswordDialog] = useState(false)
  const [password, setPassword] = useState("")
  const [actionType, setActionType] = useState<'view' | 'download' | 'delete'>('view')

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-success/10 text-success'
      case 'review':
        return 'bg-warning/10 text-warning'
      case 'draft':
        return 'bg-muted text-muted-foreground'
      case 'signed':
        return 'bg-primary/10 text-primary'
      default:
        return 'bg-muted text-muted-foreground'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'approved':
        return 'Aprovado'
      case 'review':
        return 'Em Revisão'
      case 'draft':
        return 'Rascunho'
      case 'signed':
        return 'Assinado'
      default:
        return status
    }
  }

  const getDocumentTypeLabel = (type: string) => {
    switch (type) {
      case 'contract':
        return 'Contrato'
      case 'petition':
        return 'Petição'
      case 'evidence':
        return 'Prova'
      case 'correspondence':
        return 'Correspondência'
      case 'certificate':
        return 'Certidão'
      case 'report':
        return 'Relatório'
      case 'other':
        return 'Outro'
      default:
        return type
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // Função simples de descriptografia (deve corresponder à criptografia)
  const decryptFile = async (encryptedBuffer: ArrayBuffer, password: string): Promise<ArrayBuffer> => {
    const encoder = new TextEncoder()
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(password.padEnd(32, '0')),
      { name: 'AES-GCM' },
      false,
      ['decrypt']
    )
    
    const encryptedArray = new Uint8Array(encryptedBuffer)
    const iv = encryptedArray.slice(0, 12)
    const data = encryptedArray.slice(12)
    
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      data
    )
    
    return decrypted
  }

  const handlePasswordAction = async () => {
    if (!password) {
      toast({
        title: "Erro",
        description: "Digite a senha para continuar",
        variant: "destructive"
      })
      return
    }

    try {
      if (actionType === 'delete') {
        // Simular verificação de senha (em produção, verificar no backend)
        if (password === "admin123") {
          onDelete()
          setShowPasswordDialog(false)
          setPassword("")
        } else {
          toast({
            title: "Erro",
            description: "Senha incorreta",
            variant: "destructive"
          })
        }
        return
      }

      if (document.encrypted && document.encryption_key) {
        // Download do arquivo criptografado
        const { data, error } = await supabase.storage
          .from('legal-documents')
          .download(document.file_path)

        if (error) throw error

        const arrayBuffer = await data.arrayBuffer()
        
        try {
          const decryptedBuffer = await decryptFile(arrayBuffer, password)
          const blob = new Blob([decryptedBuffer], { type: document.mime_type })
          
          if (actionType === 'view') {
            const url = URL.createObjectURL(blob)
            window.open(url, '_blank')
            URL.revokeObjectURL(url)
          } else if (actionType === 'download') {
            const url = URL.createObjectURL(blob)
            const a = window.document.createElement('a')
            a.href = url
            a.download = document.name
            window.document.body.appendChild(a)
            a.click()
            window.document.body.removeChild(a)
            URL.revokeObjectURL(url)
          }
          
          toast({
            title: "Sucesso",
            description: `Documento ${actionType === 'view' ? 'visualizado' : 'baixado'} com sucesso`
          })
        } catch (decryptError) {
          toast({
            title: "Erro",
            description: "Senha incorreta para descriptografia",
            variant: "destructive"
          })
        }
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível processar o documento",
        variant: "destructive"
      })
    }

    setShowPasswordDialog(false)
    setPassword("")
  }

  const handleView = () => {
    if (document.encrypted) {
      setActionType('view')
      setShowPasswordDialog(true)
    } else {
      window.open(document.file_path, '_blank')
    }
  }

  const handleDownload = () => {
    if (document.encrypted) {
      setActionType('download')
      setShowPasswordDialog(true)
    } else {
      const a = window.document.createElement('a')
      a.href = document.file_path
      a.download = document.name
      window.document.body.appendChild(a)
      a.click()
      window.document.body.removeChild(a)
    }
  }

  const handleDeleteClick = () => {
    setActionType('delete')
    setShowPasswordDialog(true)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-lg bg-primary/10">
                <FileText className="h-8 w-8 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl">{document.name}</CardTitle>
                <p className="text-muted-foreground mt-1">
                  {document.file_type.toUpperCase()} • {formatFileSize(document.file_size)}
                </p>
                <div className="flex items-center space-x-2 mt-3">
                  <Badge className={getStatusColor(document.status)}>
                    {getStatusLabel(document.status)}
                  </Badge>
                  <Badge variant="outline">
                    {getDocumentTypeLabel(document.document_type)}
                  </Badge>
                  {document.encrypted && (
                    <Badge className="bg-success/10 text-success">
                      <Lock className="h-3 w-3 mr-1" />
                      Criptografado
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={handleView}>
                <Eye className="h-4 w-4 mr-2" />
                Visualizar
              </Button>
              <Button variant="outline" onClick={handleDownload}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              <Button variant="outline" onClick={onEdit}>
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </Button>
              <Button variant="destructive" onClick={handleDeleteClick}>
                <Trash2 className="h-4 w-4 mr-2" />
                Excluir
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Document Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Informações do Documento</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-3">
              <FileText className="h-5 w-5 text-muted-foreground" />
              <div>
                <span className="font-medium">Tipo MIME:</span>
                <p className="text-sm text-muted-foreground">{document.mime_type}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <span className="font-medium">Criado em:</span>
                <p className="text-sm text-muted-foreground">
                  {new Date(document.created_at).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <span className="font-medium">Última modificação:</span>
                <p className="text-sm text-muted-foreground">
                  {new Date(document.updated_at).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-success" />
              Segurança
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-2">
                <Lock className="h-4 w-4 text-success" />
                <span className="font-medium">Criptografia E2E</span>
              </div>
              <Badge className={document.encrypted ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}>
                {document.encrypted ? 'Ativada' : 'Desativada'}
              </Badge>
            </div>

            <div>
              <span className="font-medium">Versão:</span>
              <p className="text-sm text-muted-foreground">v{document.version}</p>
            </div>

            <div>
              <span className="font-medium">Caminho do Arquivo:</span>
              <p className="text-xs text-muted-foreground font-mono mt-1 break-all">
                {document.file_path}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Description */}
      {document.description && (
        <Card>
          <CardHeader>
            <CardTitle>Descrição</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground whitespace-pre-wrap">{document.description}</p>
          </CardContent>
        </Card>
      )}

      {/* Password Dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === 'delete' 
                ? 'Confirmar Exclusão' 
                : `${actionType === 'view' ? 'Visualizar' : 'Baixar'} Documento Criptografado`}
            </DialogTitle>
            <DialogDescription>
              {actionType === 'delete'
                ? 'Digite a senha de administrador para confirmar a exclusão deste documento.'
                : 'Digite a senha de criptografia para acessar este documento.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Digite a senha"
              onKeyDown={(e) => e.key === 'Enter' && handlePasswordAction()}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowPasswordDialog(false)
                setPassword("")
              }}
            >
              Cancelar
            </Button>
            <Button
              onClick={handlePasswordAction}
              variant={actionType === 'delete' ? 'destructive' : 'default'}
            >
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}