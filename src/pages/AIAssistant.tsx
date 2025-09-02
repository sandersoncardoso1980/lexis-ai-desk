import { AppLayout } from "@/components/layout/AppLayout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Bot, Send, Mic, Paperclip, Sparkles, Clock, User } from "lucide-react"
import { useState } from "react"

interface Message {
  id: string
  content: string
  sender: 'user' | 'ai'
  timestamp: string
  suggestions?: string[]
}

export default function AIAssistant() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'Olá! Sou seu assistente jurídico de IA. Posso ajudá-lo com análise de documentos, pesquisa jurídica, redação de petições e muito mais. Como posso auxiliá-lo hoje?',
      sender: 'ai',
      timestamp: new Date().toISOString(),
      suggestions: [
        'Analisar um contrato',
        'Redigir uma petição inicial',
        'Pesquisar jurisprudência',
        'Revisar documento legal'
      ]
    }
  ])
  const [inputMessage, setInputMessage] = useState('')

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return

    const newMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      sender: 'user',
      timestamp: new Date().toISOString()
    }

    setMessages(prev => [...prev, newMessage])
    setInputMessage('')

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: 'Entendi sua solicitação. Analisando as informações disponíveis... Como assistente jurídico, posso ajudá-lo com análise detalhada. Gostaria que eu proceda com uma análise específica?',
        sender: 'ai',
        timestamp: new Date().toISOString(),
        suggestions: [
          'Sim, faça uma análise completa',
          'Preciso de mais informações',
          'Sugira próximos passos'
        ]
      }
      setMessages(prev => [...prev, aiResponse])
    }, 1000)
  }

  const handleSuggestionClick = (suggestion: string) => {
    setInputMessage(suggestion)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <AppLayout breadcrumbs={[
      { label: "Dashboard", href: "/" },
      { label: "Agente IA" }
    ]}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Agente de IA</h2>
          <p className="text-muted-foreground">Seu assistente jurídico inteligente</p>
        </div>
        <Badge variant="outline" className="bg-gradient-primary text-primary-foreground">
          <Sparkles className="mr-1 h-3 w-3" />
          IA Ativa
        </Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        <div className="lg:col-span-3">
          <Card className="h-[600px] flex flex-col">
            <CardHeader className="border-b">
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-primary" />
                Chat com Assistente Jurídico
              </CardTitle>
            </CardHeader>
            
            <CardContent className="flex-1 flex flex-col p-0">
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`flex items-start space-x-2 max-w-[80%] ${message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                        <Avatar className="h-8 w-8">
                          {message.sender === 'ai' ? (
                            <AvatarFallback className="bg-primary text-primary-foreground">
                              <Bot className="h-4 w-4" />
                            </AvatarFallback>
                          ) : (
                            <AvatarFallback>
                              <User className="h-4 w-4" />
                            </AvatarFallback>
                          )}
                        </Avatar>
                        
                        <div className={`rounded-lg p-3 ${
                          message.sender === 'user' 
                            ? 'bg-primary text-primary-foreground' 
                            : 'bg-secondary'
                        }`}>
                          <p className="text-sm">{message.content}</p>
                          <div className="flex items-center mt-1 opacity-70">
                            <Clock className="h-3 w-3 mr-1" />
                            <span className="text-xs">
                              {new Date(message.timestamp).toLocaleTimeString('pt-BR', { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {/* Show suggestions after AI messages */}
                  {messages.length > 0 && messages[messages.length - 1].sender === 'ai' && 
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
                </div>
              </ScrollArea>
              
              <div className="border-t p-4">
                <div className="flex space-x-2">
                  <div className="flex-1 relative">
                    <Input
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Digite sua pergunta ou solicitação..."
                      className="pr-20"
                    />
                    <div className="absolute right-1 top-1 flex space-x-1">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Paperclip className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Mic className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <Button onClick={handleSendMessage} size="sm">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Funcionalidades IA</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <h4 className="text-sm font-semibold">Análise de Documentos</h4>
                <p className="text-xs text-muted-foreground">Análise automática de contratos e petições</p>
              </div>
              <div className="space-y-2">
                <h4 className="text-sm font-semibold">Pesquisa Jurídica</h4>
                <p className="text-xs text-muted-foreground">Busca inteligente em jurisprudência</p>
              </div>
              <div className="space-y-2">
                <h4 className="text-sm font-semibold">Redação Assistida</h4>
                <p className="text-xs text-muted-foreground">Auxílio na criação de documentos</p>
              </div>
              <div className="space-y-2">
                <h4 className="text-sm font-semibold">Compliance</h4>
                <p className="text-xs text-muted-foreground">Verificação de conformidade legal</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Sugestões Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {[
                'Analisar novo contrato',
                'Gerar minuta de petição',
                'Verificar prazos processuais',
                'Pesquisar precedentes',
                'Revisar documento legal'
              ].map((suggestion, index) => (
                <Button 
                  key={index}
                  variant="ghost" 
                  size="sm" 
                  className="w-full justify-start text-xs"
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  {suggestion}
                </Button>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Status do Sistema</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">API Status</span>
                <Badge variant="outline" className="bg-success/10 text-success">Online</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Modelo IA</span>
                <Badge variant="outline">GPT-4</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Segurança</span>
                <Badge variant="outline" className="bg-success/10 text-success">Ativa</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  )
}