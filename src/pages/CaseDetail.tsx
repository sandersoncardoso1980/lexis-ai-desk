// pages/CaseDetailPage.tsx
import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { LawFirmService, LawCase } from '@/services/lawFirmService'
import { CaseDetails } from '@/components/cases/CaseDetails'
import { CaseForm } from '@/components/cases/CaseForm'
import { AppLayout } from '@/components/layout/AppLayout'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useEffect } from 'react'

export function CaseDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { toast } = useToast()
  const [caseData, setCaseData] = useState<LawCase | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)

  const fetchCase = async () => {
    if (!id) {
      toast({
        title: 'Erro',
        description: 'ID do caso não fornecido',
        variant: 'destructive'
      })
      navigate('/cases')
      return
    }

    try {
      setLoading(true)
      const data = await LawFirmService.getCase(id)
      setCaseData(data)
    } catch (error) {
      console.error('Erro ao carregar caso:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os detalhes do caso',
        variant: 'destructive'
      })
      navigate('/cases')
    } finally {
      setLoading(false)
    }
  }
   useEffect(() => {
    fetchCase()
  }, [id])

  const handleEdit = () => {
    setEditing(true)
  }

  const handleDelete = async () => {
    if (caseData && window.confirm('Tem certeza que deseja excluir este caso?')) {
      try {
        await LawFirmService.deleteCase(caseData.id)
        toast({
          title: 'Sucesso',
          description: 'Caso excluído com sucesso!'
        })
        navigate('/cases')
      } catch (error) {
        console.error('Erro ao excluir caso:', error)
        toast({
          title: 'Erro',
          description: 'Não foi possível excluir o caso',
          variant: 'destructive'
        })
      }
    }
  }
  

  const handleEditSuccess = (updatedCase: LawCase) => {
    setCaseData(updatedCase)
    setEditing(false)
    toast({
      title: 'Sucesso',
      description: 'Caso atualizado com sucesso!'
    })
  }

  const handleEditCancel = () => {
    setEditing(false)
  }

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Carregando caso...</span>
        </div>
      </AppLayout>
    )
  }

  if (!caseData) {
    return (
      <AppLayout>
        <div className="p-6 text-center">
          <h1 className="text-2xl font-bold">Caso não encontrado</h1>
          <p className="text-muted-foreground mt-2">
            O caso solicitado não existe ou você não tem permissão para acessá-lo.
          </p>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <CaseDetails 
        case={caseData} 
        onEdit={handleEdit} 
        onDelete={handleDelete} 
      />
      
      <Dialog open={editing} onOpenChange={setEditing}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <CaseForm
            case={caseData}
            onSuccess={handleEditSuccess}
            onCancel={handleEditCancel}
          />
        </DialogContent>
      </Dialog>
    </AppLayout>
  )
}