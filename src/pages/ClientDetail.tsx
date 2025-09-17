import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Mail, Phone, MapPin, FileText, Edit, Trash2 } from "lucide-react"
import { type LawClient, LawFirmService, type LawCase } from "@/services/lawFirmService"
import { WhatsAppButton } from "@/components/utils/WhatsAppButton"
import { ClientForm } from "@/components/clients/ClientForm"
import { useToast } from "@/hooks/use-toast"

interface ClientDetailsProps {
  client: LawClient
  cases: LawCase[]
  onEdit:() => void
  onDelete:() => void
  onChanged?: () => void // callback opcional p/ recarregar lista
}

export default function ClientDetails({ client, cases, onChanged }: ClientDetailsProps) {
  const { toast } = useToast()
  const [isEditing, setIsEditing] = useState(false)

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

  async function handleDelete() {
    try {
      await LawFirmService.deleteClient(client.id)
      toast({ title: "Sucesso", description: "Cliente excluído com sucesso" })
      onChanged?.()
    } catch {
      toast({ title: "Erro", description: "Não foi possível excluir o cliente", variant: "destructive" })
    }
  }

  if (isEditing) {
    return (
      <ClientForm
        client={client}
        onSuccess={() => {
          setIsEditing(false)
          onChanged?.()
        }}
        onCancel={() => setIsEditing(false)}
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <Card className="rounded-xl shadow-sm border border-gray-200">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <CardTitle className="text-2xl font-semibold text-gray-800 break-words">
              {client.name}
            </CardTitle>
            <div className="flex flex-wrap gap-2">
              <Badge className={`${getStatusColor(client.status)} px-2.5 py-0.5 rounded-full text-sm`}>
                {getStatusLabel(client.status)}
              </Badge>
              <Badge variant="outline" className="px-2.5 py-0.5 rounded-full text-sm">
                {client.client_type === "company" ? "Empresa" : "Pessoa Física"}
              </Badge>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setIsEditing(true)}
              className="h-9 w-9"
              title="Editar cliente"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="destructive"
              size="icon"
              onClick={handleDelete}
              className="h-9 w-9"
              title="Excluir cliente"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Contato */}
      <Card className="rounded-xl shadow-sm border border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-700">
            Informações de Contato
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-gray-600">
          {client.email && (
            <div className="flex items-center space-x-3">
              <Mail className="h-5 w-5 text-primary" />
              <span>{client.email}</span>
            </div>
          )}
          {client.phone && (
            <div className="flex items-center space-x-3">
              <Phone className="h-5 w-5 text-primary" />
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
              <MapPin className="h-5 w-5 text-primary" />
              <span>{client.address}</span>
            </div>
          )}
          {client.document_number && (
            <div className="flex items-center space-x-3">
              <FileText className="h-5 w-5 text-primary" />
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
