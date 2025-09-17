import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LawFirmService, type LawClient } from "@/services/lawFirmService"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useState, useEffect } from "react"
import { Loader2 } from "lucide-react"

const clientSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  phone: z.string().optional(),
  address: z.string().optional(),
  document_number: z.string().optional(),
  client_type: z.enum(["individual", "company"]),
  notes: z.string().optional(),
  status: z.enum(["active", "inactive", "potential"])
})

type ClientFormData = z.infer<typeof clientSchema>

interface ClientFormProps {
  client?: LawClient
  onSuccess: () => void
  onCancel: () => void
}

export function ClientForm({ client, onSuccess, onCancel }: ClientFormProps) {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [documentPlaceholder, setDocumentPlaceholder] = useState("000.000.000-00")
  
  const form = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      name: client?.name || "",
      email: client?.email || "",
      phone: client?.phone || "",
      address: client?.address || "",
      document_number: client?.document_number || "",
      client_type: client?.client_type as "individual" | "company" || "individual",
      notes: client?.notes || "",
      status: client?.status as "active" | "inactive" | "potential" || "active"
    }
  })

  const clientType = form.watch("client_type")

  useEffect(() => {
    setDocumentPlaceholder(clientType === "individual" ? "000.000.000-00" : "00.000.000/0000-00")
  }, [clientType])

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '')
    if (numbers.length <= 11) {
      if (numbers.length <= 2) return numbers
      if (numbers.length <= 6) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`
      if (numbers.length <= 10) return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6)}`
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`
    }
    return value
  }

  const formatDocument = (value: string, type: string) => {
    const numbers = value.replace(/\D/g, '')
    if (type === "individual") {
      if (numbers.length <= 3) return numbers
      if (numbers.length <= 6) return `${numbers.slice(0, 3)}.${numbers.slice(3)}`
      if (numbers.length <= 9) return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6)}`
      if (numbers.length <= 11) return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6, 9)}-${numbers.slice(9)}`
    } else {
      if (numbers.length <= 2) return numbers
      if (numbers.length <= 5) return `${numbers.slice(0, 2)}.${numbers.slice(2)}`
      if (numbers.length <= 8) return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5)}`
      if (numbers.length <= 12) return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5, 8)}/${numbers.slice(8, 12)}`
      if (numbers.length <= 14) return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5, 8)}/${numbers.slice(8, 12)}-${numbers.slice(12)}`
    }
    return value
  }

  async function onSubmit(data: ClientFormData) {
    setIsSubmitting(true)
    try {
      if (client) {
        await LawFirmService.updateClient(client.id, {
          ...data,
          phone: data.phone || null,
          address: data.address || null,
          document_number: data.document_number || null,
          notes: data.notes || null
        })
        toast({ title: "Sucesso", description: "Cliente atualizado com sucesso" })
      } else {
        await LawFirmService.createClient(data as any)
        toast({ title: "Sucesso", description: "Cliente criado com sucesso" })
      }
      onSuccess()
    } catch {
      toast({ title: "Erro", description: "Não foi possível salvar o cliente", variant: "destructive" })
    } finally {
      setIsSubmitting(false)
    }
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "active": return "default"
      case "inactive": return "secondary"
      case "potential": return "outline"
      default: return "default"
    }
  }

  return (
    <Card className="w-full max-w-3xl mx-auto border border-gray-100 shadow-xl rounded-2xl bg-white/95 backdrop-blur-sm">
      <CardHeader className="pb-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-3xl font-semibold text-gray-800 tracking-tight">
              {client ? "Editar Cliente" : "Novo Cliente"}
            </CardTitle>
            <CardDescription className="text-gray-500">
              {client ? "Atualize as informações do cliente" : "Preencha os dados para adicionar um novo cliente"}
            </CardDescription>
          </div>
          {client && (
            <Badge variant={getStatusVariant(client.status)} className="text-sm capitalize px-3 py-1 rounded-full shadow-sm">
              {client.status === "active" ? "Ativo" : client.status === "inactive" ? "Inativo" : "Potencial"}
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Nome */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Nome completo / Razão Social</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder={clientType === "individual" ? "Nome completo do cliente" : "Razão Social"} 
                        {...field} 
                        className="h-11 rounded-lg border-gray-200 focus:ring-2 focus:ring-primary/40 transition"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Email */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input 
                        type="email" 
                        placeholder="email@exemplo.com" 
                        {...field} 
                        className="h-11 rounded-lg border-gray-200 focus:ring-2 focus:ring-primary/40 transition"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Telefone */}
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="(11) 99999-9999" 
                        {...field} 
                        onChange={(e) => field.onChange(formatPhone(e.target.value))}
                        className="h-11 rounded-lg border-gray-200 focus:ring-2 focus:ring-primary/40 transition"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Tipo */}
              <FormField
                control={form.control}
                name="client_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de cliente</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-11 rounded-lg border-gray-200 focus:ring-2 focus:ring-primary/40 transition">
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="individual">Pessoa Física</SelectItem>
                        <SelectItem value="company">Pessoa Jurídica</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Documento */}
              <FormField
                control={form.control}
                name="document_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{clientType === "individual" ? "CPF" : "CNPJ"}</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder={documentPlaceholder}
                        {...field} 
                        onChange={(e) => field.onChange(formatDocument(e.target.value, clientType))}
                        className="h-11 rounded-lg border-gray-200 focus:ring-2 focus:ring-primary/40 transition"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Status */}
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-11 rounded-lg border-gray-200 focus:ring-2 focus:ring-primary/40 transition">
                          <SelectValue placeholder="Selecione o status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="active">Ativo</SelectItem>
                        <SelectItem value="inactive">Inativo</SelectItem>
                        <SelectItem value="potential">Potencial</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Endereço */}
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Endereço</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Endereço completo" 
                      {...field} 
                      className="min-h-24 rounded-lg border-gray-200 focus:ring-2 focus:ring-primary/40 transition"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Observações */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Observações sobre o cliente" 
                      {...field} 
                      className="min-h-28 rounded-lg border-gray-200 focus:ring-2 focus:ring-primary/40 transition"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Ações */}
            <div className="flex flex-col-reverse sm:flex-row justify-end gap-4 pt-6 border-t border-gray-100">
              <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting} className="h-11 px-6">
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting} className="h-11 px-6 shadow-md">
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Salvando...
                  </>
                ) : client ? "Atualizar Cliente" : "Criar Cliente"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
