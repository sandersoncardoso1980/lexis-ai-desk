import { supabase } from '@/integrations/supabase/client'
import type { Database } from '@/integrations/supabase/types'
import * as pdfjs from 'pdfjs-dist';

// Adicione esta linha de configuração
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;


// Types using database schema
export type LawClient = Database['public']['Tables']['law_clients']['Row']
export type LawCase = Database['public']['Tables']['law_cases']['Row']
export type LawDocument = Database['public']['Tables']['law_documents']['Row']
export type LawTask = Database['public']['Tables']['law_tasks']['Row']
export type LawAppointment = Database['public']['Tables']['law_appointments']['Row'] & {
  client?: LawClient | null
  case?: LawCase | null
}
export type Profile = Database['public']['Tables']['profiles']['Row']

// Auxiliar type for creating new cases
export type NewLawCase = Omit<
  LawCase,
  'id' | 'created_at' | 'updated_at' | 'user_id' | 'actual_end_date'
> & {
  actual_end_date?: string | null
}

// Interface para metadados de criptografia
export interface EncryptionMetadata {
  iv: string;
  salt: string;
  algorithm: string;
  keyDerivation: string;
}

export class LawFirmService {
  // --- Clients ---
  static async getClients(): Promise<LawClient[]> {
    const { data, error } = await supabase
      .from('law_clients')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  }

  static async getClient(id: string): Promise<LawClient> {
    const { data, error } = await supabase
      .from('law_clients')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  }
static async createAppointment(appointmentData: Omit<LawAppointment, 'id' | 'created_at' | 'updated_at' | 'user_id'>): Promise<LawAppointment> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const cleanedData = {
    ...appointmentData,
    client_id: appointmentData.client_id === "" ? null : appointmentData.client_id,
    case_id: appointmentData.case_id === "" ? null : appointmentData.case_id,
    user_id: user.id
  };

  const { data, error } = await supabase
    .from('law_appointments')
    .insert(cleanedData)
    .select()
    .single();

  if (error) {
    console.error("Supabase error during createAppointment:", error);
    throw error;
  }
  return data;
}



  static async getProfile(userId: string): Promise<any> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error) throw error;
    return data;
  }

  static async createProfile(profileData: any): Promise<any> {
    const { data, error } = await supabase
      .from('profiles')
      .insert([profileData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async updateProfile(profileId: string, profileData: any): Promise<any> {
    const { data, error } = await supabase
      .from('profiles')
      .update(profileData)
      .eq('id', profileId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async createClient(clientData: Omit<LawClient, 'id' | 'created_at' | 'updated_at' | 'user_id'>): Promise<LawClient> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const { data, error } = await supabase
      .from('law_clients')
      .insert({ ...clientData, user_id: user.id })
      .select()
      .single()

    if (error) throw error
    return data
  }

static async updateClient(id: string, updates: Partial<LawClient>): Promise<LawClient> {
  const cleanedUpdates: any = {}

  // só inclui se o valor não for string vazia e não for undefined
  Object.entries(updates).forEach(([key, value]) => {
    if (value !== "" && value !== undefined) {
      cleanedUpdates[key] = value
    }
  })

  // força updated_at
  cleanedUpdates.updated_at = new Date().toISOString()

  const { data, error } = await supabase
    .from('law_clients')
    .update(cleanedUpdates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}


  static async deleteClient(id: string): Promise<void> {
    const { error } = await supabase
      .from('law_clients')
      .delete()
      .eq('id', id)
    if (error) throw error
  }
  static async getCasesByClient(clientId: string): Promise<LawCase[]> {
  const { data, error } = await supabase
    .from('law_cases')
    .select('*')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}




  // --- Cases ---
  static async getCases(): Promise<LawCase[]> {
    const { data, error } = await supabase
      .from('law_cases')
      .select(`
        *,
        client:law_clients (
          id, name, client_type, document_number, email, phone
        )
      `)
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data as LawCase[]) || []
  }

  static async getCase(id: string): Promise<LawCase> {
    const { data, error } = await supabase
      .from('law_cases')
      .select(`
        *,
        client:law_clients (
          id, name, client_type, document_number, email, phone
        )
      `)
      .eq('id', id)
      .single()

    if (error) throw error
    return data as LawCase
  }

  static async createCase(caseData: NewLawCase): Promise<LawCase> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const { data, error } = await supabase
      .from('law_cases')
      .insert({ ...caseData, user_id: user.id })
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async updateCase(id: string, updates: Partial<LawCase>): Promise<LawCase> {
    const { data, error } = await supabase
      .from('law_cases')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async deleteCase(id: string): Promise<void> {
    const { error } = await supabase
      .from('law_cases')
      .delete()
      .eq('id', id)
    if (error) throw error
  }

  // --- Documents ---
  static async getDocuments(): Promise<LawDocument[]> {
    const { data, error } = await supabase
      .from('law_documents')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  }

  static async createDocument(documentData: Omit<LawDocument, 'id' | 'created_at' | 'updated_at' | 'user_id'>): Promise<LawDocument> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const { data, error } = await supabase
      .from('law_documents')
      .insert({ ...documentData, user_id: user.id })
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async updateDocument(id: string, updates: Partial<LawDocument>): Promise<LawDocument> {
    const { data, error } = await supabase
      .from('law_documents')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async deleteDocument(id: string): Promise<void> {
    const { error } = await supabase
      .from('law_documents')
      .delete()
      .eq('id', id)
    if (error) throw error
  }

  // --- Tasks ---
  static async getTasks(): Promise<LawTask[]> {
    const { data, error } = await supabase
      .from('law_tasks')
      .select('*')
      .order('due_date', { ascending: true })

    if (error) throw error
    return data || []
  }

  static async getTask(id: string): Promise<LawTask> {
    const { data, error } = await supabase
      .from('law_tasks')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  }

  static async createTask(taskData: Omit<LawTask, 'id' | 'created_at' | 'updated_at' | 'user_id'>): Promise<LawTask> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const { data, error } = await supabase
      .from('law_tasks')
      .insert({ ...taskData, user_id: user.id })
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async updateTask(id: string, updates: Partial<LawTask>): Promise<LawTask> {
    const cleanedUpdates: Partial<LawTask> = { ...updates };
    
    const uuidFields = ['assigned_to', 'case_id', 'client_id'] as const;
    
    uuidFields.forEach(field => {
      if (field in cleanedUpdates && cleanedUpdates[field] === '') {
        cleanedUpdates[field] = null;
      }
    });

    cleanedUpdates.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('law_tasks')
      .update(cleanedUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async deleteTask(id: string): Promise<void> {
    const { error } = await supabase
      .from('law_tasks')
      .delete()
      .eq('id', id)
    if (error) throw error
  }

  // --- Appointments ---
  static async getAppointments(): Promise<LawAppointment[]> {
    const { data, error } = await supabase
      .from('law_appointments')
      .select(`
        *,
        client:law_clients (
          id, name, email, phone
        ),
        case:law_cases (
          id, title, case_number, status
        )
      `)
      .order('appointment_date', { ascending: true })
      .order('start_time', { ascending: true })

    if (error) throw error
    return data as LawAppointment[] || []
  }

  static async getAppointment(id: string): Promise<LawAppointment> {
    const { data, error } = await supabase
      .from('law_appointments')
      .select(`
        *,
        client:law_clients (
          id, name, email, phone
        ),
        case:law_cases (
          id, title, case_number, status
        )
      `)
      .eq('id', id)
      .single()

    if (error) throw error
    return data as LawAppointment
  }

  // --- Profiles (USERS) ---
  static async getProfiles(): Promise<Profile[]> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('full_name', { ascending: true });

    if (error) throw error;
    return data;
  }

  // --- Dashboard helpers ---
  static async getTotalClientsCount(): Promise<number> {
    const { count, error } = await supabase
      .from('law_clients')
      .select('*', { count: 'exact', head: true })
    if (error) throw error
    return count || 0
  }

  static async getActiveCasesCount(): Promise<number> {
    const { count, error } = await supabase
      .from('law_cases')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'open')
    if (error) throw error
    return count || 0
  }

  static async getPendingTasksCount(): Promise<number> {
    const { count, error } = await supabase
      .from('law_tasks')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending')
    if (error) throw error
    return count || 0
  }

  static async getRecentCases(): Promise<LawCase[]> {
    const { data, error } = await supabase
      .from('law_cases')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(3)
    if (error) throw error
    return data || []
  }

  static async getRecentTasks(): Promise<LawTask[]> {
    const { data, error } = await supabase
      .from('law_tasks')
      .select('*')
      .eq('priority', 'high')
      .eq('status', 'pending')
      .order('due_date', { ascending: true })
      .limit(3)
    if (error) throw error
    return data || []
  }

  // --- Appointments helpers ---
  static async getAppointmentsByDateRange(startDate: string, endDate: string): Promise<LawAppointment[]> {
    const { data, error } = await supabase
      .from('law_appointments')
      .select(`
        *,
        client:law_clients (
          id, name, email, phone
        ),
        case:law_cases (
          id, title, case_number, status
        )
      `)
      .gte('appointment_date', startDate)
      .lte('appointment_date', endDate)
      .order('appointment_date', { ascending: true })
      .order('start_time', { ascending: true })

    if (error) throw error
    return (data as LawAppointment[]) || []
  }

  static async getUpcomingAppointments(limit: number = 5): Promise<LawAppointment[]> {
    const today = new Date().toISOString().split('T')[0]

    const { data, error } = await supabase
      .from('law_appointments')
      .select(`
        *,
        client:law_clients (
          id, name, email, phone
        ),
        case:law_cases (
          id, title, case_number, status
        )
      `)
      .gt('appointment_date', today)
      .order('appointment_date', { ascending: true })
      .order('start_time', { ascending: true })
      .limit(limit)

    if (error) throw error
    return (data as LawAppointment[]) || []
  }

  // --- NOVAS FUNÇÕES PARA O ASSISTENTE INTELIGENTE ---
  
  static async searchTasksByDate(date: string): Promise<LawTask[]> {
    const { data, error } = await supabase
      .from('law_tasks')
      .select('*')
      .eq('due_date', date)
      .order('priority', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async searchAppointmentsByDate(date: string): Promise<LawAppointment[]> {
    const { data, error } = await supabase
      .from('law_appointments')
      .select('*')
      .eq('appointment_date', date)
      .order('start_time', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  static async searchTasksByStatus(status: string): Promise<LawTask[]> {
    const { data, error } = await supabase
      .from('law_tasks')
      .select('*')
      .eq('status', status)
      .order('due_date', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  static async searchCasesByStatus(status: string): Promise<LawCase[]> {
    const { data, error } = await supabase
      .from('law_cases')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async getTodaysTasks(): Promise<LawTask[]> {
    const today = new Date().toISOString().split('T')[0];
    return this.searchTasksByDate(today);
  }

  static async getTodaysAppointments(): Promise<LawAppointment[]> {
    const today = new Date().toISOString().split('T')[0];
    return this.searchAppointmentsByDate(today);
  }

  static async getPendingTasks(): Promise<LawTask[]> {
    return this.searchTasksByStatus('pending');
  }

  static async getActiveCases(): Promise<LawCase[]> {
    return this.searchCasesByStatus('open');
  }

  // --- Função de busca inteligente unificada ---
  static async intelligentSearch(query: string): Promise<{
    clients: LawClient[];
    documents: LawDocument[];
    cases: LawCase[];
    tasks: LawTask[];
    appointments: LawAppointment[];
  }> {
    const normalizedQuery = query.toLowerCase().trim();
    
    // Buscas simultâneas em todas as tabelas
    const [clients, documents, cases, tasks, appointments] = await Promise.all([
      supabase.from('law_clients').select('*').ilike('name', `%${normalizedQuery}%`),
      supabase.from('law_documents').select('*').or(`name.ilike.%${normalizedQuery}%,description.ilike.%${normalizedQuery}%`),
      supabase.from('law_cases').select('*').or(`title.ilike.%${normalizedQuery}%,case_number.ilike.%${normalizedQuery}%`),
      supabase.from('law_tasks').select('*').or(`title.ilike.%${normalizedQuery}%,description.ilike.%${normalizedQuery}%`),
      supabase.from('law_appointments').select('*').or(`title.ilike.%${normalizedQuery}%,description.ilike.%${normalizedQuery}%`)
    ]);

    return {
      clients: clients.data || [],
      documents: documents.data || [],
      cases: cases.data || [],
      tasks: tasks.data || [],
      appointments: appointments.data || []
    };
  }
}