import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Pencil, Check, X, User, Mail, ShieldCheck, Activity, TrendingUp } from "lucide-react";
import { getMeApi, patchMeApi } from "@/lib/api";
import { storeUser, getStoredUser } from "@/lib/auth";
import type { User as UserType } from "@/lib/auth";

const ProfilePanel = () => {
  const [user, setUser] = useState<UserType | null>(getStoredUser());
  const [editing, setEditing] = useState(false);
  const [userName, setUserName] = useState(user?.userName ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    getMeApi().then((u) => {
      setUser(u);
      setUserName(u.userName);
      storeUser(u);
    }).catch(() => {});
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      const updated = await patchMeApi(userName);
      setUser(updated);
      storeUser(updated);
      setEditing(false);
    } catch (err: any) {
      setError(err?.response?.data?.error?.message || "Failed to update.");
    } finally {
      setSaving(false);
    }
  };

  const displayName = user?.userName || user?.email || "User";
  const initials = displayName.slice(0, 2).toUpperCase();

  const stats = [
    { label: "Trading Mode",      value: "Paper",    icon: Activity,    color: "text-trading-info"    },
    { label: "Active Strategies", value: "3",        icon: TrendingUp,  color: "text-trading-profit"  },
    { label: "Account Type",      value: "Standard", icon: ShieldCheck, color: "text-trading-warning" },
  ];

  return (
    <div className="space-y-6 w-full">
      <div>
        <h2 className="text-2xl font-bold text-trading-text">Profile</h2>
        <p className="text-sm text-trading-text-muted mt-0.5">Manage your account details</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <Card key={label} className="bg-trading-bg-light border-trading-bg-card">
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`p-2 rounded-lg bg-trading-bg ${color}`}>
                <Icon className="w-4 h-4" />
              </div>
              <div>
                <p className="text-trading-text-muted text-xs">{label}</p>
                <p className={`font-semibold text-sm ${color}`}>{value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-trading-bg-light border-trading-bg-card w-full">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-emerald-500 flex items-center justify-center text-white text-xl font-bold shrink-0">
              {initials}
            </div>
            <div>
              <CardTitle className="text-trading-text text-lg font-semibold leading-tight">{displayName}</CardTitle>
              <p className="text-trading-text-muted text-sm">{user?.email}</p>
              <div className="flex gap-2 mt-1.5">
                <Badge variant="outline" className="border-trading-info text-trading-info text-xs px-2 py-0">Algo Trader</Badge>
                <Badge variant="outline" className={`text-xs px-2 py-0 ${user?.isActive ? "border-trading-profit text-trading-profit" : "border-trading-loss text-trading-loss"}`}>
                  {user?.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
            </div>
          </div>
          {!editing ? (
            <Button variant="ghost" size="sm" onClick={() => setEditing(true)}
              className="text-trading-text-muted hover:text-trading-text hover:bg-trading-bg-card self-start">
              <Pencil className="w-3.5 h-3.5 mr-1.5" /> Edit
            </Button>
          ) : (
            <div className="flex gap-2 self-start">
              <Button size="sm" onClick={handleSave} disabled={saving}
                className="bg-trading-profit hover:bg-emerald-600 text-white h-7 px-3 text-xs">
                <Check className="w-3.5 h-3.5 mr-1" /> {saving ? "Saving..." : "Save"}
              </Button>
              <Button variant="ghost" size="sm"
                onClick={() => { setEditing(false); setUserName(user?.userName ?? ""); setError(""); }}
                className="text-trading-loss hover:bg-trading-bg-card h-7 px-3 text-xs">
                <X className="w-3.5 h-3.5 mr-1" /> Cancel
              </Button>
            </div>
          )}
        </CardHeader>

        <CardContent>
          {error && <p className="text-trading-loss text-xs mb-3">{error}</p>}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <Label className="text-trading-text-muted text-xs flex items-center gap-1">
                <User className="w-3 h-3" /> Username
              </Label>
              {editing ? (
                <Input value={userName} onChange={(e) => setUserName(e.target.value)}
                  className="bg-trading-bg border-trading-bg-card text-trading-text h-9 text-sm" />
              ) : (
                <p className="text-trading-text text-sm px-3 py-2 bg-trading-bg border border-trading-bg-card rounded-md">{user?.userName}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label className="text-trading-text-muted text-xs flex items-center gap-1">
                <Mail className="w-3 h-3" /> Email Address
              </Label>
              <p className="text-trading-text text-sm px-3 py-2 bg-trading-bg border border-trading-bg-card rounded-md">{user?.email}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfilePanel;
