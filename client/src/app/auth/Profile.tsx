import { useEffect, useState } from "react";

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
// import {
//   Accordion,
//   AccordionItem,
//   AccordionTrigger,
//   AccordionContent,
// } from "@/components/ui/accordion";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useProfileStore } from "@/store/my-profile-store";
import api from "@/store/api";

const Accordion = ({ children }: any) => <div>{children}</div>;

const AccordionItem = ({ children }: any) => (
  <div className="border-b">{children}</div>
);

const AccordionTrigger = ({ children, onClick }: any) => (
  <button
    onClick={onClick}
    className="w-full py-3 text-left font-medium hover:underline"
  >
    {children}
  </button>
);

const AccordionContent = ({ children }: any) => (
  <div className="pb-3">{children}</div>
);

export default function MyProfilePage() {
  const { profile, loading, error, fetchProfile, updateProfile, clearError } =
    useProfileStore();
  const [editing, setEditing] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarSrc, setAvatarSrc] = useState<string | null>(null);
  const [addressOpen, setAddressOpen] = useState(false);
  const [formData, setFormData] = useState<any | null>(null);
  const BASE_URL = "https://trade-edge.onrender.com";

  console.log(avatarSrc);

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    if (profile) {
      setFormData(profile);
      setAvatarSrc(profile.avatar || null);
    }
  }, [profile]);

  const update = (key: keyof any, value: any) => {
    if (formData) {
      setFormData({ ...formData, [key]: value });
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    if (file.size > 5 * 1024 * 1024) {
      alert("File size must be less than 5MB");
      return;
    }

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    // Store file for upload
    setAvatarFile(file);

    // Show preview
    const reader = new FileReader();
    reader.onload = () => setAvatarSrc(String(reader.result));
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!formData) return;

    try {
      let updatedData = { ...formData };

      // Upload avatar if changed
      if (avatarFile) {
        const formData = new FormData();
        formData.append("avatar", avatarFile);

        const uploadResponse = await api.post("/profile/photo", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        updatedData.avatar = uploadResponse.data.avatarUrl;
      }

      await updateProfile(updatedData);
      setEditing(false);
      setAvatarFile(null);
    } catch (error: any) {
      console.error("Save failed:", error);
      // Error is handled by the store
    }
  };

  const handleCancel = () => {
    setFormData(profile);
    setAvatarSrc(profile?.avatar || null);
    setAvatarFile(null); // Clear avatar file
    setEditing(false);
    clearError();
  };

  if (loading && !formData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error && !formData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error: {error}</p>
          <Button onClick={fetchProfile}>Retry</Button>
        </div>
      </div>
    );
  }

  if (!formData) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-4 md:p-6">
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex justify-between items-center">
          <span className="text-red-800">{error}</span>
          <button
            onClick={clearError}
            className="text-red-600 hover:text-red-800"
          >
            ✕
          </button>
        </div>
      )}

      {loading && formData && (
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <span className="text-blue-800">Saving changes...</span>
        </div>
      )}

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
                  <div className="h-20 w-20 rounded-full overflow-hidden bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center shadow-lg">
                    {profile?.profilePhoto ? (
                      <img
                        src={`${BASE_URL}${profile.profilePhoto}`}
                        alt="Profile"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="text-2xl font-bold text-white">
                        {formData.name?.charAt(0) || "U"}
                      </div>
                    )}
                  </div>

                  {editing && (
                    <>
                      <input
                        id="avatar-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="hidden"
                      />
                      <label
                        htmlFor="avatar-upload"
                        className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-2 cursor-pointer shadow-lg"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                      </label>
                    </>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold ">
                    {formData.name || "Your name"}
                  </h3>
                  <p className="text-sm text-gray-500">{formData.email}</p>
                  <p className="mt-1 text-xs text-gray-400">
                    {formData.address?.split("\n")[0] || "Address not set"}
                  </p>

                  <div className="mt-3 flex gap-2">
                    {editing ? (
                      <>
                        <Button
                          size="sm"
                          onClick={handleSave}
                          disabled={loading}
                        >
                          {loading ? "Saving..." : "Save"}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={handleCancel}
                          disabled={loading}
                        >
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <Button size="sm" onClick={() => setEditing(true)}>
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
                    value={formData.name}
                    onChange={(e: any) => update("name", e.target.value)}
                    disabled={!editing}
                    placeholder="e.g. Ajinkya Joshi"
                  />
                </div>

                <div>
                  <Label className="mb-1">Email</Label>
                  <Input
                    value={formData.email}
                    onChange={(e: any) => update("email", e.target.value)}
                    disabled={!editing}
                    placeholder="you@domain.com"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <Label className="mb-1">Phone</Label>
                    <Input
                      value={formData.phone}
                      onChange={(e: any) => update("phone", e.target.value)}
                      disabled={!editing}
                      placeholder="+91 9XXXXXXXXX"
                    />
                  </div>

                  <div>
                    <Label className="mb-1">Date of birth</Label>
                    <Input
                      type="date"
                      value={formData.dob}
                      onChange={(e: any) => update("dob", e.target.value)}
                      disabled={!editing}
                    />
                  </div>
                </div>

                <div>
                  <Accordion>
                    <AccordionItem>
                      <AccordionTrigger
                        onClick={() => setAddressOpen(!addressOpen)}
                      >
                        Address {addressOpen ? "(expanded)" : "(collapsed)"}
                      </AccordionTrigger>
                      {addressOpen && (
                        <AccordionContent>
                          <Textarea
                            value={formData.address}
                            onChange={(e: any) =>
                              update("address", e.target.value)
                            }
                            disabled={!editing}
                            placeholder="Street, City, State, PIN"
                          />
                        </AccordionContent>
                      )}
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
                    value={formData.defaultCapital}
                    onChange={(e: any) =>
                      update("defaultCapital", e.target.value)
                    }
                    disabled={!editing}
                  />
                </div>
                <div>
                  <Label className="mb-1">Risk % per trade</Label>
                  <Input
                    value={formData.riskPercent}
                    onChange={(e: any) => update("riskPercent", e.target.value)}
                    disabled={!editing}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label className="mb-1">Position sizing</Label>
                  <Select
                    value={formData.positionSizing}
                    onValueChange={(v: any) => update("positionSizing", v)}
                    disabled={!editing}
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          formData.positionSizing === "equal"
                            ? "Equal Money"
                            : formData.positionSizing === "risk"
                            ? "Risk-Based"
                            : "Custom"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="equal">Equal Money</SelectItem>
                      <SelectItem value="risk">Risk-Based</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="mb-1">Commission %</Label>
                  <Input
                    value={formData.commission}
                    onChange={(e: any) => update("commission", e.target.value)}
                    disabled={!editing}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label className="mb-1">Partial booking %</Label>
                  <Input
                    value={formData.partialBooking}
                    onChange={(e: any) =>
                      update("partialBooking", e.target.value)
                    }
                    disabled={!editing}
                  />
                </div>
                <div>
                  <Label className="mb-1">Base currency</Label>
                  <Select
                    value={formData.baseCurrency}
                    onValueChange={(v: any) => update("baseCurrency", v)}
                    disabled={!editing}
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          formData.baseCurrency === "INR"
                            ? "₹ INR"
                            : formData.baseCurrency === "USD"
                            ? "$ USD"
                            : "€ EUR"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="INR">₹ INR</SelectItem>
                      <SelectItem value="USD">$ USD</SelectItem>
                      <SelectItem value="EUR">€ EUR</SelectItem>
                    </SelectContent>
                  </Select>
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
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Two-factor authentication</Label>
                  <p className="text-sm text-gray-500">
                    Protect your account with 2FA
                  </p>
                </div>
                <Switch
                  checked={formData.twoFA}
                  onCheckedChange={(v: boolean) => update("twoFA", v)}
                  disabled={!editing}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Auto-logout (idle mins)</Label>
                  <p className="text-sm text-gray-500">
                    Reauthenticate after inactivity
                  </p>
                </div>
                <Input
                  type="number"
                  value={formData.idleTimeoutMins}
                  onChange={(e: any) =>
                    update("idleTimeoutMins", Number(e.target.value))
                  }
                  className="w-28"
                  disabled={!editing}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right column */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Performance Snapshot</CardTitle>
              <CardDescription>
                Quick KPIs from your trading journey
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 text-center">
                  <div className="text-xs text-gray-600 mb-1">Total trades</div>
                  <div className="text-2xl font-bold text-blue-900">
                    {formData.stats?.totalTrades || 0}
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-gradient-to-br from-green-50 to-green-100 text-center">
                  <div className="text-xs text-gray-600 mb-1">Win rate</div>
                  <div className="text-2xl font-bold text-green-900">
                    {formData.stats?.winRate || 0}%
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-gradient-to-br from-purple-50 to-purple-100 text-center">
                  <div className="text-xs text-gray-600 mb-1">Avg R:R</div>
                  <div className="text-2xl font-bold text-purple-900">
                    {formData.stats?.avgRR || 0}
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-gradient-to-br from-orange-50 to-orange-100 text-center">
                  <div className="text-xs text-gray-600 mb-1">Net P&L</div>
                  <div className="text-2xl font-bold text-orange-900">
                    ₹{formData.stats?.netPL?.toLocaleString() || 0}
                  </div>
                </div>
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
                  <Label>Dark theme</Label>
                  <p className="text-sm text-gray-500">
                    Switch between light and dark mode
                  </p>
                </div>
                <Switch
                  checked={formData.themeDark}
                  onCheckedChange={(v: boolean) => update("themeDark", v)}
                  disabled={!editing}
                />
              </div>

              <div>
                <Label className="mb-3">Notifications</Label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="flex items-center gap-3 p-3 rounded-lg ">
                    <Switch
                      checked={formData.notifications?.email}
                      onCheckedChange={(v: boolean) =>
                        update("notifications", {
                          ...formData.notifications,
                          email: v,
                        })
                      }
                      disabled={!editing}
                    />
                    <div>
                      <div className="text-sm font-medium">Email</div>
                      <div className="text-xs text-gray-500">Trade alerts</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 rounded-lg ">
                    <Switch
                      checked={formData.notifications?.sms}
                      onCheckedChange={(v: boolean) =>
                        update("notifications", {
                          ...formData.notifications,
                          sms: v,
                        })
                      }
                      disabled={!editing}
                    />
                    <div>
                      <div className="text-sm font-medium">SMS</div>
                      <div className="text-xs text-gray-500">Critical only</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 rounded-lg ">
                    <Switch
                      checked={formData.notifications?.inapp}
                      onCheckedChange={(v: boolean) =>
                        update("notifications", {
                          ...formData.notifications,
                          inapp: v,
                        })
                      }
                      disabled={!editing}
                    />
                    <div>
                      <div className="text-sm font-medium">In-app</div>
                      <div className="text-xs text-gray-500">Real-time</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3">
            <Button
              onClick={() => {
                setEditing(true);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            >
              Edit Profile
            </Button>
            <Button
              onClick={() => console.log("Delete account")}
              variant="destructive"
            >
              Delete Account
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
