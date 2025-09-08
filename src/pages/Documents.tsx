import { AppLayout } from "@/components/layout/AppLayout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, FileText, Download, Eye, Shield, Lock } from "lucide-react"
import { Input } from "@/components/ui/input"
import { LawFirmService, type LawDocument } from "@/services/lawFirmService"
import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"

export default function Documents() {
  const [searchTerm, setSearchTerm] = useState("")
  const [documents, setDocuments] = useState<LawDocument[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  
  useEffect(() => {
    loadDocuments()
  }, [])

  const loadDocuments = async () => {
    try {
      const data = await LawFirmService.getDocuments()
      setDocuments(data)
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível carregar os documentos",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }
  
  const filteredDocuments = documents.filter(doc =>
    doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.file_type.toLowerCase().includes(searchTerm.toLowerCase())
  )

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

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileIcon = (type: string) => {
    return <FileText className="h-8 w-8 text-primary" />
  }

  return (
    <AppLayout breadcrumbs={[
      { label: "Dashboard", href: "/" },
      { label: "Documentos" }
    ]}>
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Documentos</h2>
        <Button className="bg-gradient-primary">
          <Plus className="mr-2 h-4 w-4" />
          Novo Documento
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar documentos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-3">
                <div className="h-4 bg-muted rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-muted rounded w-full"></div>
                  <div className="h-3 bg-muted rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
          {filteredDocuments.map((document) => (
          <Card key={document.id} className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  {getFileIcon(document.file_type)}
                  <div className="space-y-1">
                    <CardTitle className="text-base leading-tight">{document.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{document.file_type} • {formatFileSize(document.file_size)}</p>
                  </div>
                </div>
                {document.encrypted && (
                  <div title="Documento Criptografado">
                    <Shield className="h-4 w-4 text-success" />
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Badge className={getStatusColor(document.status)}>
                  {getStatusLabel(document.status)}
                </Badge>
                {document.encrypted && (
                  <div className="flex items-center space-x-1 text-xs text-success">
                    <Lock className="h-3 w-3" />
                    <span>Criptografado</span>
                  </div>
                )}
              </div>

              <div className="text-sm text-muted-foreground">
                <p>Criado: {new Date(document.created_at).toLocaleDateString('pt-BR')}</p>
                {document.case_id && (
                  <p>Caso: #{document.case_id}</p>
                )}
              </div>

              <div className="flex space-x-2">
                <Button variant="outline" size="sm" className="flex-1" onClick={() => window.location.href = `/documents/${document.id}`}>
                  <Eye className="mr-1 h-3 w-3" />
                  Ver Detalhes
                </Button>
              </div>

              <div className="text-xs text-muted-foreground border-t pt-2">
                <div className="flex items-center justify-between">
                  <span>Segurança:</span>
                  <div className="flex items-center space-x-1">
                    <Shield className="h-3 w-3 text-success" />
                    <span>Criptografia E2E</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        </div>
      )}

      {filteredDocuments.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Nenhum documento encontrado.</p>
        </div>
      )}

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-success" />
            Segurança dos Documentos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center p-4 border rounded-lg">
              <Lock className="h-8 w-8 text-success mx-auto mb-2" />
              <h4 className="font-semibold">Criptografia E2E</h4>
              <p className="text-sm text-muted-foreground">Todos os documentos são criptografados de ponta a ponta</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <Shield className="h-8 w-8 text-success mx-auto mb-2" />
              <h4 className="font-semibold">Backup Seguro</h4>
              <p className="text-sm text-muted-foreground">Backups automáticos em servidores seguros</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <Eye className="h-8 w-8 text-success mx-auto mb-2" />
              <h4 className="font-semibold">Controle de Acesso</h4>
              <p className="text-sm text-muted-foreground">Acesso controlado por permissões específicas</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </AppLayout>
  )
}