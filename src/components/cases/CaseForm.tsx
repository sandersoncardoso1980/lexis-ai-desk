import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { LawFirmService, type LawCase, type LawClient } from "@/services/lawFirmService"
import { useToast } from "@/hooks/use-toast"
import { useState, useEffect } from "react"

const caseSchema = z.object({
  title: z.string().min(2, "Título deve ter pelo menos 2 caracteres"),
  case_number: z.string().min(1, "Número do caso é obrigatório"),
  case_type: z.string().min(1, "Tipo do caso é obrigatório"),
  description: z.string().optional(),
  client_id: z.string().min(1, "Cliente é obrigatório"),
  status: z.enum(["open", "closed", "pending", "appeal"]),
  priority: z.enum(["low", "medium", "high", "urgent"]),
  value: z.string().optional(),
  start_date: z.date().optional(),
  expected_end_date: z.date().optional(),
  court: z.string().optional(),
  judge: z.string().optional(),
  opposing_party: z.string().optional()
})

type CaseFormData = z.infer<typeof caseSchema>

interface CaseFormProps {
  case?: LawCase
  onSuccess: () => void
  onCancel: () => void
}

export function CaseForm({ case: caseData, onSuccess, onCancel }: CaseFormProps) {
  const { toast } = useToast()
  const [clients, setClients] = useState<LawClient[]>([])
  
  const form = useForm<CaseFormData>({
    resolver: zodResolver(caseSchema),
    defaultValues: {
      title: caseData?.title || "",
      case_number: caseData?.case_number || "",
      case_type: caseData?.case_type || "",
      description: caseData?.description || "",
      client_id: caseData?.client_id || "",
      status: caseData?.status as "open" | "closed" | "pending" | "appeal" || "open",
      priority: caseData?.priority as "low" | "medium" | "high" | "urgent" || "medium",
      value: caseData?.value?.toString() || "",
      start_date: caseData?.start_date ? new Date(caseData.start_date) : undefined,
      expected_end_date: caseData?.expected_end_date ? new Date(caseData.expected_end_date) : undefined,
      court: caseData?.court || "",
      judge: caseData?.judge || "",
      opposing_party: caseData?.opposing_party || ""
    }
  })

  useEffect(() => {
    loadClients()
  }, [])

  const loadClients = async () => {
    try {
      const data = await LawFirmService.getClients()
      setClients(data.filter(client => client.status === 'active'))
    } catch (error) {
      console.error('Error loading clients:', error)
    }
  }

  async function onSubmit(data: CaseFormData) {
    try {
      const submitData = {
        ...data,
        value: data.value ? parseFloat(data.value.replace(/[^\d.,]/g, '').replace(',', '.')) : null,
        start_date: data.start_date?.toISOString().split('T')[0] || null,
        expected_end_date: data.expected_end_date?.toISOString().split('T')[0] || null
      }

      if (caseData) {
        await LawFirmService.updateCase(caseData.id, submitData)
        toast({
          title: "Sucesso",
          description: "Caso atualizado com sucesso"
        })
      } else {
        await LawFirmService.createCase(submitData as any)
        toast({
          title: "Sucesso",
          description: "Caso criado com sucesso"
        })
      }
      onSuccess()
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível salvar o caso",
        variant: "destructive"
      })
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
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
                  <Input placeholder="0000000-00.0000.0.00.0000" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="client_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cliente</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o cliente" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {clients.map((client) => (
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

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="case_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo do Caso</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="civil">Civil</SelectItem>
                    <SelectItem value="criminal">Criminal</SelectItem>
                    <SelectItem value="family">Família</SelectItem>
                    <SelectItem value="commercial">Comercial</SelectItem>
                    <SelectItem value="labor">Trabalhista</SelectItem>
                    <SelectItem value="tax">Tributário</SelectItem>
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
                <Select onValueChange={field.onChange} defaultValue={field.value}>
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
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="open">Aberto</SelectItem>
                    <SelectItem value="pending">Pendente</SelectItem>
                    <SelectItem value="appeal">Em Recurso</SelectItem>
                    <SelectItem value="closed">Fechado</SelectItem>
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
                <FormLabel>Valor (R$)</FormLabel>
                <FormControl>
                  <Input placeholder="0,00" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="start_date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Data de Início</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
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
                      selected={field.value}
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

          <FormField
            control={form.control}
            name="expected_end_date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Data Prevista de Conclusão</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
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
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => date < new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
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
          <Button type="submit">
            {caseData ? "Atualizar" : "Criar"}
          </Button>
        </div>
      </form>
    </Form>
  )
}