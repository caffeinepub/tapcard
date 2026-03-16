import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Link } from "@tanstack/react-router";
import {
  AlertCircle,
  Copy,
  Download,
  Edit,
  Eye,
  Link as LinkIcon,
  Monitor,
  QrCode,
  Smartphone,
  Users,
  Wifi,
} from "lucide-react";
import { useMemo } from "react";
import { toast } from "sonner";
import {
  Variant_desktop_mobile_unknown,
  Variant_qr_nfc_direct,
} from "../backend";
import {
  useGetAnalytics,
  useGetCallerUserProfile,
  useGetLeads,
} from "../hooks/useQueries";

function exportToCSV(leads: import("../backend").Lead[], username: string) {
  const header = "Name,Phone,Email,Captured At\n";
  const rows = leads
    .map(
      (l) =>
        `"${l.name}","${l.phone}","${l.email}","${new Date(Number(l.capturedAt) / 1_000_000).toLocaleString()}"`,
    )
    .join("\n");
  const blob = new Blob([header + rows], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `leads-${username}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function DashboardPage() {
  const {
    data: profile,
    isLoading: profileLoading,
    isFetched,
  } = useGetCallerUserProfile();
  const username = profile?.username ?? "";
  const { data: leads = [], isLoading: leadsLoading } = useGetLeads(username);
  const { data: analytics = [], isLoading: analyticsLoading } =
    useGetAnalytics(username);

  const stats = useMemo(() => {
    const totalViews = analytics.length;
    const nfcTaps = analytics.filter(
      (a) => a.source === Variant_qr_nfc_direct.nfc,
    ).length;
    const totalLeads = leads.length;
    const mobileViews = analytics.filter(
      (a) => a.deviceType === Variant_desktop_mobile_unknown.mobile,
    ).length;
    const desktopViews = analytics.filter(
      (a) => a.deviceType === Variant_desktop_mobile_unknown.desktop,
    ).length;
    const qrViews = analytics.filter(
      (a) => a.source === Variant_qr_nfc_direct.qr,
    ).length;
    const directViews = analytics.filter(
      (a) => a.source === Variant_qr_nfc_direct.direct,
    ).length;
    return {
      totalViews,
      nfcTaps,
      totalLeads,
      mobileViews,
      desktopViews,
      qrViews,
      directViews,
    };
  }, [analytics, leads]);

  const profileUrl = username ? `${window.location.origin}/u/${username}` : "";

  const qrImageUrl = profileUrl
    ? `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`${profileUrl}?src=qr`)}&bgcolor=ffffff&color=0a1628&margin=10`
    : null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(profileUrl);
    toast.success("Link copied to clipboard!");
  };

  if (profileLoading || !isFetched) {
    return (
      <div className="container mx-auto px-4 py-10 max-w-5xl">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-48 rounded-xl mb-6" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container mx-auto px-4 py-20 max-w-md text-center">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
          <Edit className="w-8 h-8 text-primary" />
        </div>
        <h2 className="font-display text-2xl font-bold mb-3">
          Set up your profile
        </h2>
        <p className="text-muted-foreground mb-6">
          You haven't created a profile yet. Set one up to get your unique card
          link and QR code.
        </p>
        <Link to="/dashboard/profile">
          <Button size="lg" className="w-full">
            <Edit className="w-4 h-4 mr-2" />
            Create Profile
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10 max-w-5xl">
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back, {profile.name || "there"}!
          </p>
        </div>
        <Link to="/dashboard/profile">
          <Button variant="outline">
            <Edit className="w-4 h-4 mr-2" />
            Edit Profile
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <Card className="card-glow" data-ocid="dashboard.views_card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Eye className="w-4 h-4" /> Total Profile Views
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="font-display text-4xl font-bold">
              {analyticsLoading ? (
                <Skeleton className="h-10 w-16" />
              ) : (
                stats.totalViews
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="card-glow" data-ocid="dashboard.taps_card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Wifi className="w-4 h-4" /> NFC Taps
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="font-display text-4xl font-bold">
              {analyticsLoading ? (
                <Skeleton className="h-10 w-16" />
              ) : (
                stats.nfcTaps
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="card-glow" data-ocid="dashboard.leads_card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="w-4 h-4" /> Total Leads
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="font-display text-4xl font-bold">
              {leadsLoading ? (
                <Skeleton className="h-10 w-16" />
              ) : (
                stats.totalLeads
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Card Link + QR */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card className="card-glow">
          <CardHeader>
            <CardTitle className="font-display text-lg flex items-center gap-2">
              <LinkIcon className="w-5 h-5 text-primary" /> Your Card Link
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex-1 p-3 rounded-lg bg-muted border border-border text-sm font-mono truncate text-muted-foreground">
                {profileUrl || `/u/${username}`}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyLink}
                data-ocid="dashboard.copy_link_button"
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Write this URL to your NFC card. Anyone who taps or scans will see
              your profile.
            </p>
            <a href={profileUrl} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" className="w-full" size="sm">
                <Eye className="w-4 h-4 mr-2" /> View Public Profile
              </Button>
            </a>
          </CardContent>
        </Card>

        <Card className="card-glow">
          <CardHeader>
            <CardTitle className="font-display text-lg flex items-center gap-2">
              <QrCode className="w-5 h-5 text-primary" /> QR Code
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-6">
            {qrImageUrl ? (
              <img
                src={qrImageUrl}
                alt="Profile QR Code"
                className="w-28 h-28 rounded-lg border border-border"
              />
            ) : (
              <div className="w-28 h-28 rounded-lg border border-dashed border-border flex items-center justify-center">
                <QrCode className="w-10 h-10 text-muted-foreground" />
              </div>
            )}
            <div className="flex-1">
              <p className="text-sm text-muted-foreground mb-3">
                Share this QR code on business materials, email signatures, or
                presentations.
              </p>
              {qrImageUrl && (
                <a
                  href={qrImageUrl}
                  download={`qr-${username}.png`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" /> Download QR
                  </Button>
                </a>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics summary */}
      {!analyticsLoading && analytics.length > 0 && (
        <Card className="card-glow mb-8">
          <CardHeader>
            <CardTitle className="font-display text-lg">
              Analytics Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 rounded-lg bg-muted/50">
                <Smartphone className="w-5 h-5 text-primary mx-auto mb-1" />
                <div className="font-display text-2xl font-bold">
                  {stats.mobileViews}
                </div>
                <div className="text-xs text-muted-foreground mt-1">Mobile</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-muted/50">
                <Monitor className="w-5 h-5 text-primary mx-auto mb-1" />
                <div className="font-display text-2xl font-bold">
                  {stats.desktopViews}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Desktop
                </div>
              </div>
              <div className="text-center p-4 rounded-lg bg-muted/50">
                <QrCode className="w-5 h-5 text-primary mx-auto mb-1" />
                <div className="font-display text-2xl font-bold">
                  {stats.qrViews}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  QR Scans
                </div>
              </div>
              <div className="text-center p-4 rounded-lg bg-muted/50">
                <Wifi className="w-5 h-5 text-primary mx-auto mb-1" />
                <div className="font-display text-2xl font-bold">
                  {stats.nfcTaps}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  NFC Taps
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Leads table */}
      <Card className="card-glow">
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <CardTitle className="font-display text-lg flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" /> Collected Leads
            </CardTitle>
            {leads.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => exportToCSV(leads, username)}
                data-ocid="dashboard.export_csv_button"
              >
                <Download className="w-4 h-4 mr-2" /> Export CSV
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {leadsLoading ? (
            <div data-ocid="dashboard.loading_state" className="space-y-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-12 rounded" />
              ))}
            </div>
          ) : leads.length === 0 ? (
            <div
              className="text-center py-12 text-muted-foreground"
              data-ocid="dashboard.leads.empty_state"
            >
              <AlertCircle className="w-10 h-10 mx-auto mb-3 text-muted-foreground/50" />
              <p className="font-medium">No leads yet</p>
              <p className="text-sm mt-1">
                Share your card to start collecting contacts
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table data-ocid="dashboard.leads_table">
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Captured</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leads.map((lead, i) => (
                    <TableRow
                      key={`lead-${lead.email}-${lead.capturedAt}`}
                      data-ocid={`dashboard.leads.item.${i + 1}`}
                    >
                      <TableCell className="font-medium">{lead.name}</TableCell>
                      <TableCell>{lead.phone}</TableCell>
                      <TableCell>{lead.email}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {new Date(
                          Number(lead.capturedAt) / 1_000_000,
                        ).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
