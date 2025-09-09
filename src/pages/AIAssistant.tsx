import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Bot, Send, Mic, Paperclip, Sparkles, Clock, User, FileText, AlertCircle, Briefcase, Calendar, CheckSquare, Menu, X } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";

// -----------------------------
// Tipagens (mantidas)
// -----------------------------
interface Client {
  id: string;
  user_id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  document_number?: string;
  client_type: "individual" | "company";
  notes?: string;
  status: "active" | "inactive" | "archived";
  created_at: string;
  updated_at: string;
}

interface Document {
  id: string;
  user_id: string;
  client_id?: string;
  case_id?: string;
  name: string;
  description?: string;
  file_path: string;
  file_size: number;
  file_type: string;
  mime_type: string;
  status: "draft" | "review" | "approved" | "signed" | "archived";
  tags?: string[];
  created_by?: string;
  created_at: string;
  updated_at: string;
  file_url?: string;
  document_type?: string;
  encrypted?: boolean;
}

interface Case {
  id: string;
  user_id: string;
  client_id: string;
  case_number: string;
  title: string;
  description?: string;
  case_type: string;
  status: "open" | "in_progress" | "closed" | "archived";
  priority: "low" | "medium" | "high" | "urgent";
  value?: number;
  start_date?: string;
  expected_end_date?: string;
  actual_end_date?: string;
  court?: string;
  judge?: string;
  opposing_party?: string;
  created_at: string;
  updated_at: string;
}

interface Task {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  case_id?: string;
  client_id?: string;
  assigned_to?: string;
  priority: "low" | "medium" | "high" | "urgent";
  status: "pending" | "in_progress" | "completed" | "cancelled";
  due_date?: string;
  completed_date?: string;
  category?: string;
  notes?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

interface Appointment {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  client_id?: string;
  case_id?: string;
  appointment_date: string;
  start_time: string;
  end_time: string;
  location?: string;
  appointment_type: string;
  status: "scheduled" | "confirmed" | "completed" | "cancelled" | "rescheduled";
  notes?: string;
  reminder_sent: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

interface Message {
  id: string;
  content: string;
  sender: "user" | "ai";
  timestamp: string;
  suggestions?: string[];
}

// -----------------------------
// Configuração Groq (mantida)
// -----------------------------
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;

const callGroqAPI = async (messages: any[]): Promise<string> => {
  if (!GROQ_API_KEY) {
    return "❌ API Key do Groq não configurada. Verifique a variável VITE_GROQ_API_KEY.";
  }

  try {
    const response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: messages,
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      throw new Error(`Erro na API Groq: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || "❌ Não foi possível obter uma resposta do assistente.";
  } catch (error) {
    console.error("Erro ao chamar API Groq:", error);
    return "❌ Ocorreu um erro ao processar sua solicitação. Tente novamente mais tarde.";
  }
};

const isSupabaseConfigured = () => !!supabase;

export default function AIAssistant() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: "Olá! Sou o Spector, seu assistente jurídico sênior de IA. Posso auxiliá-lo com informações detalhadas sobre **clientes**, **documentos**, **casos**, **tarefas** e **agendamentos**. Como posso ajudá-lo hoje?",
      sender: "ai",
      timestamp: new Date().toISOString(),
      suggestions: [
        "Informações sobre o cliente",
        "Buscar documento",
        "Listar tarefas pendentes",
        "Detalhes do caso"
      ],
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [supabaseStatus, setSupabaseStatus] = useState<"checking" | "connected" | "error">("checking");
  const [showSidebar, setShowSidebar] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const checkSupabase = async () => {
      if (!isSupabaseConfigured()) {
        setSupabaseStatus("error");
        return;
      }

      try {
        const { error } = await supabase.from("law_clients").select("id").limit(1);
        setSupabaseStatus(error ? "error" : "connected");
      } catch {
        setSupabaseStatus("error");
      }
    };
    checkSupabase();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    setTimeout(() => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
      }
    }, 100);
  };

  const searchClient = async (query: string): Promise<string> => {
    if (supabaseStatus !== "connected") return "❌ Conexão com o banco de dados indisponível no momento.";
    try {
      const { data, error } = await supabase.from("law_clients").select("*").ilike("name", `%${query}%`).limit(5);
      if (error) return `❌ Erro ao buscar cliente: ${error.message}`;
      if (!data || data.length === 0) return `❌ Nenhum cliente encontrado com o nome "${query}".`;
      
      const groqMessages = [{ role: "system", content: "Você é um assistente jurídico sênior chamado Spector. Formate as informações do cliente de forma clara, profissional e humanizada e formal. Forneça um resumo objetivo e relevante." }, { role: "user", content: `Formate estas informações do cliente de forma amigável: ${JSON.stringify(data)}` }];
      return await callGroqAPI(groqMessages);
    } catch (error) {
      console.error("Erro ao buscar cliente:", error);
      return "❌ Erro inesperado ao buscar informações do cliente.";
    }
  };

  const searchDocuments = async (query: string): Promise<string> => {
    if (supabaseStatus !== "connected") return "❌ Conexão com o banco de dados indisponível no momento.";
    try {
      const { data, error } = await supabase.from("law_documents").select("*").or(`name.ilike.%${query}%,description.ilike.%${query}%`).limit(5);
      if (error) return `❌ Erro ao buscar documentos: ${error.message}`;
      if (!data || data.length === 0) return `❌ Nenhum documento encontrado para "${query}".`;
      
      const groqMessages = [{ role: "system", content: "Você é um assistente jurídico sênior chamado Spector. Liste os documentos encontrados de forma organizada e amigável, usando emojis. Inclua informações relevantes como tipo e status." }, { role: "user", content: `Liste estes documentos de forma amigável: ${JSON.stringify(data)}. Foram encontrados ${data.length} documentos.` }];
      return await callGroqAPI(groqMessages);
    } catch (error) {
      console.error("Erro ao buscar documentos:", error);
      return "❌ Erro inesperado ao buscar documentos.";
    }
  };

  const searchTasks = async (query: string): Promise<string> => {
    if (supabaseStatus !== "connected") return "❌ Conexão com o banco de dados indisponível no momento.";
    try {
      const { data, error } = await supabase.from("law_tasks").select("*").or(`title.ilike.%${query}%,description.ilike.%${query}%`).limit(5);
      if (error) return `❌ Erro ao buscar tarefas: ${error.message}`;
      if (!data || data.length === 0) return `❌ Nenhuma tarefa encontrada para "${query}".`;
      
      const groqMessages = [{ role: "system", content: "Você é um assistente jurídico sênior. Liste as tarefas encontradas de forma clara e profissional. Mencione o status, a prioridade e a data de vencimento." }, { role: "user", content: `Liste e formate estas tarefas de forma profissional: ${JSON.stringify(data)}.` }];
      return await callGroqAPI(groqMessages);
    } catch (error) {
      console.error("Erro ao buscar tarefas:", error);
      return "❌ Erro inesperado ao buscar tarefas.";
    }
  };

  const searchCases = async (query: string): Promise<string> => {
    if (supabaseStatus !== "connected") return "❌ Conexão com o banco de dados indisponível no momento.";
    try {
      const { data, error } = await supabase.from("law_cases").select("*").or(`title.ilike.%${query}%,case_number.ilike.%${query}%`).limit(5);
      if (error) return `❌ Erro ao buscar casos: ${error.message}`;
      if (!data || data.length === 0) return `❌ Nenhum caso encontrado para "${query}".`;
      
      const groqMessages = [{ role: "system", content: "Você é um assistente jurídico sênior. Formate as informações do caso de forma detalhada e profissional, usando emojis para destacar pontos importantes. Mencione o número do caso, tipo, status e partes envolvidas." }, { role: "user", content: `Formate estas informações de caso: ${JSON.stringify(data)}.` }];
      return await callGroqAPI(groqMessages);
    } catch (error) {
      console.error("Erro ao buscar casos:", error);
      return "❌ Erro inesperado ao buscar informações do caso.";
    }
  };

  const searchAppointments = async (query: string): Promise<string> => {
    if (supabaseStatus !== "connected") return "❌ Conexão com o banco de dados indisponível no momento.";
    try {
      const { data, error } = await supabase.from("law_appointments").select("*").or(`title.ilike.%${query}%,description.ilike.%${query}%`).limit(5);
      if (error) return `❌ Erro ao buscar agendamentos: ${error.message}`;
      if (!data || data.length === 0) return `❌ Nenhum agendamento encontrado para "${query}".`;
      
      const groqMessages = [{ role: "system", content: "Você é um assistente jurídico sênior. Liste os agendamentos encontrados de forma organizada, destacando a data, horário, e status." }, { role: "user", content: `Liste e formate estes agendamentos: ${JSON.stringify(data)}.` }];
      return await callGroqAPI(groqMessages);
    } catch (error) {
      console.error("Erro ao buscar agendamentos:", error);
      return "❌ Erro inesperado ao buscar agendamentos.";
    }
  };

  const callSpectorAPI = async (userMessage: string): Promise<string> => {
    const lowerMessage = userMessage.toLowerCase();

    if (lowerMessage.includes("cliente") || lowerMessage.includes("client")) {
      const query = lowerMessage.replace(/.*(cliente|clients)/, "").trim();
      return await searchClient(query);
    }
    if (lowerMessage.includes("documento") || lowerMessage.includes("documentos") || lowerMessage.includes("doc")) {
      const query = lowerMessage.replace(/.*(documento|documentos|doc)/, "").trim();
      return await searchDocuments(query);
    }
    if (lowerMessage.includes("tarefa") || lowerMessage.includes("tarefas") || lowerMessage.includes("task")) {
      const query = lowerMessage.replace(/.*(tarefa|tarefas|task)/, "").trim();
      return await searchTasks(query);
    }
    if (lowerMessage.includes("caso") || lowerMessage.includes("casos")) {
      const query = lowerMessage.replace(/.*(caso|casos)/, "").trim();
      return await searchCases(query);
    }
    if (lowerMessage.includes("agendamento") || lowerMessage.includes("agenda") || lowerMessage.includes("compromisso")) {
      const query = lowerMessage.replace(/.*(agendamento|agenda|compromisso)/, "").trim();
      return await searchAppointments(query);
    }

    const groqMessages = [
      {
        role: "system",
        content: "Você é o Spector, um assistente jurídico de IA sênior. Responda de forma formal, profissional e útil. Seu objetivo é ajudar ao usuario con informações sobre clientes, documentos, casos, tarefas e agendamentos. Se não puder ajudar, explique educadamente e sugira as funcionalidades disponíveis."
      },
      {
        role: "user",
        content: userMessage
      }
    ];

    return await callGroqAPI(groqMessages);
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      sender: "user",
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, newMessage]);
    setInputMessage("");
    setIsLoading(true);

    try {
      const response = await callSpectorAPI(inputMessage);

      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: response,
        sender: "ai",
        timestamp: new Date().toISOString(),
        suggestions: [
          "Buscar outro cliente",
          "Detalhes de um caso",
          "Próximos agendamentos",
          "Tarefas pendentes",
          "Listar todos os documentos"
        ],
      };

      setMessages((prev) => [...prev, aiResponse]);
    } catch (error) {
      console.error("Erro:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "❌ Ocorreu um erro ao processar sua solicitação. Por favor, tente novamente.",
        sender: "ai",
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputMessage(suggestion);
    setTimeout(() => handleSendMessage(), 100);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <AppLayout
      breadcrumbs={[
        { label: "Dashboard", href: "/" },
        { label: "Spector IA" }
      ]}
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
        <div className="flex items-center justify-between w-full">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Spector IA</h2>
            <p className="text-muted-foreground text-sm">Seu assistente jurídico inteligente</p>
          </div>
          <Button 
            variant="outline" 
            size="icon" 
            className="sm:hidden h-9 w-9"
            onClick={() => setShowSidebar(!showSidebar)}
          >
            {showSidebar ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </div>
        <Badge variant="outline" className={
          supabaseStatus === "connected"
            ? "bg-green-100 text-green-800 border-green-200 hidden sm:flex"
            : supabaseStatus === "error"
            ? "bg-red-100 text-red-800 border-red-200 hidden sm:flex"
            : "bg-yellow-100 text-yellow-800 border-yellow-200 hidden sm:flex"
        }>
          {supabaseStatus === "connected" ? (
            <>
              <Sparkles className="mr-1 h-3 w-3" />
              Conectado
            </>
          ) : supabaseStatus === "error" ? (
            <>
              <AlertCircle className="mr-1 h-3 w-3" />
              Erro de Conexão
            </>
          ) : (
            "Conectando..."
          )}
        </Badge>
      </div>

      <div className="flex flex-col lg:grid lg:grid-cols-4 gap-4 relative h-[calc(100vh-180px)] sm:h-[calc(100vh-200px)]">
        {/* Área principal do chat */}
        <div className="lg:col-span-3 flex flex-col h-full">
          <Card className="flex flex-col h-full">
            <CardHeader className="border-b p-3 sm:p-4">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Bot className="h-5 w-5 text-primary" />
                Spector - Assistente Jurídico
              </CardTitle>
            </CardHeader>

            <CardContent className="flex-1 flex flex-col p-0 h-full">
              {/* Área de mensagens com rolagem */}
              <div className="flex-1 overflow-hidden">
                <div 
                  ref={chatContainerRef}
                  className="h-full overflow-y-auto p-3 sm:p-4"
                  style={{ maxHeight: 'calc(100% - 80px)' }}
                >
                  <div className="space-y-3">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`flex items-start space-x-2 max-w-[90%] sm:max-w-[75%] ${
                            message.sender === "user" ? "flex-row-reverse space-x-reverse" : ""
                          }`}
                        >
                          <Avatar className="h-8 w-8 flex-shrink-0">
                            {message.sender === "ai" ? (
                              <AvatarFallback className="bg-primary text-primary-foreground">
                                <Bot className="h-4 w-4" />
                              </AvatarFallback>
                            ) : (
                              <AvatarFallback>
                                <User className="h-4 w-4" />
                              </AvatarFallback>
                            )}
                          </Avatar>

                          <div
                            className={`rounded-lg p-3 ${
                              message.sender === "user"
                                ? "bg-primary text-primary-foreground"
                                : "bg-secondary"
                            }`}
                          >
                            <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                            <div className="flex items-center mt-1 opacity-70">
                              <Clock className="h-3 w-3 mr-1" />
                              <span className="text-xs">
                                {new Date(message.timestamp).toLocaleTimeString("pt-BR", {
                                  hour: "2-digit",
                                  minute: "2-digit"
                                })}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}

                    {isLoading && (
                      <div className="flex justify-start">
                        <div className="flex items-start space-x-2">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-primary text-primary-foreground">
                              <Bot className="h-4 w-4" />
                            </AvatarFallback>
                          </Avatar>
                          <div className="rounded-lg p-3 bg-secondary">
                            <div className="flex gap-1">
                              <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                              <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                              <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {messages.length > 0 &&
                      messages[messages.length - 1].sender === "ai" &&
                      messages[messages.length - 1].suggestions && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {messages[messages.length - 1].suggestions!.map((suggestion, index) => (
                            <Button
                              key={index}
                              variant="outline"
                              size="sm"
                              onClick={() => handleSuggestionClick(suggestion)}
                              className="text-xs"
                            >
                              {suggestion}
                            </Button>
                          ))}
                        </div>
                      )}
                    <div ref={messagesEndRef} />
                  </div>
                </div>
              </div>

              {/* Área de input fixa na parte inferior */}
              <div className="border-t p-3 bg-background">
                <div className="flex space-x-2">
                  <div className="flex-1 relative">
                    <Input
                      ref={inputRef}
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Digite sua pergunta..."
                      className="pr-16"
                      disabled={isLoading}
                    />
                    <div className="absolute right-1 top-1 flex space-x-1">
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                        <Paperclip className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                        <Mic className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <Button onClick={handleSendMessage} size="sm" disabled={isLoading} className="h-10">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar para desktop e mobile com toggle */}
        <div className={`lg:static fixed lg:z-0 z-20 inset-0 lg:inset-auto bg-background lg:bg-transparent transition-transform duration-300 ease-in-out ${showSidebar ? 'translate-x-0' : 'translate-x-full'} lg:translate-x-0 lg:block h-full`}>
          <div className="flex justify-between items-center lg:hidden p-4 border-b sticky top-0 bg-background">
            <h3 className="font-semibold">Menu</h3>
            <Button variant="ghost" size="icon" onClick={() => setShowSidebar(false)} className="h-9 w-9">
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="p-4 lg:p-0 h-[calc(100%-64px)] lg:h-full overflow-y-auto">
            <div className="space-y-4">
              <Card>
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-base">Funcionalidades</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 p-4 pt-0">
                  <div className="space-y-2 flex items-center gap-2">
                    <User className="h-4 w-4 text-primary" />
                    <div>
                      <h4 className="text-sm font-semibold">Consulta de Clientes</h4>
                      <p className="text-xs text-muted-foreground">Busque informações completas</p>
                    </div>
                  </div>
                  <div className="space-y-2 flex items-center gap-2">
                    <FileText className="h-4 w-4 text-primary" />
                    <div>
                      <h4 className="text-sm font-semibold">Gestão de Documentos</h4>
                      <p className="text-xs text-muted-foreground">Encontre e acesse documentos</p>
                    </div>
                  </div>
                  <div className="space-y-2 flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-primary" />
                    <div>
                      <h4 className="text-sm font-semibold">Pesquisa de Casos</h4>
                      <p className="text-xs text-muted-foreground">Detalhes de processos e casos</p>
                    </div>
                  </div>
                  <div className="space-y-2 flex items-center gap-2">
                    <CheckSquare className="h-4 w-4 text-primary" />
                    <div>
                      <h4 className="text-sm font-semibold">Gestão de Tarefas</h4>
                      <p className="text-xs text-muted-foreground">Status e prazos de atividades</p>
                    </div>
                  </div>
                  <div className="space-y-2 flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    <div>
                      <h4 className="text-sm font-semibold">Informações de Agenda</h4>
                      <p className="text-xs text-muted-foreground">Agendamentos e compromissos</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-base">Sugestões Rápidas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 p-4 pt-0">
                  {[
                    "Informações sobre o cliente Miguel Braga",
                    "Buscar documento Guia Projeto de Saúde",
                    "Listar tarefas pendentes",
                    "Detalhes do caso 'Processo 123/2024'",
                    "Próximos agendamentos"
                  ].map((suggestion, index) => (
                    <Button
                      key={index}
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start text-xs h-8"
                      onClick={() => {
                        handleSuggestionClick(suggestion);
                        setShowSidebar(false);
                      }}
                    >
                      {suggestion}
                    </Button>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-base">Status do Sistema</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 p-4 pt-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">API Status</span>
                    <Badge variant="outline" className={GROQ_API_KEY ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                      {GROQ_API_KEY ? "Online" : "Offline"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Supabase</span>
                    <Badge variant="outline" className={
                      supabaseStatus === "connected"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }>
                      {supabaseStatus === "connected" ? "Conectado" : "Erro"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Clientes</span>
                    <Badge variant="outline" className="bg-green-100 text-green-800">Ativo</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Documentos</span>
                    <Badge variant="outline" className="bg-green-100 text-green-800">Disponível</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Overlay para mobile quando sidebar está aberta */}
        {showSidebar && (
          <div 
            className="fixed inset-0 bg-black/50 z-10 lg:hidden"
            onClick={() => setShowSidebar(false)}
          />
        )}
      </div>
    </AppLayout>
  );
}