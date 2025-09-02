import { AppLayout } from "@/components/layout/AppLayout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Plus, Search, Mail, Phone, Building } from "lucide-react"
import { Input } from "@/components/ui/input"
import { mockClients } from "@/lib/mockData"
import { useState } from "react"

export default function Clients() {
  const [searchTerm, setSearchTerm] = useState("")
  
  const filteredClients = mockClients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-success/10 text-success'
      case 'inactive':
        return 'bg-muted text-muted-foreground'
      case 'potential':
        return 'bg-warning/10 text-warning'
      default:
        return 'bg-muted text-muted-foreground'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'Ativo'
      case 'inactive':
        return 'Inativo'
      case 'potential':
        return 'Potencial'
      default:
        return status
    }
  }

  return (
    <AppLayout breadcrumbs={[
      { label: "Dashboard", href: "/" },
      { label: "Clientes" }
    ]}>
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Clientes</h2>
        <Button className="bg-gradient-primary">
          <Plus className="mr-2 h-4 w-4" />
          Novo Cliente
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar clientes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredClients.map((client) => (
          <Card key={client.id} className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarImage src={client.avatar} />
                    <AvatarFallback>
                      {client.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">{client.name}</CardTitle>
                  </div>
                </div>
                <Badge className={getStatusColor(client.status)}>
                  {getStatusLabel(client.status)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>{client.email}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4" />
                <span>{client.phone}</span>
              </div>
              {client.company && (
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Building className="h-4 w-4" />
                  <span>{client.company}</span>
                </div>
              )}
              <div className="pt-3 border-t">
                <p className="text-xs text-muted-foreground">
                  Cliente desde: {new Date(client.createdAt).toLocaleDateString('pt-BR')}
                </p>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" className="flex-1">
                  Ver Detalhes
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  Editar
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredClients.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Nenhum cliente encontrado.</p>
        </div>
      )}
    </AppLayout>
  )
}