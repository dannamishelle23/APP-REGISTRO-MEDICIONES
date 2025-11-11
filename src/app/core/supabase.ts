import { Injectable, inject } from '@angular/core';
import { createClient, type SupabaseClient, type Session } from '@supabase/supabase-js';
import { BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class SupabaseService {
  private supabase: SupabaseClient;
  private _session$ = new BehaviorSubject<Session | null>(null);
  session$ = this._session$.asObservable();

  constructor() {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseAnonKey);

    // Recupera sesión al iniciar
    this.supabase.auth.getSession().then(({ data }) => this._session$.next(data.session));

    // Escucha cambios de sesión (login/logout/refresh)
    this.supabase.auth.onAuthStateChange((_event, session) => {
      this._session$.next(session);
    });
  }

get client() {
    return this.supabase;
  }

  async signIn(email: string, password: string) {
    const { data, error } = await this.supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  }

  async signUp(email: string, password: string, rol: string) {
    const { data, error } = await this.supabase.auth.signUp({ 
        email, 
        password,
        options: {
            data: {rol}
        } });
    if (error) throw error;

    const { user } = data;
    if (user) {
        const { error: insertError } = await this.supabase
        .from('usuarios')
        .insert([{ id: user.id, email, rol }]);
        if (insertError) throw insertError;
    }
    return data;
  }

  async signOut() {
    const { error } = await this.supabase.auth.signOut();
    if (error) throw error;
  }

  async getCurrentSession() {
    const { data } = await this.supabase.auth.getSession();
    return data.session;
 }

 async getMessages() {
  const { data, error } = await this.supabase
    .from('messages')
    .select('*')
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data;
}

async addMessage(content: string) {
//Obtener usuario autenticado actual 
  const { data: {user}, error:userError } = await this.supabase.auth.getUser();
  if (userError || !user) throw userError || new Error("Usuario no autenticado");
  //Insertar mensaje con autor 
  const { error } = await this.supabase
    .from('messages')
    .insert({ content, autor: user.email,   // o cambiar a user.id
    created_at: new Date().toISOString()
    });
  if (error) throw error;
}

listenToMessages(callback: (payload: any) => void) {
  return this.supabase
    .channel('public:messages')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'messages' },
      payload => callback(payload.new)
    )
   .subscribe();
    }
}