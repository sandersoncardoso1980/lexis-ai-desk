import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Mail, Phone, MapPin, FileText, Edit, Trash2, Briefcase } from "lucide-react"
import { type LawClient, type LawCase } from "@/services/lawFirmService"
import { WhatsAppButton } from "@/components/utils/WhatsAppButton"
import { Link } from "react-router-dom"

interface ClientDetailsProps {
  client: LawClient
  onEdit: () => void
  onDelete: () => void
  cases: LawCase[]
}

export default function ClientDetails({ client, onEdit, onDelete, cases }: ClientDetailsProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800"
      case "inactive": return "bg-gray-100 text-gray-600"
      case "potential": return "bg-yellow-100 text-yellow-800"
      default: return "bg-gray-100 text-gray-600"
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "active": return "Ativo"
      case "inactive": return "Inativo"
      case "potential": return "Potencial"
      default: return status
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
  <div className="flex items-center space-x-4">
    <Avatar className="h-16 w-16">
      <AvatarFallback className="text-lg">
        {client.name.split(" ").map(n => n[0]).join("").toUpperCase()}
      </AvatarFallback>
    </Avatar>
    <div>
      <CardTitle className="text-2xl break-words">{client.name}</CardTitle>
      <div className="flex flex-wrap gap-2 mt-2">
        <Badge className={getStatusColor(client.status)}>
          {getStatusLabel(client.status)}
        </Badge>
        <Badge variant="outline">
          {client.client_type === "company" ? "Empresa" : "Pessoa Física"}
        </Badge>
      </div>
    </div>
  </div>
  <div className="flex flex-wrap gap-2 w-full sm:w-auto">
    {client.phone && (
      <WhatsAppButton
        phoneNumber={client.phone}
        message={`Olá ${client.name}, tudo bem?`}
      />
    )}
    <Button variant="outline" onClick={onEdit} className="flex-1 sm:flex-none">
      <Edit className="h-4 w-4 mr-2" /> Editar
    </Button>
    <Button variant="destructive" onClick={onDelete} className="flex-1 sm:flex-none">
      <Trash2 className="h-4 w-4 mr-2" /> Excluir
    </Button>
  </div>
</div>

        </CardHeader>
      </Card>

      {/* Contact */}
      <Card>
        <CardHeader>
          <CardTitle>Informações de Contato</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {client.email && (
            <div className="flex items-center space-x-3">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <span>{client.email}</span>
            </div>
          )}
          {client.phone && (
            <div className="flex items-center space-x-3">
              <Phone className="h-5 w-5 text-muted-foreground" />
              <span>{client.phone}</span>
              <WhatsAppButton
                phoneNumber={client.phone}
                size="sm"
                message={`Olá ${client.name}, tudo bem?`}
              />
            </div>
          )}
          {client.address && (
            <div className="flex items-center space-x-3">
              <MapPin className="h-5 w-5 text-muted-foreground" />
              <span>{client.address}</span>
            </div>
          )}
          {client.document_number && (
            <div className="flex items-center space-x-3">
              <FileText className="h-5 w-5 text-muted-foreground" />
              <span>
                {client.client_type === "company" ? "CNPJ" : "CPF"}: {client.document_number}
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
