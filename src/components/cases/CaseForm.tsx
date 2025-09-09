import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "../../components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../../components/ui/form"
import { Input } from "../../components/ui/input"
import { Textarea } from "../../components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"
import { Calendar } from "../../components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "../../components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { cn } from "../../lib/utils"
import { LawFirmService, type LawCase, type LawClient } from "../../services/lawFirmService"
import { useToast } from "../../hooks/use-toast"
import { useState, useEffect } from "react"
import { Loader2 } from 'lucide-react';

const caseSchema = z.object({
  title: z.string().min(2, "Título deve ter pelo menos 2 caracteres"),
  case_number: z.string().min(1, "Número do caso é obrigatório"),
  case_type: z.string().min(1, "Tipo do caso é obrigatório"),
  description: z.string().optional(),
  client_id: z.string().min(1, "Selecione um cliente"),
  status: z.enum(["open", "in_progress", "closed", "archived"]),
  priority: z.enum(["low", "medium", "high", "urgent"]),
  value: z.coerce.number().optional().nullable(),
  start_date: z.date().optional().nullable(),
  expected_end_date: z.date().optional().nullable(),
  actual_end_date: z.date().optional().nullable(),
  court: z.string().optional(),
  judge: z.string().optional(),
  opposing_party: z.string().optional(),
})

type CaseFormValues = z.infer<typeof caseSchema>

interface CaseFormProps {
  onSuccess: (newCase: LawCase) => void;
  onCancel: () => void;
  case?: LawCase; // Corrigido para corresponder ao que é passado no CaseDetail.tsx
}

// Tipos de caso pré-definidos
const caseTypes = [
  { value: "civil", label: "Civil" },
  { value: "criminal", label: "Criminal" },
  { value: "family", label: "Família" },
  { value: "commercial", label: "Comercial" },
  { value: "labor", label: "Trabalhista" },
  { value: "tax", label: "Tributário" },
  { value: "administrative", label: "Administrativo" },
  { value: "constitutional", label: "Constitucional" },
  { value: "environmental", label: "Ambiental" },
  { value: "consumer", label: "Consumidor" },
  { value: "real_estate", label: "Imobiliário" },
  { value: "intellectual_property", label: "Propriedade Intelectual" },
  { value: "bankruptcy", label: "Falência e Recuperação" },
  { value: "immigration", label: "Imigração" },
  { value: "other", label: "Outros" }
]

export function CaseForm({ onSuccess, onCancel, case: caseData }: CaseFormProps) {
  const [clients, setClients] = useState<LawClient[]>([])
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const fetchedClients = await LawFirmService.getClients()
        setClients(fetchedClients)
      } catch (error) {
        toast({
          title: "Erro ao carregar clientes",
          description: "Não foi possível carregar a lista de clientes.",
          variant: "destructive",
        })
      }
    }
    fetchClients()
  }, [])
  
  const form = useForm<CaseFormValues>({
    resolver: zodResolver(caseSchema),
    defaultValues: {
      title: caseData?.title || "",
      case_number: caseData?.case_number || "",
      case_type: caseData?.case_type || "",
      description: caseData?.description || "",
      client_id: caseData?.client_id || "",
      status: caseData?.status as CaseFormValues["status"] || "open",
      priority: caseData?.priority as CaseFormValues["priority"] || "medium",
      value: caseData?.value || undefined,
      start_date: caseData?.start_date ? new Date(caseData.start_date) : undefined,
      expected_end_date: caseData?.expected_end_date ? new Date(caseData.expected_end_date) : undefined,
      actual_end_date: caseData?.actual_end_date ? new Date(caseData.actual_end_date) : undefined,
      court: caseData?.court || "",
      judge: caseData?.judge || "",
      opposing_party: caseData?.opposing_party || "",
    },
  })

  // Adicionar useEffect para resetar o formulário quando caseData mudar
  useEffect(() => {
    if (caseData) {
      form.reset({
        title: caseData.title || "",
        case_number: caseData.case_number || "",
        case_type: caseData.case_type || "",
        description: caseData.description || "",
        client_id: caseData.client_id || "",
        status: caseData.status as CaseFormValues["status"] || "open",
        priority: caseData.priority as CaseFormValues["priority"] || "medium",
        value: caseData.value || undefined,
        start_date: caseData.start_date ? new Date(caseData.start_date) : undefined,
        expected_end_date: caseData.expected_end_date ? new Date(caseData.expected_end_date) : undefined,
        actual_end_date: caseData.actual_end_date ? new Date(caseData.actual_end_date) : undefined,
        court: caseData.court || "",
        judge: caseData.judge || "",
        opposing_party: caseData.opposing_party || "",
      })
    }
  }, [caseData, form])
  
  const onSubmit = async (values: CaseFormValues) => {
    setLoading(true)
    try {
      const caseToSave = {
        ...values,
        value: values.value === undefined ? null : values.value,
        start_date: values.start_date ? values.start_date.toISOString().split('T')[0] : null,
        expected_end_date: values.expected_end_date ? values.expected_end_date.toISOString().split('T')[0] : null,
        actual_end_date: values.actual_end_date ? values.actual_end_date.toISOString().split('T')[0] : null,
      } as Omit<LawCase, 'id' | 'created_at' | 'updated_at'>;

      const newCase = caseData
        ? await LawFirmService.updateCase(caseData.id, caseToSave)
        : await LawFirmService.createCase(caseToSave)
        
      onSuccess(newCase)
    } catch (error) {
      console.error("Failed to save case:", error)
      toast({
        title: "Erro ao salvar o caso",
        description: "Não foi possível salvar as informações. Verifique se todos os campos estão preenchidos corretamente.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="client_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cliente</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um cliente" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {clients.map(client => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Título</FormLabel>
                <FormControl>
                  <Input placeholder="Título do caso" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="case_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Número do Caso</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: 12345/2025" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="case_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de Caso</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo de caso" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {caseTypes.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="value"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Valor da Causa (R$)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" placeholder="Ex: 15000.50" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="open">Aberto</SelectItem>
                    <SelectItem value="in_progress">Em Progresso</SelectItem>
                    <SelectItem value="closed">Fechado</SelectItem>
                    <SelectItem value="archived">Arquivado</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="priority"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Prioridade</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a prioridade" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="low">Baixa</SelectItem>
                    <SelectItem value="medium">Média</SelectItem>
                    <SelectItem value="high">Alta</SelectItem>
                    <SelectItem value="urgent">Urgente</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="start_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data de Início</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP", { locale: ptBR })
                        ) : (
                          <span>Selecione uma data</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value || undefined}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date > new Date() || date < new Date("1900-01-01")
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="court"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tribunal</FormLabel>
                <FormControl>
                  <Input placeholder="Nome do tribunal" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="judge"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Juiz</FormLabel>
                <FormControl>
                  <Input placeholder="Nome do juiz" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="opposing_party"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Parte Contrária</FormLabel>
              <FormControl>
                <Input placeholder="Nome da parte contrária" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição</FormLabel>
              <FormControl>
                <Textarea placeholder="Descrição detalhada do caso" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Aguarde
              </>
            ) : (
              caseData ? "Atualizar" : "Criar"
            )}
          </Button>
        </div>
      </form>
    </Form>
  )
}

