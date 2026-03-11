import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { loginUser, registerUser } from "../api";

const initialForm = { username: "", email: "", password: "", firstName: "", lastName: "" };

export default function AuthPage() {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      if (mode === "login") {
        await loginUser({ username: form.username, password: form.password });
      } else {
        await registerUser({
          username: form.username,
          email: form.email,
          password: form.password,
          firstName: form.firstName,
          lastName: form.lastName,
        });
      }
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex justify-between mb-4">
            <button
              type="button"
              onClick={() => setMode("login")}
              className={`font-mono text-xs uppercase tracking-widest px-2 py-1 rounded ${
                mode === "login" ? "bg-primary text-black" : "text-muted"
              }`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => setMode("register")}
              className={`font-mono text-xs uppercase tracking-widest px-2 py-1 rounded ${
                mode === "register" ? "bg-primary text-black" : "text-muted"
              }`}
            >
              Register
            </button>
          </div>
          <CardTitle>{mode === "login" ? "Welcome back" : "Create your account"}</CardTitle>
          <CardDescription>
            {mode === "login" ? "Sign in to access your trading terminal." : "Register to start paper trading on NexTradeX."}
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div>
              <label className="font-mono text-xs text-muted uppercase tracking-widest mb-2 block">Username</label>
              <Input name="username" value={form.username} onChange={handleChange} required />
            </div>
            {mode === "register" && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="font-mono text-xs text-muted uppercase tracking-widest mb-2 block">First Name</label>
                    <Input name="firstName" value={form.firstName} onChange={handleChange} required />
                  </div>
                  <div>
                    <label className="font-mono text-xs text-muted uppercase tracking-widest mb-2 block">Last Name</label>
                    <Input name="lastName" value={form.lastName} onChange={handleChange} required />
                  </div>
                </div>
                <div>
                  <label className="font-mono text-xs text-muted uppercase tracking-widest mb-2 block">Email</label>
                  <Input type="email" name="email" value={form.email} onChange={handleChange} required />
                </div>
              </>
            )}
            <div>
              <label className="font-mono text-xs text-muted uppercase tracking-widest mb-2 block">Password</label>
              <Input type="password" name="password" value={form.password} onChange={handleChange} required />
            </div>
            {error && <p className="text-red-400 text-sm font-mono">{error}</p>}
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full font-mono" disabled={loading}>
              {loading ? "Processing..." : mode === "login" ? "Log In" : "Register"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

