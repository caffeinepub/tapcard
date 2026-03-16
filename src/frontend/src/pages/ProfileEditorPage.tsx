import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  Building2,
  Camera,
  Globe,
  Instagram,
  Linkedin,
  Loader2,
  Mail,
  MessageCircle,
  Phone,
  Save,
  User,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { UserProfile } from "../backend";
import { useGetCallerUserProfile, useSaveProfile } from "../hooks/useQueries";

const emptyProfile: UserProfile = {
  username: "",
  name: "",
  company: "",
  phone: "",
  email: "",
  website: "",
  bio: "",
  photoUrl: "",
  linkedIn: "",
  instagram: "",
  whatsapp: "",
};

async function uploadPhoto(
  file: File,
  onProgress: (pct: number) => void,
): Promise<string> {
  // Try blob storage module if available at runtime
  try {
    // @ts-expect-error - optional module, may not be available
    const blobMod = window.__caffeineBlob;
    if (blobMod?.ExternalBlob) {
      const bytes = new Uint8Array(await file.arrayBuffer());
      const blob =
        blobMod.ExternalBlob.fromBytes(bytes).withUploadProgress(onProgress);
      await blob.getBytes();
      return blob.getDirectURL();
    }
  } catch {
    // fall through to FileReader
  }
  // Fallback: data URL
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      onProgress(100);
      resolve(e.target?.result as string);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function ProfileEditorPage() {
  const { data: existing, isLoading } = useGetCallerUserProfile();
  const { mutateAsync: saveProfile, isPending } = useSaveProfile();
  const [form, setForm] = useState<UserProfile>(emptyProfile);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (existing) {
      setForm(existing);
    }
  }, [existing]);

  const set =
    (field: keyof UserProfile) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
    };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploadProgress(0);
      const url = await uploadPhoto(file, (pct) => setUploadProgress(pct));
      setForm((prev) => ({ ...prev, photoUrl: url }));
      setUploadProgress(null);
      toast.success("Photo uploaded!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to upload photo");
      setUploadProgress(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.username.trim()) {
      toast.error("Username is required");
      return;
    }
    if (!/^[a-z0-9_-]+$/.test(form.username)) {
      toast.error(
        "Username can only contain lowercase letters, numbers, hyphens and underscores",
      );
      return;
    }
    try {
      await saveProfile(form);
      toast.success("Profile saved successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to save profile");
    }
  };

  if (isLoading) {
    return (
      <div
        className="flex items-center justify-center min-h-[60vh]"
        data-ocid="profile.loading_state"
      >
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10 max-w-2xl">
      <div className="flex items-center gap-3 mb-8">
        <Link to="/dashboard">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="font-display text-3xl font-bold">Edit Profile</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Update your digital business card
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Photo */}
        <Card className="card-glow">
          <CardContent className="pt-6">
            <div className="flex items-center gap-5">
              <Avatar className="w-20 h-20">
                <AvatarImage src={form.photoUrl} alt={form.name} />
                <AvatarFallback className="text-2xl font-display font-bold bg-primary/10 text-primary">
                  {form.name ? (
                    form.name[0].toUpperCase()
                  ) : (
                    <User className="w-8 h-8" />
                  )}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="font-medium mb-1">Profile Photo</p>
                <p className="text-sm text-muted-foreground mb-3">
                  {uploadProgress !== null
                    ? `Uploading... ${uploadProgress}%`
                    : "JPG, PNG up to 5MB"}
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoUpload}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadProgress !== null}
                  data-ocid="profile.photo_upload_button"
                >
                  <Camera className="w-4 h-4 mr-2" />
                  {uploadProgress !== null ? "Uploading..." : "Upload Photo"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Basic info */}
        <Card className="card-glow">
          <CardHeader>
            <CardTitle className="font-display text-lg">
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username (your card URL slug) *</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                  /u/
                </span>
                <Input
                  id="username"
                  value={form.username}
                  onChange={set("username")}
                  placeholder="john-doe"
                  className="pl-10"
                  required
                  data-ocid="profile.username_input"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">
                <User className="w-3.5 h-3.5 inline mr-1" /> Full Name
              </Label>
              <Input
                id="name"
                value={form.name}
                onChange={set("name")}
                placeholder="John Doe"
                data-ocid="profile.name_input"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="company">
                <Building2 className="w-3.5 h-3.5 inline mr-1" /> Company
              </Label>
              <Input
                id="company"
                value={form.company}
                onChange={set("company")}
                placeholder="Acme Corp"
                data-ocid="profile.company_input"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Short Bio</Label>
              <Textarea
                id="bio"
                value={form.bio}
                onChange={set("bio")}
                placeholder="Tell people a bit about yourself..."
                rows={3}
                data-ocid="profile.bio_textarea"
              />
            </div>
          </CardContent>
        </Card>

        {/* Contact */}
        <Card className="card-glow">
          <CardHeader>
            <CardTitle className="font-display text-lg">
              Contact Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone">
                <Phone className="w-3.5 h-3.5 inline mr-1" /> Phone
              </Label>
              <Input
                id="phone"
                type="tel"
                value={form.phone}
                onChange={set("phone")}
                placeholder="+1 555 000 0000"
                data-ocid="profile.phone_input"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">
                <Mail className="w-3.5 h-3.5 inline mr-1" /> Email
              </Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={set("email")}
                placeholder="john@example.com"
                data-ocid="profile.email_input"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="website">
                <Globe className="w-3.5 h-3.5 inline mr-1" /> Website
              </Label>
              <Input
                id="website"
                type="url"
                value={form.website}
                onChange={set("website")}
                placeholder="https://yoursite.com"
                data-ocid="profile.website_input"
              />
            </div>
          </CardContent>
        </Card>

        {/* Social */}
        <Card className="card-glow">
          <CardHeader>
            <CardTitle className="font-display text-lg">Social Links</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="linkedin">
                <Linkedin className="w-3.5 h-3.5 inline mr-1" /> LinkedIn URL
              </Label>
              <Input
                id="linkedin"
                type="url"
                value={form.linkedIn}
                onChange={set("linkedIn")}
                placeholder="https://linkedin.com/in/johndoe"
                data-ocid="profile.linkedin_input"
              />
            </div>
            <Separator />
            <div className="space-y-2">
              <Label htmlFor="instagram">
                <Instagram className="w-3.5 h-3.5 inline mr-1" /> Instagram URL
              </Label>
              <Input
                id="instagram"
                type="url"
                value={form.instagram}
                onChange={set("instagram")}
                placeholder="https://instagram.com/johndoe"
                data-ocid="profile.instagram_input"
              />
            </div>
            <Separator />
            <div className="space-y-2">
              <Label htmlFor="whatsapp">
                <MessageCircle className="w-3.5 h-3.5 inline mr-1" /> WhatsApp
                Number
              </Label>
              <Input
                id="whatsapp"
                type="tel"
                value={form.whatsapp}
                onChange={set("whatsapp")}
                placeholder="+1 555 000 0000"
                data-ocid="profile.whatsapp_input"
              />
            </div>
          </CardContent>
        </Card>

        <Button
          type="submit"
          size="lg"
          className="w-full h-12 text-base"
          disabled={isPending}
          data-ocid="profile.save_button"
        >
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save Profile
            </>
          )}
        </Button>
      </form>
    </div>
  );
}
