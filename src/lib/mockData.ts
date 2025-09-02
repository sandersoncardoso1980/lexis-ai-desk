// Mock data for the legal SaaS system

export interface Client {
  id: string
  name: string
  email: string
  phone: string
  company?: string
  status: 'active' | 'inactive' | 'potential'
  createdAt: string
  avatar?: string
}

export interface Case {
  id: string
  title: string
  clientId: string
  clientName: string
  status: 'open' | 'pending' | 'closed' | 'reviewing'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  area: string
  description: string
  createdAt: string
  deadline?: string
  value?: number
}

export interface Document {
  id: string
  name: string
  type: string
  caseId?: string
  clientId?: string
  size: number
  createdAt: string
  encrypted: boolean
  status: 'draft' | 'review' | 'approved' | 'signed'
}

export interface Task {
  id: string
  title: string
  description: string
  status: 'pending' | 'in_progress' | 'completed'
  priority: 'low' | 'medium' | 'high'
  assignee: string
  dueDate: string
  caseId?: string
}

export interface Appointment {
  id: string
  title: string
  description: string
  date: string
  time: string
  clientId?: string
  type: 'consultation' | 'hearing' | 'meeting' | 'deadline'
  status: 'scheduled' | 'completed' | 'cancelled'
}

// Mock data
export const mockClients: Client[] = [
  {
    id: '1',
    name: 'Maria Silva',
    email: 'maria.silva@email.com',
    phone: '(11) 99999-9999',
    company: 'Silva Ltda',
    status: 'active',
    createdAt: '2024-01-15',
  },
  {
    id: '2',
    name: 'João Santos',
    email: 'joao.santos@email.com',
    phone: '(11) 88888-8888',
    status: 'active',
    createdAt: '2024-02-10',
  },
  {
    id: '3',
    name: 'Ana Costa',
    email: 'ana.costa@email.com',
    phone: '(11) 77777-7777',
    company: 'Costa Corp',
    status: 'potential',
    createdAt: '2024-02-20',
  },
]

export const mockCases: Case[] = [
  {
    id: '1',
    title: 'Revisão Contratual - Silva Ltda',
    clientId: '1',
    clientName: 'Maria Silva',
    status: 'open',
    priority: 'high',
    area: 'Direito Empresarial',
    description: 'Revisão completa dos contratos de fornecimento',
    createdAt: '2024-02-01',
    deadline: '2024-03-15',
    value: 15000,
  },
  {
    id: '2',
    title: 'Processo Trabalhista',
    clientId: '2',
    clientName: 'João Santos',
    status: 'pending',
    priority: 'medium',
    area: 'Direito Trabalhista',
    description: 'Ação contra demissão sem justa causa',
    createdAt: '2024-02-15',
    deadline: '2024-04-01',
    value: 8000,
  },
]

export const mockDocuments: Document[] = [
  {
    id: '1',
    name: 'Contrato de Prestação de Serviços.pdf',
    type: 'PDF',
    caseId: '1',
    clientId: '1',
    size: 2048000,
    createdAt: '2024-02-10',
    encrypted: true,
    status: 'review',
  },
  {
    id: '2',
    name: 'Petição Inicial.docx',
    type: 'DOCX',
    caseId: '2',
    clientId: '2',
    size: 1024000,
    createdAt: '2024-02-18',
    encrypted: true,
    status: 'draft',
  },
]

export const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Revisar documentos do caso Silva',
    description: 'Analisar os contratos enviados pelo cliente',
    status: 'in_progress',
    priority: 'high',
    assignee: 'Dr. Carlos',
    dueDate: '2024-02-25',
    caseId: '1',
  },
  {
    id: '2',
    title: 'Preparar petição inicial',
    description: 'Redigir petição para processo trabalhista',
    status: 'pending',
    priority: 'medium',
    assignee: 'Dra. Ana',
    dueDate: '2024-02-28',
    caseId: '2',
  },
]

export const mockAppointments: Appointment[] = [
  {
    id: '1',
    title: 'Reunião com Maria Silva',
    description: 'Discussão sobre revisão contratual',
    date: '2024-02-26',
    time: '14:00',
    clientId: '1',
    type: 'consultation',
    status: 'scheduled',
  },
  {
    id: '2',
    title: 'Audiência Trabalhista',
    description: 'Comparecimento em audiência',
    date: '2024-03-05',
    time: '09:00',
    clientId: '2',
    type: 'hearing',
    status: 'scheduled',
  },
]

// Utility functions for encryption simulation
export const encryptDocument = (content: string): string => {
  // Simulated encryption - in production, use proper encryption
  return btoa(content) // Simple base64 encoding for demo
}

export const decryptDocument = (encryptedContent: string): string => {
  // Simulated decryption - in production, use proper decryption
  return atob(encryptedContent) // Simple base64 decoding for demo
}