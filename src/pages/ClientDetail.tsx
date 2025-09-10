// components/clients/ClientDetail.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Mail, Phone, Building, MapPin, FileText, Edit, Trash2 } from "lucide-react"
import { type LawClient, type LawCase } from "@/services/lawFirmService"

// Interface corrigida com a propriedade `cases`
interface ClientDetailsProps {
  client: LawClient
  onEdit: () => void
  onDelete: () => void
  onViewCase?: (lawCase: LawCase) => void
  onEditCase?: (lawCase: LawCase) => void
  onCreateCase?: (clientId: string) => void
  cases: LawCase[] // Adicionado
}

export default function ClientDetails({
  client,
  onEdit,
  onDelete,
  onViewCase,
  onEditCase,
  onCreateCase,
  cases // Adicionada nas props recebidas
}: ClientDetailsProps) {

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Detalhes do Cliente</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onEdit}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="destructive" size="sm" onClick={onDelete}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="text-2xl">
                {client.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <h2 className="text-2xl font-bold">{client.name}</h2>
              <Badge variant="secondary">{client.client_type}</Badge>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center text-sm">
                <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>{client.email}</span>
              </div>
              <div className="flex items-center text-sm">
                <Phone className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>{client.phone}</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center text-sm">
                <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>{client.address || "Endereço não informado"}</span>
              </div>
              <div className="flex items-center text-sm">
                <Building className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>{client.company_name || "Empresa não informada"}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Seção de Casos Relacionados */}
      <Card>
        <CardHeader>
          <CardTitle>Casos Relacionados</CardTitle>
        </CardHeader>
        <CardContent>
          {cases.length > 0 ? (
            <ul className="space-y-2">
              {cases.map((lawCase) => (
                <li key={lawCase.id} className="flex items-center justify-between p-2 border rounded-md">
                  <div className="flex items-center space-x-2">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <h4 className="font-medium">{lawCase.title}</h4>
                      <p className="text-sm text-muted-foreground">Processo: {lawCase.case_number}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={lawCase.status === 'open' ? 'default' : 'secondary'}>
                      {lawCase.status === 'open' ? 'Aberto' : 'Encerrado'}
                    </Badge>
                    {onViewCase && (
                      <Button variant="ghost" size="icon" onClick={() => onViewCase(lawCase)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground">
              Nenhum caso vinculado a este cliente.
            </p>
          )}
          {onCreateCase && (
            <Button
              onClick={() => onCreateCase(client.id)}
              className="mt-3"
            >
              + Novo Caso
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Metadata */}
      <Card>
        <CardHeader>
          <CardTitle>Informações do Sistema</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="text-sm">
            <span className="font-medium">Criado em:</span>{" "}
            {new Date(client.created_at).toLocaleDateString("pt-BR", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit"
            })}
          </div>
          <div className="text-sm">
            <span className="font-medium">Última atualização:</span>{" "}
            {new Date(client.updated_at).toLocaleDateString("pt-BR", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit"
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}