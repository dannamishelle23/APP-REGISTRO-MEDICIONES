import { Component, signal } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { SupabaseService } from '../../core/supabase';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'] // puedes agregar estilos si quieres
})
export class LoginPage {
  loading = signal(false);
  errorMsg = signal<string | null>(null);
  infoMsg = signal<string | null>(null);

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private supa: SupabaseService
  ) {}

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  async onLogin() {
    this.resetMessages();
    if (this.form.invalid) return;
    this.loading.set(true);
    const { email, password } = this.form.value;

    try {
      await this.supa.signIn(email!, password!);
      await this.router.navigateByUrl('/home', { replaceUrl: true });
    } catch (err: any) {
      this.errorMsg.set(err.message ?? 'Error al iniciar sesión');
    } finally {
      this.loading.set(false);
    }
  }

  async onRegister() {
    this.resetMessages();
    if (this.form.invalid) return;
    this.loading.set(true);
    const { email, password } = this.form.value;

    try {
      await this.supa.signUp(email!, password!);
      this.infoMsg.set('Cuenta creada. Verifica tu correo electrónico.');
    } catch (err: any) {
      this.errorMsg.set(err.message ?? 'Error al registrar usuario');
    } finally {
      this.loading.set(false);
    }
  }

  private resetMessages() {
    this.errorMsg.set(null);
    this.infoMsg.set(null);
  }
}
