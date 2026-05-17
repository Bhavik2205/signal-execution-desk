import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { BarChart3 } from "lucide-react";
import { signupApi } from "@/lib/api";

const Signup = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirm) { setError("Passwords do not match."); return; }
    if (form.password.length < 8) { setError("Password must be at least 8 characters."); return; }
    setLoading(true);
    setError("");
    try {
      await signupApi(form.email, form.password, form.name);
      navigate("/");
    } catch (err: any) {
      const msg = err?.response?.data?.error?.message;
      setError(msg || "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "bg-trading-bg border-trading-bg-card text-trading-text placeholder:text-trading-text-muted focus:border-trading-info";

  return (
    <div className="min-h-screen flex items-center justify-center bg-trading-bg">
      <Card className="w-full max-w-sm bg-trading-bg-light border-trading-bg-card shadow-xl">
        <CardHeader className="text-center pb-2 pt-8">
          <div className="flex items-center justify-center gap-2 mb-1">
            <div className="w-9 h-9 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold text-trading-text">AlgoTrader</span>
          </div>
          <p className="text-trading-text-muted text-xs">ML-Powered Trading</p>
          <p className="text-trading-text font-semibold text-base mt-4">Create your account</p>
        </CardHeader>
        <CardContent className="px-6 pb-8 pt-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-trading-text-muted text-xs">Full Name</Label>
              <Input placeholder="John Doe" value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className={inputClass} required />
            </div>
            <div className="space-y-1.5">
              <Label className="text-trading-text-muted text-xs">Email</Label>
              <Input type="email" placeholder="you@example.com" value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className={inputClass} required />
            </div>
            <div className="space-y-1.5">
              <Label className="text-trading-text-muted text-xs">Password</Label>
              <Input type="password" placeholder="••••••••" value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className={inputClass} required />
            </div>
            <div className="space-y-1.5">
              <Label className="text-trading-text-muted text-xs">Confirm Password</Label>
              <Input type="password" placeholder="••••••••" value={form.confirm}
                onChange={(e) => setForm({ ...form, confirm: e.target.value })}
                className={inputClass} required />
            </div>
            {error && <p className="text-trading-loss text-xs">{error}</p>}
            <Button type="submit" disabled={loading} className="w-full bg-trading-info hover:bg-blue-600 text-white mt-2">
              {loading ? "Creating..." : "Create Account"}
            </Button>
          </form>
          <p className="mt-5 text-center text-xs text-trading-text-muted">
            Already have an account?{" "}
            <Link to="/login" className="text-trading-info hover:underline">Sign in</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Signup;
