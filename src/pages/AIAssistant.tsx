import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Bot, Send, Mic, Paperclip, Sparkles, Clock, User, FileText, AlertCircle, Briefcase, Calendar, CheckSquare, Menu, X, Loader2, Download } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import { LawFirmService, type LawClient, type LawDocument, type LawCase, type LawTask, type LawAppointment } from "@/services/lawFirmService";
import { saveAs } from "file-saver";

// -----------------------------
// Tipagens
// -----------------------------
interface Message {
  id: string;
  content: string;
  sender: "user" | "ai";
  timestamp: string;
  suggestions?: string[];
  data?: any;
  document?: { name: string; content: string };
}

// -----------------------------
// Configuração Groq
// -----------------------------
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;

const callGroqAPI = async (messages: any[]): Promise<string> => {
  if (!GROQ_API_KEY) return "❌ API Key do Groq não configurada.";
  try {
    const res = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages,
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    const data = await res.json();
    return data.choices[0]?.message?.content || "❌ Resposta vazia.";
  } catch (err) {
    console.error(err);
    return "❌ Erro ao processar solicitação.";
  }
};

// -----------------------------
// Templates Jurídicos
// -----------------------------
const templates = {
  petition: (client: string, defendant: string, subject: string) =>
    `EXCELENTÍSSIMO SENHOR DOUTOR JUIZ DE DIREITO DA ___ VARA CÍVEL DA COMARCA DE ___

Processo nº: [AUTOMÁTICO]
Requerente: ${client}
Requerido: ${defendant}
Assunto: ${subject}

Vem respeitosamente à presença de Vossa Excelência requerer o que segue...`,

  proxy: (client: string, lawyer: string, oab: string) =>
    `PROCURAÇÃO AD JUDICIA

Outorgante: ${client}
Outorgado: ${lawyer}, OAB/${oab}

Poderes: propor ações, receber citações, transigir, desistir, recorrer...`,

  contract: (client: string, value: string) =>
    `CONTRATO DE PRESTAÇÃO DE SERVIÇOS JURÍDICOS

Parte contratante: ${client}
Honorários: R$ ${value}
Cláusulas: ...`,
};

// -----------------------------
// Funções de Geração
// -----------------------------
const generatePetition = async (prompt: string): Promise<{ content: string; document?: { name: string; content: string } }> => {
  const groqMessages = [
    {
      role: "system",
      content: `Você é um advogado experiente. Elabore uma petição inicial com base nas informações fornecidas. Use estrutura formal, com exposição de fatos, fundamento jurídico e pedido.`
    },
    { role: "user", content: prompt }
  ];
  const content = await callGroqAPI(groqMessages);
  const docName = `peticao_${Date.now()}.txt`;
  return { content, document: { name: docName, content } };
};

const generateContract = async (prompt: string): Promise<{ content: string; document?: { name: string; content: string } }> => {
  const groqMessages = [
    {
      role: "system",
      content: `Você é um advogado trabalhista. Elabore um contrato de honorários advocatícios com base nas informações fornecidas.`
    },
    { role: "user", content: prompt }
  ];
  const content = await callGroqAPI(groqMessages);
  const docName = `contrato_honorarios_${Date.now()}.txt`;
  return { content, document: { name: docName, content } };
};

const generateProxy = async (prompt: string): Promise<{ content: string; document?: { name: string; content: string } }> => {
  const groqMessages = [
    {
      role: "system",
      content: `Você é um advogado. Elabore uma procuração judicial com base nas informações fornecidas.`
    },
    { role: "user", content: prompt }
  ];
  const content = await callGroqAPI(groqMessages);
  const docName = `procuracao_${Date.now()}.txt`;
  return { content, document: { name: docName, content } };
};

const legalResearch = async (prompt: string): Promise<{ content: string }> => {
  const groqMessages = [
    {
      role: "system",
      content: `Você é um assistente jurídico. Responda com base em jurisprudência, artigos de lei, súmulas e precedentes. Use linguagem técnica e cite fontes.`
    },
    { role: "user", content: prompt }
  ];
  const content = await callGroqAPI(groqMessages);
  return { content };
};

// -----------------------------
// Detectar Intenções
// -----------------------------
const detectIntention = (message: string): { intention: string; query: string } => {
  const normalized = message.toLowerCase();

  // Geração de documentos primeiro (prioridade alta)
  if (/(gerar|criar|elaborar|fazer|gere).*(petição|peti..o|inicial|defesa|recurso)/i.test(normalized))
    return { intention: "generate_petition", query: message };

  if (/(gerar|criar|elaborar|fazer|gere).*(contrato|honorários|honorario)/i.test(normalized))
    return { intention: "generate_contract", query: message };

  if (/(gerar|criar|elaborar|fazer|gere).*(procura..o|procuracao)/i.test(normalized))
    return { intention: "generate_proxy", query: message };

  // Pesquisa jurídica
  if (/(pesquisar|buscar|jurisprudência|sumula|artigo|lei|tese|precedente)/i.test(normalized))
    return { intention: "legal_research", query: message };

  // Rotinas de agenda/tarefas
  if (/(tarefas|tasks).*(hoje|dia|today)/i.test(normalized))
    return { intention: "today_tasks", query: "" };

  if (/(agendamentos|compromissos).*(hoje|dia|today)/i.test(normalized))
    return { intention: "today_appointments", query: "" };

  if (/(tarefas|tasks).*(pendentes|pendente)/i.test(normalized))
    return { intention: "pending_tasks", query: "" };

  // Busca de cliente e documentos (só se não cair nos anteriores)
  if (/(cliente|clientes)/i.test(normalized))
    return { intention: "search_client", query: normalized.replace(/.*(cliente|clientes)/i, "").trim() };

  if (/(documento|documentos)/i.test(normalized))
    return { intention: "search_documents", query: normalized.replace(/.*(documento|documentos)/i, "").trim() };

  return { intention: "general_question", query: message };
};
const enrichWithContext = async (query: string): Promise<string> => {
  let enriched = query;
  const match = query.match(/cliente\s+([a-zÀ-ú]+)/i);

  if (match) {
    const clientName = match[1];
    const { data: client } = await supabase
      .from("law_clients")
      .select("*")
      .ilike("name", `%${clientName}%`)
      .single();

    if (client) {
      enriched += `\n\n📌 Dados do Cliente:\nNome: ${client.name}\nCPF/CNPJ: ${client.document_number}\nEmail: ${client.email}\nTelefone: ${client.phone}`;

      // Casos do cliente
      const { data: cases } = await supabase
        .from("law_cases")
        .select("*")
        .or(`client_id.eq.${client.id},involved_clients.cs.{${client.id}}`);

      if (cases?.length) {
        enriched += `\n\n📂 Casos relacionados:\n${cases
          .map((c: any) => `• ${c.title} (${c.status}) - Nº ${c.case_number}`)
          .join("\n")}`;
      }

      // Documentos do cliente
      const { data: docs } = await supabase
        .from("law_documents")
        .select("*")
        .or(`client_id.eq.${client.id},related_clients.cs.{${client.id}}`)
        .limit(5);

      if (docs?.length) {
        enriched += `\n\n📄 Documentos vinculados:\n${docs
          .map((d: any) => `• ${d.name} (${d.status})`)
          .join("\n")}`;
      }
    }
  }

  return enriched;
};

// -----------------------------
// Componente Principal
// -----------------------------
export default function AIAssistant() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: "👋 Olá! Sou o Spector, seu assistente jurídico inteligente. Posso ajudá-lo com:\n\n• 📄 **Gerar petições, contratos e procurações**\n• 🔍 **Pesquisar jurisprudência e artigos**\n• 📋 **Tarefas e compromissos de hoje**\n• 👥 **Buscar clientes e documentos**\n\nComo posso ajudá-lo hoje?",
      sender: "ai",
      timestamp: new Date().toISOString(),
      suggestions: [
        "Elaborar petição inicial",
        "Criar contrato de honorários",
        "Gerar procuração",
        "Pesquisar jurisprudência sobre honorários",
        "Minhas tarefas de hoje"
      ],
    },
  ]);

  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [supabaseStatus, setSupabaseStatus] = useState<"checking" | "connected" | "error">("checking");
  const [showSidebar, setShowSidebar] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const check = async () => {
      const { error } = await supabase.from("law_clients").select("id").limit(1);
      setSupabaseStatus(error ? "error" : "connected");
    };
    check();
  }, []);

  useEffect(() => {
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  }, [messages]);

  const handleSend = async () => {
    if (!inputMessage.trim() || isLoading) return;
    const userMsg: Message = { id: Date.now().toString(), content: inputMessage, sender: "user", timestamp: new Date().toISOString() };
    setMessages((prev) => [...prev, userMsg]);
    setInputMessage("");
    setIsLoading(true);

    const { intention, query } = detectIntention(inputMessage);
    let res: { content: string; data?: any; document?: { name: string; content: string } } = { content: "" };

    try {
      switch (intention) {
         case "generate_petition": {
    const enrichedQuery = await enrichWithContext(query);
    res = await generatePetition(enrichedQuery);
    break;
  }
  case "generate_contract": {
    const enrichedQuery = await enrichWithContext(query);
    res = await generateContract(enrichedQuery);
    break;
  }
  case "generate_proxy": {
    const enrichedQuery = await enrichWithContext(query);
    res = await generateProxy(enrichedQuery);
    break;
  }
  case "legal_research": {
    const enrichedQuery = await enrichWithContext(query);
    res = await legalResearch(enrichedQuery);
    break;
  }

        case "generate_petition":
          res = await generatePetition(query);
          break;
        case "generate_contract":
          res = await generateContract(query);
          break;
        case "generate_proxy":
          res = await generateProxy(query);
          break;
        case "legal_research":
          res = await legalResearch(query);
          break;
        case "today_tasks": {
          const today = new Date().toISOString().split("T")[0];
          const { data } = await supabase.from("law_tasks").select("*").eq("due_date", today);
          res.content = data?.length ? `📋 Tarefas de hoje:\n${data.map((t: any) => `• ${t.title} (${t.status})`).join("\n")}` : "🎉 Nenhuma tarefa para hoje!";
          break;
        }
        case "today_appointments": {
          const today = new Date().toISOString().split("T")[0];
          const { data } = await supabase.from("law_appointments").select("*").eq("appointment_date", today);
          res.content = data?.length ? `📅 Compromissos de hoje:\n${data.map((a: any) => `• ${a.title} às ${a.start_time}`).join("\n")}` : "📅 Nenhum compromisso hoje!";
          break;
        }
        case "pending_tasks": {
          const { data } = await supabase.from("law_tasks").select("*").eq("status", "pending");
          res.content = data?.length ? `⏳ Tarefas pendentes:\n${data.map((t: any) => `• ${t.title}`).join("\n")}` : "✅ Nenhuma tarefa pendente!";
          break;
        }
        case "search_client": {
          const { data } = await supabase.from("law_clients").select("*").ilike("name", `%${query}%`).limit(5);
          res.content = data?.length ? `👥 Clientes encontrados:\n${data.map((c: any) => `• ${c.name} (${c.email})\n (${c.phone})\n(${c.document_number})`).join("\n")}` : "❌ Nenhum cliente encontrado.";
          break;
        }
        case "search_documents": {
          const { data } = await supabase.from("law_documents").select("*").or(`name.ilike.%${query}%,description.ilike.%${query}%`).limit(5);
          res.content = data?.length ? `📄 Documentos encontrados:\n${data.map((d: any) => `• ${d.name} (${d.status})`).join("\n")}` : "❌ Nenhum documento encontrado.";
          break;
        }
        default:
          res.content = await callGroqAPI([{ role: "system", content: "Você é o Spector, assistente jurídico útil e formal." }, { role: "user", content: query }]);
      }

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        content: res.content,
        sender: "ai",
        timestamp: new Date().toISOString(),
        document: res.document,
        suggestions: [
          "Elaborar petição inicial",
          "Criar contrato de honorários",
          "Gerar procuração",
          "Pesquisar jurisprudência",
          "Minhas tarefas de hoje"
        ],
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [...prev, { id: (Date.now() + 1).toString(), content: "❌ Erro ao processar solicitação.", sender: "ai", timestamp: new Date().toISOString() }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputMessage(suggestion);
    setTimeout(() => handleSend(), 100);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const downloadDocument = (doc: { name: string; content: string }) => {
    const blob = new Blob([doc.content], { type: "text/plain;charset=utf-8" });
    saveAs(blob, doc.name);
  };

  return (
    <AppLayout 
    title="Spector IA"
    breadcrumbs={[{ label: "Dashboard", href: "/" }, { label: "Spector IA" }]}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
        <div className="flex items-center justify-between w-full">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Spector IA</h2>
            <p className="text-muted-foreground text-sm">Seu assistente jurídico inteligente</p>
          </div>
          <Button variant="outline" size="icon" className="sm:hidden h-9 w-9" onClick={() => setShowSidebar(!showSidebar)}>
            {showSidebar ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </div>
        <Badge variant="outline" className={supabaseStatus === "connected" ? "bg-green-100 text-green-800 border-green-200 hidden sm:flex" : "bg-red-100 text-red-800 border-red-200 hidden sm:flex"}>
          {supabaseStatus === "connected" ? <><Sparkles className="mr-1 h-3 w-3" />Conectado</> : <><AlertCircle className="mr-1 h-3 w-3" />Erro</>}
        </Badge>
      </div>

      <div className="flex flex-col lg:grid lg:grid-cols-4 gap-4 relative h-[calc(100vh-180px)] sm:h-[calc(100vh-200px)]">
        <div className="lg:col-span-3 flex flex-col h-full">
          <Card className="flex flex-col h-full">
            <CardHeader className="border-b p-3 sm:p-4">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg"><Bot className="h-5 w-5 text-primary" />Spector - Assistente Jurídico</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col p-0 h-full">
              <ScrollArea className="flex-1 p-3 sm:p-4">
                <div className="space-y-3">
                  {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                      <div className={`flex items-start space-x-2 max-w-[90%] sm:max-w-[75%] ${msg.sender === "user" ? "flex-row-reverse space-x-reverse" : ""}`}>
                        <Avatar className="h-8 w-8 flex-shrink-0">
                          {msg.sender === "ai" ? (
                            <AvatarFallback className="bg-primary text-primary-foreground"><Bot className="h-4 w-4" /></AvatarFallback>
                          ) : (
                            <AvatarFallback><User className="h-4 w-4" /></AvatarFallback>
                          )}
                        </Avatar>
                        <div className={`rounded-lg p-3 ${msg.sender === "user" ? "bg-primary text-primary-foreground" : "bg-secondary"}`}>
                          <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                          {msg.document && (
                            <Button size="sm" variant="outline" className="mt-2 text-xs" onClick={() => downloadDocument(msg.document!)}>
                              <Download className="h-3 w-3 mr-1" /> Baixar documento
                            </Button>
                          )}
                          <div className="flex items-center mt-1 opacity-70">
                            <Clock className="h-3 w-3 mr-1" />
                            <span className="text-xs">{new Date(msg.timestamp).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="flex items-start space-x-2">
                        <Avatar className="h-8 w-8"><AvatarFallback className="bg-primary text-primary-foreground"><Bot className="h-4 w-4" /></AvatarFallback></Avatar>
                        <div className="rounded-lg p-3 bg-secondary"><div className="flex gap-1"><div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div><div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div><div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div></div></div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>
              <div className="border-t p-3 bg-background">
                <div className="flex space-x-2">
                  <div className="flex-1 relative">
                    
                    <Input value={inputMessage} onChange={(e) => setInputMessage(e.target.value)} onKeyPress={handleKeyPress} placeholder="Digite sua pergunta..." className="pr-16" disabled={isLoading} />
                    <div className="absolute right-1 top-1 flex space-x-1">
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0"><Paperclip className="h-3 w-3" /></Button>
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0"><Mic className="h-3 w-3" /></Button>
                    </div>
                  </div>
                  <Button onClick={handleSend} size="sm" disabled={isLoading} className="h-10">{isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className={`lg:static fixed lg:z-0 z-20 inset-0 lg:inset-auto bg-background lg:bg-transparent transition-transform duration-300 ease-in-out ${showSidebar ? 'translate-x-0' : 'translate-x-full'} lg:translate-x-0 lg:block h-full`}>
          <div className="flex justify-between items-center lg:hidden p-4 border-b sticky top-0 bg-background">
            <h3 className="font-semibold">Menu</h3>
            <Button variant="ghost" size="icon" onClick={() => setShowSidebar(false)} className="h-9 w-9"><X className="h-4 w-4" /></Button>
          </div>
          <div className="p-4 lg:p-0 h-[calc(100%-64px)] lg:h-full overflow-y-auto">
            <div className="space-y-4">
              <Card>
                <CardHeader className="p-4 pb-2"><CardTitle className="text-base">Funcionalidades</CardTitle></CardHeader>
                <CardContent className="space-y-3 p-4 pt-0">
                  {[
                    { icon: <FileText className="h-4 w-4 text-primary" />, title: "Gerar Petições", desc: "Elabore peças jurídicas" },
                    { icon: <Briefcase className="h-4 w-4 text-primary" />, title: "Contratos", desc: "Honorários e parcerias" },
                    { icon: <User className="h-4 w-4 text-primary" />, title: "Procurações", desc: "Poderes e representação" },
                    { icon: <Bot className="h-4 w-4 text-primary" />, title: "Pesquisa Jurídica", desc: "Jurisprudência e artigos" },
                  ].map((item, idx) => (
                    <div key={idx} className="space-y-2 flex items-center gap-2">
                      {item.icon}
                      <div>
                        <h4 className="text-sm font-semibold">{item.title}</h4>
                        <p className="text-xs text-muted-foreground">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="p-4 pb-2"><CardTitle className="text-base">Sugestões Rápidas</CardTitle></CardHeader>
                <CardContent className="space-y-2 p-4 pt-0">
                  {[
                    "Elaborar petição inicial",
                    "Criar contrato de honorários",
                    "Gerar procuração",
                    "Pesquisar jurisprudência sobre honorários",
                    "Minhas tarefas de hoje"
                  ].map((s, i) => (
                    <Button key={i} variant="ghost" size="sm" className="w-full justify-start text-xs h-8" onClick={() => { handleSuggestionClick(s); setShowSidebar(false); }}>
                      {s}
                    </Button>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {showSidebar && <div className="fixed inset-0 bg-black/50 z-10 lg:hidden" onClick={() => setShowSidebar(false)} />}
      </div>
    </AppLayout>
  );
}