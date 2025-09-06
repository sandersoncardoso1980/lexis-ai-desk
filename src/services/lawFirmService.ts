import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

// Types using database schema
export type LawClient = Database['public']['Tables']['law_clients']['Row'];
export type LawCase = Database['public']['Tables']['law_cases']['Row'];
export type LawDocument = Database['public']['Tables']['law_documents']['Row'];
export type LawTask = Database['public']['Tables']['law_tasks']['Row'];
export type LawAppointment = Database['public']['Tables']['law_appointments']['Row'];
export type Profile = Database['public']['Tables']['profiles']['Row'];

// Service class to handle database operations
export class LawFirmService {
  // Client methods
  static async getClients(): Promise<LawClient[]> {
    const { data, error } = await supabase
      .from('law_clients')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  static async createClient(client: Omit<LawClient, 'id' | 'created_at' | 'updated_at'>): Promise<LawClient> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('law_clients')
      .insert({ ...client, user_id: user.id })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async updateClient(id: string, updates: Partial<LawClient>): Promise<LawClient> {
    const { data, error } = await supabase
      .from('law_clients')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async deleteClient(id: string): Promise<void> {
    const { error } = await supabase
      .from('law_clients')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }

  // Case methods
  static async getCases(): Promise<LawCase[]> {
    const { data, error } = await supabase
      .from('law_cases')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  static async createCase(caseData: Omit<LawCase, 'id' | 'created_at' | 'updated_at'>): Promise<LawCase> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('law_cases')
      .insert({ ...caseData, user_id: user.id })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async updateCase(id: string, updates: Partial<LawCase>): Promise<LawCase> {
    const { data, error } = await supabase
      .from('law_cases')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async deleteCase(id: string): Promise<void> {
    const { error } = await supabase
      .from('law_cases')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }

  // Document methods
  static async getDocuments(): Promise<LawDocument[]> {
    const { data, error } = await supabase
      .from('law_documents')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  static async createDocument(document: Omit<LawDocument, 'id' | 'created_at' | 'updated_at'>): Promise<LawDocument> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('law_documents')
      .insert({ ...document, user_id: user.id })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async updateDocument(id: string, updates: Partial<LawDocument>): Promise<LawDocument> {
    const { data, error } = await supabase
      .from('law_documents')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async deleteDocument(id: string): Promise<void> {
    const { error } = await supabase
      .from('law_documents')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }

  // Task methods
  static async getTasks(): Promise<LawTask[]> {
    const { data, error } = await supabase
      .from('law_tasks')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  static async createTask(task: Omit<LawTask, 'id' | 'created_at' | 'updated_at'>): Promise<LawTask> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('law_tasks')
      .insert({ ...task, user_id: user.id })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async updateTask(id: string, updates: Partial<LawTask>): Promise<LawTask> {
    const { data, error } = await supabase
      .from('law_tasks')
      .update(updates)
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
      .eq('id', id);
    
    if (error) throw error;
  }

  // Appointment methods
  static async getAppointments(): Promise<LawAppointment[]> {
    const { data, error } = await supabase
      .from('law_appointments')
      .select('*')
      .order('appointment_date', { ascending: true });
    
    if (error) throw error;
    return data || [];
  }

  static async createAppointment(appointment: Omit<LawAppointment, 'id' | 'created_at' | 'updated_at'>): Promise<LawAppointment> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('law_appointments')
      .insert({ ...appointment, user_id: user.id })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async updateAppointment(id: string, updates: Partial<LawAppointment>): Promise<LawAppointment> {
    const { data, error } = await supabase
      .from('law_appointments')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async deleteAppointment(id: string): Promise<void> {
    const { error } = await supabase
      .from('law_appointments')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }

  // Profile methods
  static async getCurrentProfile(): Promise<Profile | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();
    
    if (error) throw error;
    return data;
  }

  static async updateProfile(updates: Partial<Profile>): Promise<Profile> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('user_id', user.id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

}