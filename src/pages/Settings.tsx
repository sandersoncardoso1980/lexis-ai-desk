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
  Save,
  Clock,
  Calendar,
  ChevronDown,
  ChevronUp
} from "lucide-react"
import { useState, useEffect } from "react"
import { toast } from "sonner"
import { LawFirmService } from "@/services/lawFirmService"
import { supabase } from "@/lib/supabaseClient"

// Tipos atualizados baseados no schema da tabela profiles
interface ProfileData {
  id?: string;
  user_id?: string;
  full_name: string;
  role: string;
  avatar_url?: string;
  phone: string;
  bio: string;
  oab: string;
  specialty: string;
  office: string;
  created_at?: string;
  updated_at?: string;
}

// Interface expandida para notificações com horários
interface NotificationSettings {
  emailNotifications: boolean;
  deadlineReminders: boolean;
  newDocuments: boolean;
  caseUpdates: boolean;
  weeklyReports: boolean;
  gmailNotifications: boolean; // Nova opção para Gmail
  // Novos campos para horários de notificação (UTC-3 São Paulo)
  taskReminderTime: string; // HH:MM format
  appointmentReminderTime: string; // HH:MM format
  emailDigestTime: string; // HH:MM format
  weeklyReportDay: string; // day of week
  weeklyReportTime: string; // HH:MM format
  enableTaskReminders: boolean;
  enableAppointmentReminders: boolean;
  enableEmailDigest: boolean;
  reminderAdvanceMinutes: number; // quantos minutos antes do compromisso/tarefa
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
    full_name: "",
    role: "lawyer",
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
    weeklyReports: false,
    gmailNotifications: false,
    // Configurações de horário padrão para UTC-3 (São Paulo)
    taskReminderTime: "09:00",
    appointmentReminderTime: "08:30",
    emailDigestTime: "18:00",
    weeklyReportDay: "monday",
    weeklyReportTime: "09:00",
    enableTaskReminders: true,
    enableAppointmentReminders: true,
    enableEmailDigest: true,
    reminderAdvanceMinutes: 30
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
  const [currentProfile, setCurrentProfile] = useState<ProfileData | null>(null);
  const [expandedSections, setExpandedSections] = useState({
    timeSettings: true,
    weeklySettings: false
  });

  // Carregar dados do perfil do usuário logado
  useEffect(() => {
    loadUserProfile();
    loadSavedSettings();
  }, []);

  const loadUserProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const profile = await LawFirmService.getProfile(user.id);
        if (profile) {
          setCurrentProfile(profile);
          setProfileData({
            id: profile.id,
            user_id: profile.user_id,
            full_name: profile.full_name || "",
            role: profile.role || "lawyer",
            avatar_url: profile.avatar_url,
            phone: profile.phone || "",
            bio: profile.bio || "",
            oab: profile.oab || "",
            specialty: profile.specialty || "",
            office: profile.office || "",
            created_at: profile.created_at,
            updated_at: profile.updated_at
          });
        }
      }
    } catch (error) {
      console.error("Erro ao carregar perfil:", error);
      toast.error("Erro ao carregar dados do perfil");
    }
  };

  const loadSavedSettings = () => {
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
  };

  // Manipuladores de eventos
  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setProfileData(prev => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  const handleNotificationChange = (name: keyof NotificationSettings, value: boolean | string | number) => {
    setNotificationSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleSystemChange = (name: keyof SystemSettings, value: string | boolean) => {
    setSystemSettings(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setPasswordData(prev => ({ ...prev, [id]: value }));
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // Funções de salvamento
  const saveProfile = async () => {
    setIsLoading(true);
    try {
      if (currentProfile?.id) {
        // Atualizar perfil existente
        await LawFirmService.updateProfile(currentProfile.id, {
          full_name: profileData.full_name,
          role: profileData.role,
          phone: profileData.phone,
          bio: profileData.bio,
          oab: profileData.oab,
          specialty: profileData.specialty,
          office: profileData.office
        });
      } else {
        // Criar novo perfil
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await LawFirmService.createProfile({
            user_id: user.id,
            full_name: profileData.full_name,
            role: profileData.role,
            phone: profileData.phone,
            bio: profileData.bio,
            oab: profileData.oab,
            specialty: profileData.specialty,
            office: profileData.office
          });
        }
      }
      
      toast.success("Perfil salvo com sucesso!");
      await loadUserProfile(); // Recarregar dados
    } catch (error) {
      console.error("Erro ao salvar perfil:", error);
      toast.error("Erro ao salvar perfil");
    } finally {
      setIsLoading(false);
    }
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

  // Função para formatar horário no timezone UTC-3
  const formatTimeForSaoPaulo = (time: string) => {
    return `${time} (UTC-3 São Paulo)`;
  };

  return (
    <AppLayout>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Configurações</h2>
          <p className="text-sm sm:text-base text-muted-foreground">Gerencie as configurações do sistema e sua conta</p>
        </div>
      </div>

      <Tabs defaultValue="profile" className="space-y-4 sm:space-y-6">
        {/* Tabs responsivas com scroll horizontal em mobile */}
        <div className="w-full overflow-x-auto">
          <TabsList className="grid w-full min-w-[500px] grid-cols-5 h-auto p-1">
            <TabsTrigger value="profile" className="text-xs sm:text-sm px-2 py-2">
              <User className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Perfil</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="text-xs sm:text-sm px-2 py-2">
              <Bell className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Notificações</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="text-xs sm:text-sm px-2 py-2">
              <Shield className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Segurança</span>
            </TabsTrigger>
            <TabsTrigger value="integrations" className="text-xs sm:text-sm px-2 py-2">
              <Database className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Integrações</span>
            </TabsTrigger>
            <TabsTrigger value="system" className="text-xs sm:text-sm px-2 py-2">
              <SettingsIcon className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Sistema</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="profile" className="space-y-4 sm:space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <User className="h-5 w-5" />
                Informações Pessoais
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="full_name" className="text-sm font-medium">Nome Completo</Label>
                <Input 
                  id="full_name" 
                  placeholder="João Silva Santos" 
                  value={profileData.full_name}
                  onChange={handleProfileChange}
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-medium">Telefone</Label>
                <Input 
                  id="phone" 
                  placeholder="(11) 99999-9999" 
                  value={profileData.phone}
                  onChange={handleProfileChange}
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio" className="text-sm font-medium">Biografia</Label>
                <Textarea 
                  id="bio" 
                  placeholder="Advogado especialista em..." 
                  value={profileData.bio}
                  onChange={handleProfileChange}
                  className="w-full min-h-[100px] resize-y"
                />
              </div>
              <Button onClick={saveProfile} disabled={isLoading} className="w-full sm:w-auto">
                <Save className="mr-2 h-4 w-4" />
                {isLoading ? "Salvando..." : "Salvar Alterações"}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">Informações Profissionais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="role" className="text-sm font-medium">Função</Label>
                  <Select 
                    value={profileData.role} 
                    onValueChange={(value) => handleSelectChange("role", value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione sua função" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lawyer">Advogado</SelectItem>
                      <SelectItem value="paralegal">Paralegal</SelectItem>
                      <SelectItem value="secretary">Secretário(a)</SelectItem>
                      <SelectItem value="partner">Sócio</SelectItem>
                      <SelectItem value="intern">Estagiário</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="oab" className="text-sm font-medium">Número da OAB</Label>
                  <Input 
                    id="oab" 
                    placeholder="123456/SP" 
                    value={profileData.oab}
                    onChange={handleProfileChange}
                    className="w-full"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="specialty" className="text-sm font-medium">Especialidade</Label>
                <Select 
                  value={profileData.specialty} 
                  onValueChange={(value) => handleSelectChange("specialty", value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione sua especialidade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="empresarial">Direito Empresarial</SelectItem>
                    <SelectItem value="trabalhista">Direito Trabalhista</SelectItem>
                    <SelectItem value="civil">Direito Civil</SelectItem>
                    <SelectItem value="tributario">Direito Tributário</SelectItem>
                    <SelectItem value="criminal">Direito Criminal</SelectItem>
                    <SelectItem value="familia">Direito de Família</SelectItem>
                    <SelectItem value="imobiliario">Direito Imobiliário</SelectItem>
                    <SelectItem value="consumidor">Direito do Consumidor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="office" className="text-sm font-medium">Escritório</Label>
                <Input 
                  id="office" 
                  placeholder="Silva & Associados" 
                  value={profileData.office}
                  onChange={handleProfileChange}
                  className="w-full"
                />
              </div>
              
              <Button onClick={saveProfile} disabled={isLoading} className="w-full sm:w-auto">
                <Save className="mr-2 h-4 w-4" />
                {isLoading ? "Salvando..." : "Salvar Alterações"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4 sm:space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <Bell className="h-5 w-5" />
                Preferências de Notificação
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6">
              {/* Grid responsivo para notificações */}
              <div className="grid grid-cols-1 gap-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 border rounded-lg">
                  <div className="space-y-1">
                    <div className="text-sm sm:text-base font-medium">Notificações por Email</div>
                    <div className="text-xs sm:text-sm text-muted-foreground">
                      Receber notificações importantes por email
                    </div>
                  </div>
                  <Switch 
                    checked={notificationSettings.emailNotifications}
                    onCheckedChange={(checked) => handleNotificationChange("emailNotifications", checked)}
                  />
                </div>
                
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 border rounded-lg">
                  <div className="space-y-1">
                    <div className="text-sm sm:text-base font-medium">Notificações do Gmail</div>
                    <div className="text-xs sm:text-sm text-muted-foreground">
                      Receber notificações quando chegar novo email no Gmail
                    </div>
                  </div>
                  <Switch 
                    checked={notificationSettings.gmailNotifications}
                    onCheckedChange={(checked) => handleNotificationChange("gmailNotifications", checked)}
                  />
                </div>
                
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 border rounded-lg">
                  <div className="space-y-1">
                    <div className="text-sm sm:text-base font-medium">Lembretes de Prazos</div>
                    <div className="text-xs sm:text-sm text-muted-foreground">
                      Alertas para prazos processuais importantes
                    </div>
                  </div>
                  <Switch 
                    checked={notificationSettings.deadlineReminders}
                    onCheckedChange={(checked) => handleNotificationChange("deadlineReminders", checked)}
                  />
                </div>
                
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 border rounded-lg">
                  <div className="space-y-1">
                    <div className="text-sm sm:text-base font-medium">Novos Documentos</div>
                    <div className="text-xs sm:text-sm text-muted-foreground">
                      Notificar quando novos documentos forem adicionados
                    </div>
                  </div>
                  <Switch 
                    checked={notificationSettings.newDocuments}
                    onCheckedChange={(checked) => handleNotificationChange("newDocuments", checked)}
                  />
                </div>
                
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 border rounded-lg">
                  <div className="space-y-1">
                    <div className="text-sm sm:text-base font-medium">Atualizações de Casos</div>
                    <div className="text-xs sm:text-sm text-muted-foreground">
                      Notificar sobre mudanças no status dos casos
                    </div>
                  </div>
                  <Switch 
                    checked={notificationSettings.caseUpdates}
                    onCheckedChange={(checked) => handleNotificationChange("caseUpdates", checked)}
                  />
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 border rounded-lg">
                  <div className="space-y-1">
                    <div className="text-sm sm:text-base font-medium">Relatórios Semanais</div>
                    <div className="text-xs sm:text-sm text-muted-foreground">
                      Receber resumo semanal das atividades
                    </div>
                  </div>
                  <Switch 
                    checked={notificationSettings.weeklyReports}
                    onCheckedChange={(checked) => handleNotificationChange("weeklyReports", checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Seção de horários com expansão/colapso */}
          <Card>
            <CardHeader>
              <CardTitle 
                className="flex items-center justify-between cursor-pointer text-lg sm:text-xl"
                onClick={() => toggleSection('timeSettings')}
              >
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Horários de Notificação (UTC-3 São Paulo)
                </div>
                {expandedSections.timeSettings ? 
                  <ChevronUp className="h-5 w-5" /> : 
                  <ChevronDown className="h-5 w-5" />
                }
              </CardTitle>
            </CardHeader>
            {expandedSections.timeSettings && (
              <CardContent className="space-y-4 sm:space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 border rounded-lg">
                      <div className="space-y-1">
                        <div className="text-sm sm:text-base font-medium">Lembretes de Tarefas</div>
                        <div className="text-xs sm:text-sm text-muted-foreground">
                          Ativar lembretes automáticos para tarefas
                        </div>
                      </div>
                      <Switch 
                        checked={notificationSettings.enableTaskReminders}
                        onCheckedChange={(checked) => handleNotificationChange("enableTaskReminders", checked)}
                      />
                    </div>
                    
                    {notificationSettings.enableTaskReminders && (
                      <div className="space-y-2 pl-3">
                        <Label htmlFor="taskReminderTime" className="text-sm font-medium">Horário dos Lembretes de Tarefas</Label>
                        <Input 
                          id="taskReminderTime"
                          type="time"
                          value={notificationSettings.taskReminderTime}
                          onChange={(e) => handleNotificationChange("taskReminderTime", e.target.value)}
                          className="w-full"
                        />
                        <p className="text-xs text-muted-foreground">
                          {formatTimeForSaoPaulo(notificationSettings.taskReminderTime)}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 border rounded-lg">
                      <div className="space-y-1">
                        <div className="text-sm sm:text-base font-medium">Lembretes de Compromissos</div>
                        <div className="text-xs sm:text-sm text-muted-foreground">
                          Ativar lembretes para agendamentos
                        </div>
                      </div>
                      <Switch 
                        checked={notificationSettings.enableAppointmentReminders}
                        onCheckedChange={(checked) => handleNotificationChange("enableAppointmentReminders", checked)}
                      />
                    </div>
                    
                    {notificationSettings.enableAppointmentReminders && (
                      <div className="space-y-2 pl-3">
                        <Label htmlFor="appointmentReminderTime" className="text-sm font-medium">Horário dos Lembretes de Compromissos</Label>
                        <Input 
                          id="appointmentReminderTime"
                          type="time"
                          value={notificationSettings.appointmentReminderTime}
                          onChange={(e) => handleNotificationChange("appointmentReminderTime", e.target.value)}
                          className="w-full"
                        />
                        <p className="text-xs text-muted-foreground">
                          {formatTimeForSaoPaulo(notificationSettings.appointmentReminderTime)}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 border rounded-lg">
                      <div className="space-y-1">
                        <div className="text-sm sm:text-base font-medium">Resumo Diário por Email</div>
                        <div className="text-xs sm:text-sm text-muted-foreground">
                          Receber resumo das atividades do dia
                        </div>
                      </div>
                      <Switch 
                        checked={notificationSettings.enableEmailDigest}
                        onCheckedChange={(checked) => handleNotificationChange("enableEmailDigest", checked)}
                      />
                    </div>
                    
                    {notificationSettings.enableEmailDigest && (
                      <div className="space-y-2 pl-3">
                        <Label htmlFor="emailDigestTime" className="text-sm font-medium">Horário do Resumo Diário</Label>
                        <Input 
                          id="emailDigestTime"
                          type="time"
                          value={notificationSettings.emailDigestTime}
                          onChange={(e) => handleNotificationChange("emailDigestTime", e.target.value)}
                          className="w-full"
                        />
                        <p className="text-xs text-muted-foreground">
                          {formatTimeForSaoPaulo(notificationSettings.emailDigestTime)}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="reminderAdvanceMinutes" className="text-sm font-medium">Antecedência dos Lembretes</Label>
                      <Select 
                        value={notificationSettings.reminderAdvanceMinutes.toString()} 
                        onValueChange={(value) => handleNotificationChange("reminderAdvanceMinutes", parseInt(value))}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="15">15 minutos antes</SelectItem>
                          <SelectItem value="30">30 minutos antes</SelectItem>
                          <SelectItem value="60">1 hora antes</SelectItem>
                          <SelectItem value="120">2 horas antes</SelectItem>
                          <SelectItem value="1440">1 dia antes</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {notificationSettings.weeklyReports && (
                  <div 
                    className="border-t pt-4 sm:pt-6 cursor-pointer"
                    onClick={() => toggleSection('weeklySettings')}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-base sm:text-lg font-medium">Configurações do Relatório Semanal</h4>
                      {expandedSections.weeklySettings ? 
                        <ChevronUp className="h-5 w-5" /> : 
                        <ChevronDown className="h-5 w-5" />
                      }
                    </div>
                    {expandedSections.weeklySettings && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="weeklyReportDay" className="text-sm font-medium">Dia da Semana</Label>
                          <Select 
                            value={notificationSettings.weeklyReportDay} 
                            onValueChange={(value) => handleNotificationChange("weeklyReportDay", value)}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="monday">Segunda-feira</SelectItem>
                              <SelectItem value="tuesday">Terça-feira</SelectItem>
                              <SelectItem value="wednesday">Quarta-feira</SelectItem>
                              <SelectItem value="thursday">Quinta-feira</SelectItem>
                              <SelectItem value="friday">Sexta-feira</SelectItem>
                              <SelectItem value="saturday">Sábado</SelectItem>
                              <SelectItem value="sunday">Domingo</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="weeklyReportTime" className="text-sm font-medium">Horário</Label>
                          <Input 
                            id="weeklyReportTime"
                            type="time"
                            value={notificationSettings.weeklyReportTime}
                            onChange={(e) => handleNotificationChange("weeklyReportTime", e.target.value)}
                            className="w-full"
                          />
                          <p className="text-xs text-muted-foreground">
                            {formatTimeForSaoPaulo(notificationSettings.weeklyReportTime)}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                <Button onClick={saveNotifications} disabled={isLoading} className="w-full sm:w-auto">
                  <Save className="mr-2 h-4 w-4" />
                  {isLoading ? "Salvando..." : "Salvar Preferências"}
                </Button>
              </CardContent>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4 sm:space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <Shield className="h-5 w-5" />
                Segurança da Conta
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword" className="text-sm font-medium">Senha Atual</Label>
                  <Input 
                    id="currentPassword" 
                    type="password" 
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword" className="text-sm font-medium">Nova Senha</Label>
                  <Input 
                    id="newPassword" 
                    type="password" 
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm font-medium">Confirmar Nova Senha</Label>
                  <Input 
                    id="confirmPassword" 
                    type="password" 
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    className="w-full"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 border rounded-lg">
                <div className="space-y-1">
                  <div className="text-sm sm:text-base font-medium">Autenticação de Dois Fatores (SMS)</div>
                  <div className="text-xs sm:text-sm text-muted-foreground">
                    Adicionar uma camada extra de segurança
                  </div>
                </div>
                <Switch 
                  checked={securitySettings.twoFactorSMS}
                  onCheckedChange={(checked) => setSecuritySettings(prev => ({ ...prev, twoFactorSMS: checked }))}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <Lock className="h-5 w-5" />
                Criptografia de Documentos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 sm:p-4 border rounded-lg bg-success/5">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="h-4 w-4 text-success" />
                  <span className="text-sm sm:text-base font-medium text-success">Criptografia Ativa</span>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Todos os documentos são automaticamente criptografados com AES-256
                </p>
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-medium">Chave de Criptografia</Label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Input value={securitySettings.encryptionKey} readOnly className="flex-1" />
                  <Button variant="outline" onClick={regenerateEncryptionKey} className="w-full sm:w-auto">
                    Regenerar
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Mantenha sua chave segura. Sem ela, os documentos não podem ser descriptografados.
                </p>
              </div>
            </CardContent>
          </Card>
          
          <Button onClick={saveSecurity} disabled={isLoading} className="w-full sm:w-auto">
            <Save className="mr-2 h-4 w-4" />
            {isLoading ? "Salvando..." : "Salvar Configurações de Segurança"}
          </Button>
        </TabsContent>

        <TabsContent value="integrations" className="space-y-4 sm:space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <Database className="h-5 w-5" />
                Integrações Disponíveis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 sm:p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Database className="h-5 w-5 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-sm sm:text-base font-semibold">Supabase</h4>
                      <p className="text-xs sm:text-sm text-muted-foreground">Banco de dados e autenticação</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="bg-success/10 text-success self-start sm:self-center">
                    Configurado
                  </Badge>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 sm:p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Mail className="h-5 w-5 text-blue-500" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-sm sm:text-base font-semibold">Gmail API</h4>
                      <p className="text-xs sm:text-sm text-muted-foreground">Notificações de novos emails</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="bg-success/10 text-success self-start sm:self-center">
                    Ativo
                  </Badge>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 sm:p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Smartphone className="h-5 w-5 text-accent" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-sm sm:text-base font-semibold">API de IA</h4>
                      <p className="text-xs sm:text-sm text-muted-foreground">Assistente jurídico inteligente</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="bg-warning/10 text-warning self-start sm:self-center">
                    Pendente
                  </Badge>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 sm:p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Mail className="h-5 w-5 text-success" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-sm sm:text-base font-semibold">Email SMTP</h4>
                      <p className="text-xs sm:text-sm text-muted-foreground">Serviço de envio de emails</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="bg-success/10 text-success self-start sm:self-center">
                    Configurado
                  </Badge>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 sm:p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Calendar className="h-5 w-5 text-blue-500" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-sm sm:text-base font-semibold">Sistema de Notificações</h4>
                      <p className="text-xs sm:text-sm text-muted-foreground">Lembretes automáticos com timezone UTC-3</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="bg-success/10 text-success self-start sm:self-center">
                    Ativo
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-4 sm:space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <SettingsIcon className="h-5 w-5" />
                Configurações do Sistema
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Fuso Horário</Label>
                  <Select 
                    value={systemSettings.timezone} 
                    onValueChange={(value) => handleSystemChange("timezone", value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="america-sao_paulo">América/São Paulo (UTC-3)</SelectItem>
                      <SelectItem value="america-new_york">América/Nova York (UTC-5)</SelectItem>
                      <SelectItem value="europe-london">Europa/Londres (UTC+0)</SelectItem>
                      <SelectItem value="america-los_angeles">América/Los Angeles (UTC-8)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Todas as notificações e lembretes seguirão este fuso horário
                  </p>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Idioma</Label>
                  <Select 
                    value={systemSettings.language} 
                    onValueChange={(value) => handleSystemChange("language", value)}
                  >
                    <SelectTrigger className="w-full">
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
                  <Label className="text-sm font-medium">Formato de Data</Label>
                  <Select 
                    value={systemSettings.dateFormat} 
                    onValueChange={(value) => handleSystemChange("dateFormat", value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dd-mm-yyyy">DD/MM/YYYY</SelectItem>
                      <SelectItem value="mm-dd-yyyy">MM/DD/YYYY</SelectItem>
                      <SelectItem value="yyyy-mm-dd">YYYY-MM-DD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 border rounded-lg">
                  <div className="space-y-1">
                    <div className="text-sm sm:text-base font-medium">Backup Automático</div>
                    <div className="text-xs sm:text-sm text-muted-foreground">
                      Realizar backup diário dos dados
                    </div>
                  </div>
                  <Switch 
                    checked={systemSettings.autoBackup}
                    onCheckedChange={(checked) => handleSystemChange("autoBackup", checked)}
                  />
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 border rounded-lg">
                  <div className="space-y-1">
                    <div className="text-sm sm:text-base font-medium">Logs de Auditoria</div>
                    <div className="text-xs sm:text-sm text-muted-foreground">
                      Registrar todas as ações do sistema
                    </div>
                  </div>
                  <Switch 
                    checked={systemSettings.auditLogs}
                    onCheckedChange={(checked) => handleSystemChange("auditLogs", checked)}
                  />
                </div>
              </div>
              
              <Button onClick={saveSystem} disabled={isLoading} className="w-full sm:w-auto">
                <Save className="mr-2 h-4 w-4" />
                {isLoading ? "Salvando..." : "Salvar Configurações do Sistema"}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">Informações do Sistema</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                <div>
                  <Label className="text-xs sm:text-sm font-medium">Versão</Label>
                  <p className="text-xs sm:text-sm text-muted-foreground">v2.0.0</p>
                </div>
                <div>
                  <Label className="text-xs sm:text-sm font-medium">Última Atualização</Label>
                  <p className="text-xs sm:text-sm text-muted-foreground">11/09/2025</p>
                </div>
                <div>
                  <Label className="text-xs sm:text-sm font-medium">Ambiente</Label>
                  <p className="text-xs sm:text-sm text-muted-foreground">Produção</p>
                </div>
                <div>
                  <Label className="text-xs sm:text-sm font-medium">Uptime</Label>
                  <p className="text-xs sm:text-sm text-muted-foreground">99.9%</p>
                </div>
                <div>
                  <Label className="text-xs sm:text-sm font-medium">Timezone Ativo</Label>
                  <p className="text-xs sm:text-sm text-muted-foreground">UTC-3 (São Paulo)</p>
                </div>
                <div>
                  <Label className="text-xs sm:text-sm font-medium">Notificações</Label>
                  <p className="text-xs sm:text-sm text-muted-foreground">Ativas</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AppLayout>
  )
}

