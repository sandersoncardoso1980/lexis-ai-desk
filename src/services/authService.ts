import { supabase } from '@/integrations/supabase/client';
import type { User } from '@supabase/supabase-js';

export class AuthService {
  static async signUp(email: string, password: string, userData?: { full_name?: string; role?: string }) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData
      }
    });

    if (error) throw error;
    return data;
  }

  static async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;
    return data;
  }

  static async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }

  static async getCurrentUser(): Promise<User | null> {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  }

  static async resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    });

    if (error) throw error;
  }

  static async updatePassword(password: string) {
    const { error } = await supabase.auth.updateUser({
      password
    });

    if (error) throw error;
  }

  static async updateProfile(updates: { email?: string; data?: any }) {
    const { error } = await supabase.auth.updateUser(updates);
    if (error) throw error;
  }

  static onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback);
  }

  static async getSession() {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  }
}