// pages/ClientDetailsPage.tsx
import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { AppLayout } from "@/components/layout/AppLayout"
import { LawFirmService, type LawClient } from "@/services/lawFirmService"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
// ✅ Importação correta para export default
import ClientDetails from "@/components/clients/ClientDetails"
import ClientDetail from "@/pages/ClientDetail"

export default function ClientDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const [client, setClient] = useState<LawClient | null>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const navigate = useNavigate()

  useEffect(() => {
    if (id) {
      loadClient()
    }
  }, [id])

  const loadClient = async () => {
    try {
      const data = await LawFirmService.getClient(id!)
      setClient(data)
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados do cliente",
        variant: "destructive"
      })
      navigate("/clients")
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = () => {
    navigate(`/clients/${id}/edit`)
  }

  const handleDelete = async () => {
    if (window.confirm("Tem certeza que deseja excluir este cliente?")) {
      try {
        await LawFirmService.deleteClient(id!)
        toast({
          title: "Sucesso",
          description: "Cliente excluído com sucesso"
        })
        navigate("/clients")
      } catch (error) {
        toast({
          title: "Erro",
          description: "Não foi possível excluir o cliente",
          variant: "destructive"
        })
      }
    }
  }

  if (loading) {
    return (
      <AppLayout breadcrumbs={[
        { label: "Dashboard", href: "/" },
        { label: "Clientes", href: "/clients" },
        { label: "Carregando..." }
      ]}>
        <div className="animate-pulse">Carregando...</div>
      </AppLayout>
    )
  }

  if (!client) {
    return (
      <AppLayout breadcrumbs={[
        { label: "Dashboard", href: "/" },
        { label: "Clientes", href: "/clients" },
        { label: "Não encontrado" }
      ]}>
        <div>Cliente não encontrado</div>
      </AppLayout>
    )
  }

  return (
    <AppLayout breadcrumbs={[
      { label: "Dashboard", href: "/" },
      { label: "Clientes", href: "/clients" },
      { label: client.name }
    ]}>
      <div className="mb-4">
        <Button variant="outline" onClick={() => navigate("/clients")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
      </div>
      
      // ClientDetailsPage.tsx - passe props individualmente
// ClientDetailsPage.tsx
import ClientDetailsComponent from "@/components/clients/ClientDetails"

// E use:
<ClientDetail
  client={client}
  onEdit={handleEdit}
  onDelete={handleDelete}
/>
    </AppLayout>
  )
}