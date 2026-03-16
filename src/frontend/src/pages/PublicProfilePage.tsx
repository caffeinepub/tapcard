import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useParams, useSearch } from "@tanstack/react-router";
import {
  Check,
  Download,
  Globe,
  Loader2,
  Mail,
  MessageCircle,
  Phone,
  UserRoundX,
} from "lucide-react";
import { useEffect, useState } from "react";
import { SiInstagram, SiLinkedin, SiWhatsapp } from "react-icons/si";
import { toast } from "sonner";
import {
  Variant_desktop_mobile_unknown,
  Variant_qr_nfc_direct,
} from "../backend";
import {
  useGetPublicProfile,
  useLogProfileView,
  useSubmitLead,
} from "../hooks/useQueries";

function detectDevice(): Variant_desktop_mobile_unknown {
  const ua = navigator.userAgent;
  if (/Mobi|Android|iPhone|iPad/.test(ua))
    return Variant_desktop_mobile_unknown.mobile;
  return Variant_desktop_mobile_unknown.desktop;
}

function detectSource(src?: string): Variant_qr_nfc_direct {
  if (src === "nfc") return Variant_qr_nfc_direct.nfc;
  if (src === "qr") return Variant_qr_nfc_direct.qr;
  return Variant_qr_nfc_direct.direct;
}

function generateVCard(profile: import("../backend").UserProfile): string {
  const lines = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `FN:${profile.name}`,
    profile.company ? `ORG:${profile.company}` : null,
    profile.phone ? `TEL:${profile.phone}` : null,
    profile.email ? `EMAIL:${profile.email}` : null,
    profile.website ? `URL:${profile.website}` : null,
    profile.bio ? `NOTE:${profile.bio}` : null,
    "END:VCARD",
  ]
    .filter(Boolean)
    .join("\r\n");
  return lines;
}

export default function PublicProfilePage() {
  const { username } = useParams({ from: "/u/$username" });
  const search = useSearch({ strict: false }) as Record<string, string>;
  const src = search?.src;

  const { data: profile, isLoading, isError } = useGetPublicProfile(username);
  const { mutate: logView } = useLogProfileView();
  const { mutateAsync: submitLead, isPending: submittingLead } =
    useSubmitLead();

  const [leadForm, setLeadForm] = useState({ name: "", phone: "", email: "" });
  const [leadSubmitted, setLeadSubmitted] = useState(false);
  const [viewLogged, setViewLogged] = useState(false);

  // Log view on mount
  useEffect(() => {
    if (profile && !viewLogged) {
      setViewLogged(true);
      logView({
        username,
        deviceType: detectDevice(),
        country:
          Intl.DateTimeFormat().resolvedOptions().timeZone.split("/")[0] ??
          "Unknown",
        source: detectSource(src),
      });
    }
  }, [profile, viewLogged, username, src, logView]);

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await submitLead({ username, ...leadForm });
      setLeadSubmitted(true);
      toast.success("Contact info saved!");
    } catch {
      toast.error("Failed to submit. Try again.");
    }
  };

  const handleSaveContact = () => {
    if (!profile) return;
    const vcf = generateVCard(profile);
    const blob = new Blob([vcf], { type: "text/vcard" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${profile.name || username}.vcf`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Contact saved!");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-4">
          <Skeleton className="h-32 rounded-2xl" />
          <Skeleton className="h-16 rounded-xl" />
          <Skeleton className="h-48 rounded-xl" />
        </div>
      </div>
    );
  }

  if (isError || !profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <UserRoundX className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="font-display text-2xl font-bold mb-2">
            Profile Not Found
          </h1>
          <p className="text-muted-foreground">
            This card link doesn't exist or has been removed.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Profile hero */}
      <div className="bg-gradient-to-b from-primary/10 via-primary/5 to-background pt-16 pb-8 px-4">
        <div className="max-w-md mx-auto text-center">
          <Avatar className="w-28 h-28 mx-auto mb-5 ring-4 ring-primary/20">
            <AvatarImage src={profile.photoUrl} alt={profile.name} />
            <AvatarFallback className="text-4xl font-display font-bold bg-primary/10 text-primary">
              {profile.name?.[0]?.toUpperCase() ?? "?"}
            </AvatarFallback>
          </Avatar>
          <h1 className="font-display text-3xl font-bold">{profile.name}</h1>
          {profile.company && (
            <p className="text-muted-foreground mt-1 text-base">
              {profile.company}
            </p>
          )}
          {profile.bio && (
            <p className="text-sm text-muted-foreground mt-3 leading-relaxed max-w-sm mx-auto">
              {profile.bio}
            </p>
          )}
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 pb-16 space-y-4">
        {/* Action buttons */}
        <div className="grid grid-cols-2 gap-3">
          {profile.phone && (
            <a href={`tel:${profile.phone}`}>
              <Button variant="outline" className="w-full h-12">
                <Phone className="w-4 h-4 mr-2" /> Call
              </Button>
            </a>
          )}
          {profile.email && (
            <a href={`mailto:${profile.email}`}>
              <Button variant="outline" className="w-full h-12">
                <Mail className="w-4 h-4 mr-2" /> Email
              </Button>
            </a>
          )}
          {profile.website && (
            <a href={profile.website} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" className="w-full h-12">
                <Globe className="w-4 h-4 mr-2" /> Website
              </Button>
            </a>
          )}
          <Button
            variant="outline"
            className="w-full h-12"
            onClick={handleSaveContact}
            data-ocid="public_profile.save_contact_button"
          >
            <Download className="w-4 h-4 mr-2" /> Save Contact
          </Button>
        </div>

        {/* Social links */}
        {(profile.linkedIn || profile.instagram || profile.whatsapp) && (
          <Card className="card-glow">
            <CardContent className="pt-5 pb-4">
              <div className="flex justify-center gap-4">
                {profile.linkedIn && (
                  <a
                    href={profile.linkedIn}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button
                      variant="outline"
                      size="icon"
                      className="w-12 h-12 rounded-xl"
                    >
                      <SiLinkedin className="w-5 h-5 text-[#0077B5]" />
                    </Button>
                  </a>
                )}
                {profile.instagram && (
                  <a
                    href={profile.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button
                      variant="outline"
                      size="icon"
                      className="w-12 h-12 rounded-xl"
                    >
                      <SiInstagram className="w-5 h-5 text-[#E1306C]" />
                    </Button>
                  </a>
                )}
                {profile.whatsapp && (
                  <a
                    href={`https://wa.me/${profile.whatsapp.replace(/[^0-9]/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button
                      variant="outline"
                      size="icon"
                      className="w-12 h-12 rounded-xl"
                    >
                      <SiWhatsapp className="w-5 h-5 text-[#25D366]" />
                    </Button>
                  </a>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        <Separator />

        {/* Lead capture */}
        <Card className="card-glow">
          <CardContent className="pt-6">
            {leadSubmitted ? (
              <div
                className="text-center py-6"
                data-ocid="public_profile.success_state"
              >
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Check className="w-7 h-7 text-primary" />
                </div>
                <h3 className="font-display text-xl font-bold mb-2">
                  Thanks for connecting!
                </h3>
                <p className="text-muted-foreground text-sm">
                  {profile.name ? `${profile.name} will` : "They will"} be in
                  touch soon.
                </p>
              </div>
            ) : (
              <form onSubmit={handleLeadSubmit} className="space-y-4">
                <div className="text-center mb-2">
                  <MessageCircle className="w-6 h-6 text-primary mx-auto mb-2" />
                  <h3 className="font-display text-lg font-semibold">
                    Stay in touch
                  </h3>
                  <p className="text-muted-foreground text-sm mt-1">
                    Leave your contact info and {profile.name || "they"} will
                    reach out
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lead-name">Your Name</Label>
                  <Input
                    id="lead-name"
                    value={leadForm.name}
                    onChange={(e) =>
                      setLeadForm((p) => ({ ...p, name: e.target.value }))
                    }
                    placeholder="Jane Smith"
                    required
                    data-ocid="public_profile.lead_name_input"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lead-phone">Phone</Label>
                  <Input
                    id="lead-phone"
                    type="tel"
                    value={leadForm.phone}
                    onChange={(e) =>
                      setLeadForm((p) => ({ ...p, phone: e.target.value }))
                    }
                    placeholder="+1 555 000 0000"
                    data-ocid="public_profile.lead_phone_input"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lead-email">Email</Label>
                  <Input
                    id="lead-email"
                    type="email"
                    value={leadForm.email}
                    onChange={(e) =>
                      setLeadForm((p) => ({ ...p, email: e.target.value }))
                    }
                    placeholder="jane@example.com"
                    data-ocid="public_profile.lead_email_input"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full h-12"
                  disabled={submittingLead}
                  data-ocid="public_profile.lead_submit_button"
                >
                  {submittingLead ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />{" "}
                      Sending...
                    </>
                  ) : (
                    "Send My Contact Info"
                  )}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
