import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, DollarSign, Edit, Trash2, User, Building, Scale } from "lucide-react"
import { type LawCase } from "@/services/lawFirmService"

interface CaseDetailsProps {
  case: LawCase
  onEdit: () => void
  onDelete: () => void
}

export function CaseDetails({ case: caseData, onEdit, onDelete }: CaseDetailsProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-success/10 text-success'
      case 'closed':
        return 'bg-muted text-muted-foreground'
      case 'pending':
        return 'bg-warning/10 text-warning'
      case 'appeal':
        return 'bg-blue-100 text-blue-700'
      default:
        return 'bg-muted text-muted-foreground'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'open':
        return 'Aberto'
      case 'closed':
        return 'Fechado'
      case 'pending':
        return 'Pendente'
      case 'appeal':
        return 'Em Recurso'
      default:
        return status
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-700'
      case 'high':
        return 'bg-orange-100 text-orange-700'
      case 'medium':
        return 'bg-yellow-100 text-yellow-700'
      case 'low':
        return 'bg-green-100 text-green-700'
      default:
        return 'bg-muted text-muted-foreground'
    }
  }

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'Urgente'
      case 'high':
        return 'Alta'
      case 'medium':
        return 'Média'
      case 'low':
        return 'Baixa'
      default:
        return priority
    }
  }

  const getCaseTypeLabel = (type: string) => {
    switch (type) {
      case 'civil':
        return 'Civil'
      case 'criminal':
        return 'Criminal'
      case 'family':
        return 'Família'
      case 'commercial':
        return 'Comercial'
      case 'labor':
        return 'Trabalhista'
      case 'tax':
        return 'Tributário'
      default:
        return type
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">{caseData.title}</CardTitle>
              <p className="text-muted-foreground mt-1">
                Processo: {caseData.case_number}
              </p>
              <div className="flex items-center space-x-2 mt-3">
                <Badge className={getStatusColor(caseData.status)}>
                  {getStatusLabel(caseData.status)}
                </Badge>
                <Badge className={getPriorityColor(caseData.priority)}>
                  {getPriorityLabel(caseData.priority)}
                </Badge>
                <Badge variant="outline">
                  {getCaseTypeLabel(caseData.case_type)}
                </Badge>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={onEdit}>
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </Button>
              <Button variant="destructive" onClick={onDelete}>
                <Trash2 className="h-4 w-4 mr-2" />
                Excluir
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Case Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Informações do Caso</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {caseData.value && (
              <div className="flex items-center space-x-3">
                <DollarSign className="h-5 w-5 text-muted-foreground" />
                <div>
                  <span className="font-medium">Valor da Causa:</span>
                  <p className="text-sm text-muted-foreground">
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL'
                    }).format(Number(caseData.value))}
                  </p>
                </div>
              </div>
            )}
            
            {caseData.start_date && (
              <div className="flex items-center space-x-3">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <span className="font-medium">Data de Início:</span>
                  <p className="text-sm text-muted-foreground">
                    {new Date(caseData.start_date).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>
            )}

            {caseData.expected_end_date && (
              <div className="flex items-center space-x-3">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <span className="font-medium">Previsão de Conclusão:</span>
                  <p className="text-sm text-muted-foreground">
                    {new Date(caseData.expected_end_date).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>
            )}

            {caseData.actual_end_date && (
              <div className="flex items-center space-x-3">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <span className="font-medium">Data de Conclusão:</span>
                  <p className="text-sm text-muted-foreground">
                    {new Date(caseData.actual_end_date).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Informações Judiciais</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {caseData.court && (
              <div className="flex items-center space-x-3">
                <Building className="h-5 w-5 text-muted-foreground" />
                <div>
                  <span className="font-medium">Tribunal:</span>
                  <p className="text-sm text-muted-foreground">{caseData.court}</p>
                </div>
              </div>
            )}

            {caseData.judge && (
              <div className="flex items-center space-x-3">
                <Scale className="h-5 w-5 text-muted-foreground" />
                <div>
                  <span className="font-medium">Juiz:</span>
                  <p className="text-sm text-muted-foreground">{caseData.judge}</p>
                </div>
              </div>
            )}

            {caseData.opposing_party && (
              <div className="flex items-center space-x-3">
                <User className="h-5 w-5 text-muted-foreground" />
                <div>
                  <span className="font-medium">Parte Contrária:</span>
                  <p className="text-sm text-muted-foreground">{caseData.opposing_party}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Description */}
      {caseData.description && (
        <Card>
          <CardHeader>
            <CardTitle>Descrição</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground whitespace-pre-wrap">{caseData.description}</p>
          </CardContent>
        </Card>
      )}

      {/* Metadata */}
      <Card>
        <CardHeader>
          <CardTitle>Informações do Sistema</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="text-sm">
            <span className="font-medium">Criado em:</span>{' '}
            {new Date(caseData.created_at).toLocaleDateString('pt-BR', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </div>
          <div className="text-sm">
            <span className="font-medium">Última atualização:</span>{' '}
            {new Date(caseData.updated_at).toLocaleDateString('pt-BR', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}