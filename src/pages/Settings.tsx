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
import { useState, useEffect } from "react"
import { toast } from "sonner" // Assumindo que você está usando sonner para toasts

// Tipos para os dados do formulário
interface ProfileData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  bio: string;
  oab: string;
  specialty: string;
  office: string;
}

interface NotificationSettings {
  emailNotifications: boolean;
  deadlineReminders: boolean;
  newDocuments: boolean;
  caseUpdates: boolean;
  weeklyReports: boolean;
}

interface SecuritySettings {
  twoFactorSMS: boolean;
  encryptionKey: string;
}

interface SystemSettings {
  timezone: string;
  language: string;
  dateFormat: string;
  autoBackup: boolean;
  auditLogs: boolean;
}

export default function Settings() {
  // Estados para os dados do formulário
  const [profileData, setProfileData] = useState<ProfileData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    bio: "",
    oab: "",
    specialty: "",
    office: ""
  });

  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    emailNotifications: true,
    deadlineReminders: true,
    newDocuments: true,
    caseUpdates: true,
    weeklyReports: false
  });

  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    twoFactorSMS: true,
    encryptionKey: "****-****-****-****"
  });

  const [systemSettings, setSystemSettings] = useState<SystemSettings>({
    timezone: "america-sao_paulo",
    language: "pt-br",
    dateFormat: "dd-mm-yyyy",
    autoBackup: true,
    auditLogs: true
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const [isLoading, setIsLoading] = useState(false);

  // Carregar dados salvos ao inicializar
  useEffect(() => {
    const savedProfileData = localStorage.getItem("profileData");
    if (savedProfileData) {
      setProfileData(JSON.parse(savedProfileData));
    }

    const savedNotificationSettings = localStorage.getItem("notificationSettings");
    if (savedNotificationSettings) {
      setNotificationSettings(JSON.parse(savedNotificationSettings));
    }

    const savedSecuritySettings = localStorage.getItem("securitySettings");
    if (savedSecuritySettings) {
      setSecuritySettings(JSON.parse(savedSecuritySettings));
    }

    const savedSystemSettings = localStorage.getItem("systemSettings");
    if (savedSystemSettings) {
      setSystemSettings(JSON.parse(savedSystemSettings));
    }
  }, []);

  // Manipuladores de eventos
  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setProfileData(prev => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  const handleNotificationChange = (name: keyof NotificationSettings, checked: boolean) => {
    setNotificationSettings(prev => ({ ...prev, [name]: checked }));
  };

  const handleSystemChange = (name: keyof SystemSettings, value: string | boolean) => {
    setSystemSettings(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setPasswordData(prev => ({ ...prev, [id]: value }));
  };

  // Funções de salvamento
  const saveProfile = () => {
    setIsLoading(true);
    // Simular uma requisição assíncrona
    setTimeout(() => {
      localStorage.setItem("profileData", JSON.stringify(profileData));
      setIsLoading(false);
      toast.success("Perfil salvo com sucesso!");
    }, 1000);
  };

  const saveNotifications = () => {
    setIsLoading(true);
    setTimeout(() => {
      localStorage.setItem("notificationSettings", JSON.stringify(notificationSettings));
      setIsLoading(false);
      toast.success("Configurações de notificação salvas!");
    }, 1000);
  };

  const saveSecurity = () => {
    setIsLoading(true);
    setTimeout(() => {
      localStorage.setItem("securitySettings", JSON.stringify(securitySettings));
      setIsLoading(false);
      
      // Validar senha
      if (passwordData.newPassword && passwordData.newPassword !== passwordData.confirmPassword) {
        toast.error("As senhas não coincidem!");
        return;
      }
      
      if (passwordData.newPassword) {
        // Aqui você faria a chamada API para alterar a senha
        toast.success("Senha alterada com sucesso!");
        setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      }
      
      toast.success("Configurações de segurança salvas!");
    }, 1000);
  };

  const saveSystem = () => {
    setIsLoading(true);
    setTimeout(() => {
      localStorage.setItem("systemSettings", JSON.stringify(systemSettings));
      setIsLoading(false);
      toast.success("Configurações do sistema salvas!");
    }, 1000);
  };

  const regenerateEncryptionKey = () => {
    const newKey = Math.random().toString(36).substring(2, 10) + '-' + 
                  Math.random().toString(36).substring(2, 10) + '-' + 
                  Math.random().toString(36).substring(2, 10) + '-' + 
                  Math.random().toString(36).substring(2, 10);
    setSecuritySettings(prev => ({ ...prev, encryptionKey: newKey }));
    toast.success("Chave de criptografia regenerada!");
  };

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
                  <Input 
                    id="firstName" 
                    placeholder="João" 
                    value={profileData.firstName}
                    onChange={handleProfileChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Sobrenome</Label>
                  <Input 
                    id="lastName" 
                    placeholder="Silva" 
                    value={profileData.lastName}
                    onChange={handleProfileChange}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="joao.silva@email.com" 
                  value={profileData.email}
                  onChange={handleProfileChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input 
                  id="phone" 
                  placeholder="(11) 99999-9999" 
                  value={profileData.phone}
                  onChange={handleProfileChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio">Biografia</Label>
                <Textarea 
                  id="bio" 
                  placeholder="Advogado especialista em..." 
                  value={profileData.bio}
                  onChange={handleProfileChange}
                />
              </div>
              <Button onClick={saveProfile} disabled={isLoading}>
                <Save className="mr-2 h-4 w-4" />
                {isLoading ? "Salvando..." : "Salvar Alterações"}
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
                <Input 
                  id="oab" 
                  placeholder="123456/SP" 
                  value={profileData.oab}
                  onChange={handleProfileChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="specialty">Especialidade</Label>
                <Select 
                  value={profileData.specialty} 
                  onValueChange={(value) => handleSelectChange("specialty", value)}
                >
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
                <Input 
                  id="office" 
                  placeholder="Silva & Associados" 
                  value={profileData.office}
                  onChange={handleProfileChange}
                />
              </div>
              <Button onClick={saveProfile} disabled={isLoading}>
                <Save className="mr-2 h-4 w-4" />
                {isLoading ? "Salvando..." : "Salvar Alterações"}
              </Button>
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
                <Switch 
                  checked={notificationSettings.emailNotifications}
                  onCheckedChange={(checked) => handleNotificationChange("emailNotifications", checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="text-base">Lembretes de Prazos</div>
                  <div className="text-sm text-muted-foreground">
                    Alertas para prazos processuais importantes
                  </div>
                </div>
                <Switch 
                  checked={notificationSettings.deadlineReminders}
                  onCheckedChange={(checked) => handleNotificationChange("deadlineReminders", checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="text-base">Novos Documentos</div>
                  <div className="text-sm text-muted-foreground">
                    Notificar quando novos documentos forem adicionados
                  </div>
                </div>
                <Switch 
                  checked={notificationSettings.newDocuments}
                  onCheckedChange={(checked) => handleNotificationChange("newDocuments", checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="text-base">Atualizações de Casos</div>
                  <div className="text-sm text-muted-foreground">
                    Notificar sobre mudanças no status dos casos
                  </div>
                </div>
                <Switch 
                  checked={notificationSettings.caseUpdates}
                  onCheckedChange={(checked) => handleNotificationChange("caseUpdates", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="text-base">Relatórios Semanais</div>
                  <div className="text-sm text-muted-foreground">
                    Receber resumo semanal das atividades
                  </div>
                </div>
                <Switch 
                  checked={notificationSettings.weeklyReports}
                  onCheckedChange={(checked) => handleNotificationChange("weeklyReports", checked)}
                />
              </div>
              
              <Button onClick={saveNotifications} disabled={isLoading}>
                <Save className="mr-2 h-4 w-4" />
                {isLoading ? "Salvando..." : "Salvar Preferências"}
              </Button>
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
                  <Input 
                    id="currentPassword" 
                    type="password" 
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">Nova Senha</Label>
                  <Input 
                    id="newPassword" 
                    type="password" 
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
                  <Input 
                    id="confirmPassword" 
                    type="password" 
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                  />
                </div>
                <Button onClick={saveSecurity} disabled={isLoading}>
                  {isLoading ? "Processando..." : "Alterar Senha"}
                </Button>
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
                  <Input value={securitySettings.encryptionKey} readOnly />
                  <Button variant="outline" onClick={regenerateEncryptionKey}>
                    Regenerar
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Mantenha sua chave segura. Sem ela, os documentos não podem ser descriptografados.
                </p>
              </div>
            </CardContent>
          </Card>
          
          <Button onClick={saveSecurity} disabled={isLoading}>
            <Save className="mr-2 h-4 w-4" />
            {isLoading ? "Salvando..." : "Salvar Configurações de Segurança"}
          </Button>
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
                <Select 
                  value={systemSettings.timezone} 
                  onValueChange={(value) => handleSystemChange("timezone", value)}
                >
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
                <Select 
                  value={systemSettings.language} 
                  onValueChange={(value) => handleSystemChange("language", value)}
                >
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
                <Select 
                  value={systemSettings.dateFormat} 
                  onValueChange={(value) => handleSystemChange("dateFormat", value)}
                >
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
                <Switch 
                  checked={systemSettings.autoBackup}
                  onCheckedChange={(checked) => handleSystemChange("autoBackup", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="text-base">Logs de Auditoria</div>
                  <div className="text-sm text-muted-foreground">
                    Registrar todas as ações do sistema
                  </div>
                </div>
                <Switch 
                  checked={systemSettings.auditLogs}
                  onCheckedChange={(checked) => handleSystemChange("auditLogs", checked)}
                />
              </div>
              
              <Button onClick={saveSystem} disabled={isLoading}>
                <Save className="mr-2 h-4 w-4" />
                {isLoading ? "Salvando..." : "Salvar Configurações do Sistema"}
              </Button>
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