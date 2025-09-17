import React, { useState, useRef } from "react";
import { LawFirmService } from "@/services/lawFirmService";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type Message = { role: "user" | "assistant"; content: string };

export default function ChatWithAI() {
  const [messages, setMessages] = useState<Message[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);

  // ==== Função para chamar Groq ====
  async function askGroq(conversation: Message[]) {
    try {
      const response = await fetch("/api/groq", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
            body: JSON.stringify({
  model: "mixtral-8x7b-32768", // pode trocar pelo modelo que preferir
  messages: [
    {
      role: "system",
      content: `
Você é um assistente jurídico virtual que atua como um secretário/estagiário
para advogados. Seu foco é:

- Responder de forma formal, clara e organizada.
- Apoiar em consultas sobre a Constituição Federal de 1988 (CF/88).
- Apoiar em consultas a clientes, casos, compromissos e tarefas (dados do Supabase).
- Ser objetivo: entregar respostas úteis, sem enrolação.
- Quando não tiver certeza, peça esclarecimentos.
- Sempre mantenha tom profissional e educado.
      `.trim(),
    },
    ...messages.map((m: any) => ({
      role: m.role,
      content: m.content,
    })),
  ],
  temperature: 0.6, // mais objetivo
  max_tokens: 600,
}),

            
            
            messages: conversation }),
      });

      if (!response.ok) throw new Error("Erro na API Groq");
      const data = await response.json();
      return data.reply as string;
    } catch (err) {
      console.error("Erro Groq:", err);
      return "⚠️ Não consegui processar com a Groq. Tente novamente.";
    }
  }

  // ==== Processa mensagens ====
  const handleSend = async () => {
    if (!inputRef.current?.value) return;
    const userMessage = inputRef.current.value.trim();
    if (!userMessage) return;

    // adiciona mensagem do usuário
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    inputRef.current.value = "";
    setLoading(true);

    let response = "Ainda não entendi sua solicitação. Pode reformular?";
    const lower = userMessage.toLowerCase();

    try {
      // === Roteamento Banco de Dados ===
      if (lower.includes("clientes")) {
        const clients = await LawFirmService.getClients();
        if (clients.length === 0) {
          response = "Não encontrei nenhum cliente cadastrado.";
        } else {
          const exemplo = clients[0];
          response = `Você possui ${clients.length} clientes. Exemplo: ${exemplo.name} (${exemplo.email || "sem email"})`;
        }
      }

      else if (lower.includes("tarefas de hoje")) {
        const tasks = await LawFirmService.getTodaysTasks();
        response = tasks.length
          ? `Você tem ${tasks.length} tarefas hoje. Exemplo: ${tasks[0].title} (prazo: ${tasks[0].due_date})`
          : "Você não possui tarefas para hoje.";
      }

      else if (lower.includes("compromissos") || lower.includes("agendamentos")) {
        const appointments = await LawFirmService.getTodaysAppointments();
        response = appointments.length
          ? `Você tem ${appointments.length} compromissos hoje. Exemplo: ${appointments[0].title || "Sem título"} com ${appointments[0].client?.name || "cliente não informado"}`
          : "Não há compromissos para hoje.";
      }

      else if (lower.includes("casos ativos") || lower.includes("processos em aberto")) {
        const cases = await LawFirmService.getActiveCases();
        response = cases.length
          ? `Você possui ${cases.length} casos ativos. Exemplo: ${cases[0].title} (${cases[0].case_number || "sem número"})`
          : "Nenhum caso ativo encontrado.";
      }

      else if (lower.includes("constituição") || lower.includes("artigo")) {
        response = "📖 Constituição Federal de 1988 — Art. 5º: 'Todos são iguais perante a lei, sem distinção de qualquer natureza...'";
      }

      else {
        // === fallback: Groq ===
        response = await askGroq([...messages, { role: "user", content: userMessage }]);
      }
    } catch (err) {
      console.error("Erro processando mensagem:", err);
      response = "⚠️ Ocorreu um erro ao consultar dados.";
    }

    // adiciona resposta
    setMessages((prev) => [...prev, { role: "assistant", content: response }]);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-subtle p-8">
      <Card className="max-w-3xl mx-auto p-6 space-y-4">
        {/* Histórico */}
        <div className="space-y-2 h-[500px] overflow-y-auto">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`p-2 rounded-md ${
                msg.role === "user"
                  ? "bg-blue-100 text-right"
                  : "bg-gray-100 text-left"
              }`}
            >
              <strong>{msg.role === "user" ? "Você" : "Assistente"}:</strong>{" "}
              {msg.content}
            </div>
          ))}
          {loading && (
            <div className="p-2 rounded-md bg-gray-200 text-left">
              <strong>Assistente:</strong> digitando...
            </div>
          )}
        </div>

        {/* Input */}
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            placeholder="Digite sua pergunta (ex: 'Quais são meus casos ativos?')..."
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            disabled={loading}
          />
          <Button onClick={handleSend} disabled={loading}>
            Enviar
          </Button>
        </div>
      </Card>
    </div>
  );
}
