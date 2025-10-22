import { useState, type ChangeEvent } from "react";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

// Types for the form
type ProfileForm = {
  name: string;
  email: string;
  phone?: string;
  dob?: string;
  address?: string;
  defaultCapital?: string;
  riskPercent?: string;
  positionSizing?: "equal" | "risk" | "custom";
  commission?: string;
  partialBooking?: string;
  baseCurrency?: string;
  twoFA?: boolean;
  idleTimeoutMins?: number;
  themeDark?: boolean;
  notifications: { email: boolean; sms: boolean; inapp: boolean };
};

const defaultForm: ProfileForm = {
  name: "",
  email: "",
  phone: "",
  dob: "",
  address: "",
  defaultCapital: "500000",
  riskPercent: "1",
  positionSizing: "equal",
  commission: "0.05",
  partialBooking: "50",
  baseCurrency: "INR",
  twoFA: false,
  idleTimeoutMins: 30,
  themeDark: false,
  notifications: { email: true, sms: false, inapp: true },
};

// Small wrapper that renders SelectTrigger + SelectContent so SelectItem is always inside SelectContent
function FormSelect<T extends string>(props: {
  label?: string;
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
  disabled?: boolean;
}) {
  const { label, value, onChange, options, disabled } = props;

  return (
    <div>
      {label && <Label className="mb-1">{label}</Label>}
      <Select
        value={String(value)}
        onValueChange={(v) => onChange(v as T)}
        disabled={disabled}
      >
        <SelectTrigger>
          <SelectValue placeholder={label ?? "Select"} />
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export default function MyProfilePage() {
  const [form, setForm] = useState<ProfileForm>(defaultForm);
  const [editing, setEditing] = useState(false);
  const [avatarSrc, setAvatarSrc] = useState<string | null>(null);
  const [addressOpen, setAddressOpen] = useState(false);

  function update<K extends keyof ProfileForm>(key: K, value: ProfileForm[K]) {
    setForm((s) => ({ ...s, [key]: value }));
  }

  function handleAvatarChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setAvatarSrc(String(reader.result));
    reader.readAsDataURL(file);
  }

  function handleSave() {
    // Replace with API call
    console.log("Saving profile:", form);
    setEditing(false);
  }

  function handleCancel() {
    setForm(defaultForm);
    setEditing(false);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-4 md:p-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: Profile + Preferences */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>Basic account information</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="h-20 w-20 rounded-full overflow-hidden bg-muted flex items-center justify-center">
                    {avatarSrc ? (
                      <img
                        src={avatarSrc}
                        alt="avatar"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="text-lg font-medium">
                        {form.name?.charAt(0) || "U"}
                      </div>
                    )}
                  </div>
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="absolute inset-0 opacity-0 cursor-pointer rounded-full"
                    title="Upload avatar"
                  />
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-medium">
                      {form.name || "Your name"}
                    </h3>
                    <span className="text-sm text-muted-foreground">
                      {form.email}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {form.address
                      ? form.address.split("\n")[0]
                      : "Address not set"}
                  </p>

                  <div className="mt-4 flex gap-2">
                    {editing ? (
                      <>
                        <Button
                          className="text-white"
                          size="sm"
                          onClick={handleSave}
                        >
                          Save
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={handleCancel}
                        >
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <Button
                        className="text-white"
                        size="sm"
                        onClick={() => setEditing(true)}
                      >
                        Edit Profile
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              <Separator className="my-4" />

              <div className="space-y-3">
                <div>
                  <Label className="mb-1">Full name</Label>
                  <Input
                    value={form.name}
                    onChange={(e) => update("name", e.target.value)}
                    disabled={!editing}
                    placeholder="e.g. Ajinkya Joshi"
                  />
                </div>

                <div>
                  <Label className="mb-1">Email</Label>
                  <Input
                    value={form.email}
                    onChange={(e) => update("email", e.target.value)}
                    disabled={!editing}
                    placeholder="you@domain.com"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <Label className="mb-1">Phone</Label>
                    <Input
                      value={form.phone}
                      onChange={(e) => update("phone", e.target.value)}
                      disabled={!editing}
                      placeholder="+91 9XXXXXXXXX"
                    />
                  </div>

                  <div>
                    <Label className="mb-1">Date of birth</Label>
                    <Input
                      type="date"
                      value={form.dob}
                      onChange={(e) => update("dob", e.target.value)}
                      disabled={!editing}
                    />
                  </div>
                </div>

                <div>
                  <Accordion type="single" collapsible>
                    <AccordionItem value="address">
                      <AccordionTrigger
                        onClick={() => setAddressOpen((s) => !s)}
                      >
                        Address {addressOpen ? "(expanded)" : "(collapsed)"}
                      </AccordionTrigger>
                      <AccordionContent>
                        <Textarea
                          value={form.address}
                          onChange={(e) => update("address", e.target.value)}
                          disabled={!editing}
                          placeholder="Street, City, State, PIN"
                        />
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Trading Preferences */}
          <Card>
            <CardHeader>
              <CardTitle>Trading Preferences</CardTitle>
              <CardDescription>
                Defaults for new trades & position sizing
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label className="mb-1">Default capital</Label>
                  <Input
                    value={form.defaultCapital}
                    onChange={(e) => update("defaultCapital", e.target.value)}
                    disabled={!editing}
                  />
                </div>
                <div>
                  <Label className="mb-1">Risk % per trade</Label>
                  <Input
                    value={form.riskPercent}
                    onChange={(e) => update("riskPercent", e.target.value)}
                    disabled={!editing}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <FormSelect
                    label="Position sizing"
                    value={form.positionSizing as "equal" | "risk" | "custom"}
                    onChange={(v) => update("positionSizing", v)}
                    disabled={!editing}
                    options={[
                      { value: "equal", label: "Equal Money" },
                      { value: "risk", label: "Risk-Based" },
                      { value: "custom", label: "Custom" },
                    ]}
                  />
                </div>

                <div>
                  <Label className="mb-1">Commission %</Label>
                  <Input
                    value={form.commission}
                    onChange={(e) => update("commission", e.target.value)}
                    disabled={!editing}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label className="mb-1">Partial booking %</Label>
                  <Input
                    value={form.partialBooking}
                    onChange={(e) => update("partialBooking", e.target.value)}
                    disabled={!editing}
                  />
                </div>
                <div>
                  <FormSelect
                    label="Base currency"
                    value={form.baseCurrency as string}
                    onChange={(v) => update("baseCurrency", v)}
                    disabled={!editing}
                    options={[
                      { value: "INR", label: "₹ INR" },
                      { value: "USD", label: "$ USD" },
                      { value: "EUR", label: "€ EUR" },
                    ]}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Security & Account Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Security & Account</CardTitle>
              <CardDescription>Login and safety settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="mb-1">Two-factor authentication</Label>
                  <p className="text-sm text-muted-foreground">
                    Protect your account with 2FA
                  </p>
                </div>
                <Switch
                  checked={Boolean(form.twoFA)}
                  onCheckedChange={(v: boolean) => update("twoFA", v)}
                  disabled={!editing}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="mb-1">Auto-logout (idle mins)</Label>
                  <p className="text-sm text-muted-foreground">
                    Reauthenticate after inactivity
                  </p>
                </div>
                <Input
                  type="number"
                  value={String(form.idleTimeoutMins)}
                  onChange={(e) =>
                    update("idleTimeoutMins", Number(e.target.value))
                  }
                  className="w-28"
                  disabled={!editing}
                />
              </div>

              <div className="space-y-2">
                <Label>Connected brokers</Label>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between p-2 rounded-md bg-muted/40">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-white/80 flex items-center justify-center text-sm">
                        Z
                      </div>
                      <div>
                        <div className="text-sm font-medium">Zerodha</div>
                        <div className="text-xs text-muted-foreground">
                          Connected
                        </div>
                      </div>
                    </div>
                    <Button size="sm" variant="ghost">
                      Disconnect
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-md bg-muted/40">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-white/80 flex items-center justify-center text-sm">
                        U
                      </div>
                      <div>
                        <div className="text-sm font-medium">Upstox</div>
                        <div className="text-xs text-muted-foreground">
                          Not connected
                        </div>
                      </div>
                    </div>
                    <Button size="sm">Connect</Button>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <Button onClick={() => console.log("Change password clicked")}>
                  Change password
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => console.log("Export data clicked")}
                >
                  Export data
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right column: Performance Snapshot + Preferences */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Performance Snapshot</CardTitle>
              <CardDescription>Quick KPIs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-3 rounded-md bg-muted/40 text-center">
                  <div className="text-xs text-muted-foreground">
                    Total trades
                  </div>
                  <div className="text-lg font-semibold">124</div>
                </div>
                <div className="p-3 rounded-md bg-muted/40 text-center">
                  <div className="text-xs text-muted-foreground">Win rate</div>
                  <div className="text-lg font-semibold">63%</div>
                </div>
                <div className="p-3 rounded-md bg-muted/40 text-center">
                  <div className="text-xs text-muted-foreground">Avg R:R</div>
                  <div className="text-lg font-semibold">1.9</div>
                </div>
                <div className="p-3 rounded-md bg-muted/40 text-center">
                  <div className="text-xs text-muted-foreground">
                    Net P&amp;L
                  </div>
                  <div className="text-lg font-semibold">₹24,320</div>
                </div>
              </div>

              <div className="mt-4">
                <Label className="mb-2">Notes</Label>
                <Textarea
                  value={"Keep a journal of your trades to improve edge."}
                  readOnly
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Preferences</CardTitle>
              <CardDescription>UI & notification settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="mb-1">Theme</Label>
                  <p className="text-sm text-muted-foreground">Light / Dark</p>
                </div>
                <Switch
                  checked={Boolean(form.themeDark)}
                  onCheckedChange={(v: boolean) => update("themeDark", v)}
                  disabled={!editing}
                />
              </div>

              <div>
                <Label className="mb-2">Notifications</Label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={Boolean(form.notifications.email)}
                      onCheckedChange={(v: boolean) =>
                        update("notifications", {
                          ...form.notifications,
                          email: v,
                        })
                      }
                      disabled={!editing}
                    />
                    <div>
                      <div className="text-sm font-medium">Email</div>
                      <div className="text-xs text-muted-foreground">
                        Trade alerts & statements
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Switch
                      checked={Boolean(form.notifications.sms)}
                      onCheckedChange={(v: boolean) =>
                        update("notifications", {
                          ...form.notifications,
                          sms: v,
                        })
                      }
                      disabled={!editing}
                    />
                    <div>
                      <div className="text-sm font-medium">SMS</div>
                      <div className="text-xs text-muted-foreground">
                        Critical alerts only
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Switch
                      checked={Boolean(form.notifications.inapp)}
                      onCheckedChange={(v: boolean) =>
                        update("notifications", {
                          ...form.notifications,
                          inapp: v,
                        })
                      }
                      disabled={!editing}
                    />
                    <div>
                      <div className="text-sm font-medium">In-app</div>
                      <div className="text-xs text-muted-foreground">
                        Real-time trade & system alerts
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  className="text-white"
                  onClick={() => console.log("Export CSV")}
                >
                  Export CSV
                </Button>
                <Button
                  onClick={() => console.log("Export Excel")}
                  variant="outline"
                >
                  Export Excel
                </Button>
                <Button
                  className="text-white"
                  onClick={() => console.log("Export PDF")}
                >
                  Export PDF
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Footer actions */}
          <div className="flex justify-end gap-3">
            <Button
              className="text-white"
              onClick={() => {
                setEditing(true);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            >
              Edit Profile
            </Button>
            <Button
              onClick={() => console.log("Delete account clicked")}
              variant="destructive"
            >
              Delete account
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
