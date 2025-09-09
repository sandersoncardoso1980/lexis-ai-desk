import { AppLayout } from "@/components/layout/AppLayout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, FileText, Eye, Shield, Lock, Upload, Download, Filter } from "lucide-react"
import { Input } from "@/components/ui/input"
import { LawFirmService, type LawDocument } from "@/services/lawFirmService"
import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { useNavigate } from "react-router-dom"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { DocumentForm } from "@/components/documents/DocumentForm"
import { supabase } from "@/integrations/supabase/client"
import {  } from "lucide-react"

export default function Documents() {
  const [searchTerm, setSearchTerm] = useState("")
  const [documents, setDocuments] = useState<LawDocument[]>([])
  const [loading, setLoading] = useState(true)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [downloadingId, setDownloadingId] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const { toast } = useToast()
  const navigate = useNavigate()

  useEffect(() => {
    loadDocuments()
  }, [])

  const loadDocuments = async () => {
    try {
      setLoading(true)
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

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (doc.file_type?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (doc.description?.toLowerCase().includes(searchTerm.toLowerCase()) || false)
    
    const matchesStatus = statusFilter === "all" || doc.status === statusFilter
    const matchesType = typeFilter === "all" || doc.document_type === typeFilter
    
    return matchesSearch && matchesStatus && matchesType
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      case 'review': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
      case 'draft': return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
      case 'signed': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
      default: return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'approved': return 'Aprovado'
      case 'review': return 'Em Revisão'
      case 'draft': return 'Rascunho'
      case 'signed': return 'Assinado'
      default: return status
    }
  }

  const formatFileSize = (bytes: number) => {
    if (!bytes || bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileIcon = (type: string) => <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />

  const handleDownloadDocument = async (document: LawDocument) => {
  setDownloadingId(document.id)
  try {
    const { data, error } = await supabase.storage
      .from('documents')
      .createSignedUrl(document.file_path, 60)

    if (error) throw error
    if (!data?.signedUrl) throw new Error('URL de download não disponível')

    // Abrir em nova aba em vez de download
    window.open(data.signedUrl, '_blank')

    toast({
      title: "Sucesso",
      description: "Documento aberto em nova aba"
    })
  } catch (error: any) {
    console.error('Erro ao abrir documento:', error)
    toast({
      title: "Erro",
      description: error.message || "Não foi possível abrir o documento",
      variant: "destructive"
    })
  } finally {
    setDownloadingId(null)
  }
}
  const handleViewDocument = (documentId: string) => {
    // Verifica se a rota existe antes de navegar
    if (isRouteAvailable('/documents/:id')) {
      navigate(`/documents/${documentId}`)
    } else {
      toast({
        title: "Funcionalidade em desenvolvimento",
        description: "A página de detalhes estará disponível em breve",
        variant: "default"
      })
    }
  }

  // Função auxiliar para verificar se a rota existe
  const isRouteAvailable = (path: string) => {
    // Implemente conforme sua configuração de rotas
    // Por enquanto, retornamos false para evitar erros de navegação
    return false
  }

  const handleUploadComplete = () => {
    setShowUploadModal(false)
    loadDocuments()
    toast({
      title: "Sucesso",
      description: "Documento enviado com sucesso"
    })
  }

  const getDocumentTypeLabel = (type: string) => {
    switch (type) {
      case 'contract': return 'Contrato'
      case 'petition': return 'Petição'
      case 'evidence': return 'Prova'
      case 'correspondence': return 'Correspondência'
      case 'certificate': return 'Certidão'
      case 'report': return 'Relatório'
      case 'other': return 'Outro'
      default: return type
    }
  }

  const clearFilters = () => {
    setSearchTerm("")
    setStatusFilter("all")
    setTypeFilter("all")
  }

  return (
    <AppLayout breadcrumbs={[
      { label: "Dashboard", href: "/" },
      { label: "Documentos" }
    ]}>
      {/* Header - Layout Responsivo */}
      <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Documentos</h2>

        <Dialog open={showUploadModal} onOpenChange={setShowUploadModal}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary w-full sm:w-auto">
              <Upload className="mr-2 h-4 w-4" />
              Novo Documento
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Novo Documento</DialogTitle>
              <DialogDescription>
                Faça upload de um novo documento para o sistema.
              </DialogDescription>
            </DialogHeader>
            <DocumentForm
              onCancel={() => setShowUploadModal(false)}
              onSuccess={handleUploadComplete}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Filtros e Busca - Layout Responsivo Melhorado */}
      <Card className="mb-6">
        <CardContent className="p-4 sm:p-6">
          <div className="space-y-4">
            {/* Busca */}
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <Input
                placeholder="Buscar documentos por nome, tipo ou descrição..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1"
              />
            </div>
            
            {/* Filtros */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <div className="flex items-center gap-2 flex-1">
                <Filter className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os Status</SelectItem>
                    <SelectItem value="draft">Rascunho</SelectItem>
                    <SelectItem value="review">Em Revisão</SelectItem>
                    <SelectItem value="approved">Aprovado</SelectItem>
                    <SelectItem value="signed">Assinado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex-1">
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os Tipos</SelectItem>
                    <SelectItem value="contract">Contrato</SelectItem>
                    <SelectItem value="petition">Petição</SelectItem>
                    <SelectItem value="evidence">Prova</SelectItem>
                    <SelectItem value="correspondence">Correspondência</SelectItem>
                    <SelectItem value="certificate">Certidão</SelectItem>
                    <SelectItem value="report">Relatório</SelectItem>
                    <SelectItem value="other">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Button 
                variant="outline" 
                onClick={clearFilters}
                className="w-full sm:w-auto"
              >
                Limpar Filtros
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Documentos - Grid Responsivo Melhorado */}
      {loading ? (
        <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
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
        <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
          {filteredDocuments.map((document) => (
            <Card key={document.id} className="hover:shadow-md transition-shadow flex flex-col">
  <CardHeader className="pb-3 flex-shrink-0">
    <div className="flex items-start justify-between gap-3">
      <div className="flex items-center space-x-3 min-w-0 flex-1">
        {getFileIcon(document.file_type)}
        <div className="space-y-1 min-w-0 flex-1">
          <CardTitle className="text-sm sm:text-base leading-tight line-clamp-2">
            {document.name}
          </CardTitle>
          <p className="text-xs sm:text-sm text-muted-foreground">
            {getDocumentTypeLabel(document.document_type)} • {formatFileSize(document.file_size)}
          </p>
        </div>
      </div>
      {/* Adicione o escudo de criptografia aqui */}
      {document.encrypted && (
        <div className="flex items-center justify-center w-6 h-6 bg-green-100 rounded-full flex-shrink-0">
          <Lock className="h-3 w-3 text-green-600" />
        </div>
      )}
    </div>
  </CardHeader>
  
  <CardContent className="space-y-4 flex-1 flex flex-col">
    <div className="flex items-center justify-between">
      <Badge className={`${getStatusColor(document.status)} text-xs`}>
        {getStatusLabel(document.status)}
      </Badge>
      {/* Remova ou modifique esta seção duplicada se necessário */}
    </div>

    <div className="text-xs sm:text-sm text-muted-foreground space-y-1 flex-1">
      <p>Criado: {new Date(document.created_at).toLocaleDateString('pt-BR')}</p>
      {document.description && (
        <p className="line-clamp-2 text-xs">{document.description}</p>
      )}
    </div>

    <div className="flex flex-col sm:flex-row gap-2 mt-auto">
      <Button
        variant="outline"
        size="sm"
        className="flex-1 text-xs"
        onClick={() => handleViewDocument(document.id)}
      >
        <Eye className="mr-1 h-3 w-3" />
        Detalhes
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleDownloadDocument(document)}
        disabled={downloadingId === document.id}
        className="flex-1 sm:flex-none"
      >
        {downloadingId === document.id ? (
          <div className="animate-spin h-3 w-3 border-2 border-primary border-t-transparent rounded-full" />
        ) : (
          <Download className="h-3 w-3" />
        )}
      </Button>
    </div>

    {/* Modifique a seção de segurança para destacar a criptografia */}
    <div className="text-xs text-muted-foreground border-t pt-2 mt-2">
      <div className="flex items-center justify-between">
        <span>Segurança:</span>
        <div className="flex items-center space-x-1">
          {document.encrypted ? (
            <>
              <Lock className="h-3 w-3 text-green-600" />
              <span className="text-xs text-green-600 font-medium">Criptografado</span>
            </>
          ) : (
            <>
              <Shield className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs">Protegido</span>
            </>
          )}
        </div>
      </div>
    </div>
  </CardContent>
</Card>
          ))}
        </div>
      )}

      {/* Estados Vazios */}
      {!loading && documents.length === 0 && (
        <div className="text-center py-12">
          <div className="mx-auto w-20 h-20 sm:w-24 sm:h-24 bg-muted rounded-full flex items-center justify-center mb-4">
            <FileText className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-2">Nenhum documento encontrado</h3>
          <p className="text-muted-foreground mb-4 text-sm sm:text-base">
            Comece fazendo upload do seu primeiro documento.
          </p>
          <Button onClick={() => setShowUploadModal(true)} className="w-full sm:w-auto">
            <Upload className="mr-2 h-4 w-4" />
            Novo Documento
          </Button>
        </div>
      )}

      {!loading && filteredDocuments.length === 0 && documents.length > 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-sm sm:text-base">
            Nenhum documento encontrado para os filtros aplicados.
          </p>
          <Button 
            variant="outline" 
            onClick={clearFilters}
            className="mt-4 w-full sm:w-auto"
          >
            Limpar Filtros
          </Button>
        </div>
      )}

      {/* Card de Segurança - Layout Responsivo */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Shield className="h-5 w-5 text-green-600" />
            Segurança dos Documentos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            <div className="text-center p-4 border rounded-lg">
              <Lock className="h-6 w-6 sm:h-8 sm:w-8 text-green-600 mx-auto mb-2" />
              <h4 className="font-semibold text-sm sm:text-base">Criptografia no Servidor</h4>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Todos os documentos são protegidos no servidor
              </p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-green-600 mx-auto mb-2" />
              <h4 className="font-semibold text-sm sm:text-base">Acesso Controlado</h4>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Apenas usuários autorizados podem acessar
              </p>
            </div>
            <div className="text-center p-4 border rounded-lg sm:col-span-2 lg:col-span-1">
              <Eye className="h-6 w-6 sm:h-8 sm:w-8 text-green-600 mx-auto mb-2" />
              <h4 className="font-semibold text-sm sm:text-base">Auditoria Completa</h4>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Registro de todos os acessos e modificações
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </AppLayout>
  )
}

