import { supabase } from '@/integrations/supabase/client';

// Generic types for law firm entities since tables may not exist yet
export interface LawClient {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  document_number?: string;
  client_type: 'individual' | 'company';
  notes?: string;
  status: 'active' | 'inactive' | 'archived';
  created_at: string;
  updated_at: string;
}

export interface LawCase {
  id: string;
  client_id: string;
  case_number: string;
  title: string;
  description?: string;
  case_type: string;
  status: 'open' | 'in_progress' | 'closed' | 'archived';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  value?: number;
  start_date?: string;
  expected_end_date?: string;
  actual_end_date?: string;
  court?: string;
  judge?: string;
  opposing_party?: string;
  created_at: string;
  updated_at: string;
  law_clients?: Partial<LawClient>;
}

export interface LawDocument {
  id: string;
  name: string;
  description?: string;
  file_path: string;
  file_size: number;
  file_type: string;
  mime_type: string;
  encrypted: boolean;
  encryption_key?: string;
  case_id?: string;
  client_id?: string;
  document_type: string;
  status: 'draft' | 'review' | 'approved' | 'signed' | 'archived';
  version: number;
  tags?: string[];
  created_by?: string;
  created_at: string;
  updated_at: string;
  law_cases?: Partial<LawCase>;
  law_clients?: Partial<LawClient>;
}

export interface LawTask {
  id: string;
  title: string;
  description?: string;
  case_id?: string;
  client_id?: string;
  assigned_to?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  due_date?: string;
  completed_date?: string;
  category?: string;
  notes?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
  law_cases?: Partial<LawCase>;
  law_clients?: Partial<LawClient>;
}

export interface LawAppointment {
  id: string;
  title: string;
  description?: string;
  client_id?: string;
  case_id?: string;
  appointment_date: string;
  start_time: string;
  end_time: string;
  location?: string;
  appointment_type: string;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'rescheduled';
  notes?: string;
  reminder_sent: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
  law_cases?: Partial<LawCase>;
  law_clients?: Partial<LawClient>;
}

// Service class to handle database operations with fallback to mock data
export class LawFirmService {
  private static async checkTableExists(tableName: string): Promise<boolean> {
    try {
      // For now, always return false to use mock data
      // Once tables are created, this can be updated
      return false;
    } catch {
      return false;
    }
  }

  // Client methods
  static async getClients(): Promise<LawClient[]> {
    // For now, always use mock data until tables are created
    return this.getMockClients();
  }

  static async createClient(client: Omit<LawClient, 'id' | 'created_at' | 'updated_at'>): Promise<LawClient> {
    // Return mock client for now
    const mockClient: LawClient = {
      ...client,
      id: Math.random().toString(36).substring(2),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    return mockClient;
  }

  // Case methods
  static async getCases(): Promise<LawCase[]> {
    return this.getMockCases();
  }

  static async createCase(caseData: Omit<LawCase, 'id' | 'created_at' | 'updated_at'>): Promise<LawCase> {
    const mockCase: LawCase = {
      ...caseData,
      id: Math.random().toString(36).substring(2),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    return mockCase;
  }

  // Document methods
  static async getDocuments(): Promise<LawDocument[]> {
    return this.getMockDocuments();
  }

  // Task methods
  static async getTasks(): Promise<LawTask[]> {
    return this.getMockTasks();
  }

  // Appointment methods
  static async getAppointments(): Promise<LawAppointment[]> {
    return this.getMockAppointments();
  }

  // Mock data methods (fallback)
  private static getMockClients(): LawClient[] {
    return [
      {
        id: '1',
        name: 'João Silva',
        email: 'joao@email.com',
        phone: '(11) 99999-9999',
        document_number: '123.456.789-10',
        client_type: 'individual',
        status: 'active',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      },
      {
        id: '2',
        name: 'Empresa XYZ Ltda',
        email: 'contato@empresaxyz.com',
        phone: '(11) 3333-3333',
        document_number: '12.345.678/0001-90',
        client_type: 'company',
        status: 'active',
        created_at: '2024-01-02T00:00:00Z',
        updated_at: '2024-01-02T00:00:00Z'
      }
    ];
  }

  private static getMockCases(): LawCase[] {
    return [
      {
        id: '1',
        client_id: '1',
        case_number: '2024001',
        title: 'Ação de Cobrança',
        description: 'Cobrança de honorários advocatícios',
        case_type: 'civil',
        status: 'in_progress',
        priority: 'medium',
        value: 15000,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      }
    ];
  }

  private static getMockDocuments(): LawDocument[] {
    return [
      {
        id: '1',
        name: 'Contrato de Prestação de Serviços',
        file_path: '/mock/contract.pdf',
        file_size: 245760,
        file_type: 'pdf',
        mime_type: 'application/pdf',
        encrypted: true,
        document_type: 'contract',
        status: 'approved',
        version: 1,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      }
    ];
  }

  private static getMockTasks(): LawTask[] {
    return [
      {
        id: '1',
        title: 'Elaborar petição inicial',
        description: 'Preparar documentação para novo processo',
        priority: 'high',
        status: 'pending',
        due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      }
    ];
  }

  private static getMockAppointments(): LawAppointment[] {
    return [
      {
        id: '1',
        title: 'Consulta - João Silva',
        appointment_date: new Date().toISOString().split('T')[0],
        start_time: '14:00',
        end_time: '15:00',
        appointment_type: 'consultation',
        status: 'scheduled',
        reminder_sent: false,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      }
    ];
  }
}