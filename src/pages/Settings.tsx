import { AppLayout } from "@/components/layout/AppLayout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Settings as SettingsIcon, 
  User, 
  Bell, 
  Shield, 
  Database, 
  Lock,
  Key,
  Smartphone,
  Mail,
  Save
} from "lucide-react"

export default function Settings() {
  return (
    <AppLayout breadcrumbs={[
      { label: "Dashboard", href: "/" },
      { label: "Configurações" }
    ]}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Configurações</h2>
          <p className="text-muted-foreground">Gerencie as configurações do sistema e sua conta</p>
        </div>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="profile">Perfil</TabsTrigger>
          <TabsTrigger value="notifications">Notificações</TabsTrigger>
          <TabsTrigger value="security">Segurança</TabsTrigger>
          <TabsTrigger value="integrations">Integrações</TabsTrigger>
          <TabsTrigger value="system">Sistema</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Informações Pessoais
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Nome</Label>
                  <Input id="firstName" placeholder="João" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Sobrenome</Label>
                  <Input id="lastName" placeholder="Silva" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="joao.silva@email.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input id="phone" placeholder="(11) 99999-9999" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio">Biografia</Label>
                <Textarea id="bio" placeholder="Advogado especialista em..." />
              </div>
              <Button>
                <Save className="mr-2 h-4 w-4" />
                Salvar Alterações
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Informações Profissionais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="oab">Número da OAB</Label>
                <Input id="oab" placeholder="123456/SP" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="specialty">Especialidade</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione sua especialidade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="empresarial">Direito Empresarial</SelectItem>
                    <SelectItem value="trabalhista">Direito Trabalhista</SelectItem>
                    <SelectItem value="civil">Direito Civil</SelectItem>
                    <SelectItem value="tributario">Direito Tributário</SelectItem>
                    <SelectItem value="criminal">Direito Criminal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="office">Escritório</Label>
                <Input id="office" placeholder="Silva & Associados" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Preferências de Notificação
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="text-base">Notificações por Email</div>
                  <div className="text-sm text-muted-foreground">
                    Receber notificações importantes por email
                  </div>
                </div>
                <Switch defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="text-base">Lembretes de Prazos</div>
                  <div className="text-sm text-muted-foreground">
                    Alertas para prazos processuais importantes
                  </div>
                </div>
                <Switch defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="text-base">Novos Documentos</div>
                  <div className="text-sm text-muted-foreground">
                    Notificar quando novos documentos forem adicionados
                  </div>
                </div>
                <Switch defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="text-base">Atualizações de Casos</div>
                  <div className="text-sm text-muted-foreground">
                    Notificar sobre mudanças no status dos casos
                  </div>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="text-base">Relatórios Semanais</div>
                  <div className="text-sm text-muted-foreground">
                    Receber resumo semanal das atividades
                  </div>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Segurança da Conta
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Senha Atual</Label>
                  <Input id="currentPassword" type="password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">Nova Senha</Label>
                  <Input id="newPassword" type="password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
                  <Input id="confirmPassword" type="password" />
                </div>
                <Button>Alterar Senha</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                Autenticação de Dois Fatores
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="text-base">2FA por SMS</div>
                  <div className="text-sm text-muted-foreground">
                    Receber códigos de verificação por SMS
                  </div>
                </div>
                <Badge variant="outline" className="bg-success/10 text-success">
                  Ativo
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="text-base">App Autenticador</div>
                  <div className="text-sm text-muted-foreground">
                    Usar Google Authenticator ou similar
                  </div>
                </div>
                <Button variant="outline" size="sm">Configurar</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Criptografia de Documentos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 border rounded-lg bg-success/5">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="h-4 w-4 text-success" />
                  <span className="font-medium text-success">Criptografia Ativa</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Todos os documentos são automaticamente criptografados com AES-256
                </p>
              </div>
              
              <div className="space-y-2">
                <Label>Chave de Criptografia</Label>
                <div className="flex gap-2">
                  <Input value="****-****-****-****" readOnly />
                  <Button variant="outline">Regenerar</Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Mantenha sua chave segura. Sem ela, os documentos não podem ser descriptografados.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Integrações Disponíveis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Database className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold">Supabase</h4>
                      <p className="text-sm text-muted-foreground">Banco de dados e autenticação</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="bg-warning/10 text-warning">
                    Pendente
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                      <Smartphone className="h-5 w-5 text-accent" />
                    </div>
                    <div>
                      <h4 className="font-semibold">API de IA</h4>
                      <p className="text-sm text-muted-foreground">Assistente jurídico inteligente</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="bg-warning/10 text-warning">
                    Pendente
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center">
                      <Mail className="h-5 w-5 text-success" />
                    </div>
                    <div>
                      <h4 className="font-semibold">Email SMTP</h4>
                      <p className="text-sm text-muted-foreground">Serviço de envio de emails</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="bg-success/10 text-success">
                    Configurado
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <SettingsIcon className="h-5 w-5" />
                Configurações do Sistema
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Fuso Horário</Label>
                <Select defaultValue="america-sao_paulo">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="america-sao_paulo">América/São Paulo (GMT-3)</SelectItem>
                    <SelectItem value="america-new_york">América/Nova York (GMT-5)</SelectItem>
                    <SelectItem value="europe-london">Europa/Londres (GMT+0)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Idioma</Label>
                <Select defaultValue="pt-br">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pt-br">Português (Brasil)</SelectItem>
                    <SelectItem value="en-us">English (US)</SelectItem>
                    <SelectItem value="es-es">Español</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Formato de Data</Label>
                <Select defaultValue="dd-mm-yyyy">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dd-mm-yyyy">DD/MM/YYYY</SelectItem>
                    <SelectItem value="mm-dd-yyyy">MM/DD/YYYY</SelectItem>
                    <SelectItem value="yyyy-mm-dd">YYYY-MM-DD</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="text-base">Backup Automático</div>
                  <div className="text-sm text-muted-foreground">
                    Realizar backup diário dos dados
                  </div>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="text-base">Logs de Auditoria</div>
                  <div className="text-sm text-muted-foreground">
                    Registrar todas as ações do sistema
                  </div>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Informações do Sistema</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Versão</Label>
                  <p className="text-sm text-muted-foreground">v1.0.0</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Última Atualização</Label>
                  <p className="text-sm text-muted-foreground">25/02/2024</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Ambiente</Label>
                  <p className="text-sm text-muted-foreground">Desenvolvimento</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Uptime</Label>
                  <p className="text-sm text-muted-foreground">99.9%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AppLayout>
  )
}