"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const supabase = createClient();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");

    if (mode === "signup") {
      const { data, error } = await supabase.auth.signUp({
        email,
        password
      });

      if (error) {
        setMessage(error.message);
        return;
      }

      if (data.user) {
        await supabase.from("profiles").upsert({
          id: data.user.id,
          email: data.user.email
        });
      }

      if (data.session) {
        router.push("/dashboard");
        router.refresh();
        return;
      }

      setMessage(
        "Compte créé. Vérifie ton email pour confirmer ton inscription, puis connecte-toi."
      );
      setMode("login");
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      setMessage(error.message);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className="page-shell">
      <nav className="nav">
        <Link href="/" className="pill">← Accueil</Link>
      </nav>

      <section className="card" style={{ maxWidth: 520, margin: "0 auto" }}>
        <span className="badge">Compte</span>
        <h1 style={{ marginTop: 16 }}>
          {mode === "login" ? "Connexion" : "Créer un compte"}
        </h1>
        <p className="subtitle">
          Connecte-toi pour sauvegarder tes analyses et retrouver ton historique.
        </p>

        <form onSubmit={handleSubmit} className="list">
          <input
            className="input"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            className="input"
            type="password"
            placeholder="Mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit" className="button">
            {mode === "login" ? "Se connecter" : "Créer le compte"}
          </button>
        </form>

        {message ? (
          <p className="helper" style={{ marginTop: 12 }}>{message}</p>
        ) : null}

        <div style={{ marginTop: 16 }}>
          {mode === "login" ? (
            <button
              className="ghost-button"
              type="button"
              onClick={() => setMode("signup")}
            >
              Pas encore de compte ?
            </button>
          ) : (
            <button
              className="ghost-button"
              type="button"
              onClick={() => setMode("login")}
            >
              Déjà un compte ?
            </button>
          )}
        </div>
      </section>
    </main>
  );
}
