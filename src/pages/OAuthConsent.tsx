import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Shield, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";

interface AuthorizationDetails {
  client?: {
    name?: string;
    redirect_uri?: string;
    client_uri?: string;
  } | null;
  redirect_url?: string;
  redirect_to?: string;
  scopes?: string[];
  scope?: string;
}

interface OAuthApiResponse<T> {
  data?: T;
  error?: { message: string } | null;
}

const oauthApi = {
  getAuthorizationDetails: async (authorizationId: string): Promise<OAuthApiResponse<AuthorizationDetails>> => {
    const client = supabase.auth as typeof supabase.auth & {
      oauth?: {
        getAuthorizationDetails: (id: string) => Promise<OAuthApiResponse<AuthorizationDetails>>;
      };
    };
    if (client.oauth?.getAuthorizationDetails) {
      return client.oauth.getAuthorizationDetails(authorizationId);
    }
    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/auth/v1/oauth/authorizations/${encodeURIComponent(authorizationId)}`,
      {
        headers: {
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token ?? ""}`,
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
      },
    );
    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      return { error: { message: body.message || body.error_description || "Failed to load authorization details" } };
    }
    return { data: await response.json() };
  },
  approveAuthorization: async (authorizationId: string): Promise<OAuthApiResponse<{ redirect_url?: string; redirect_to?: string }>> => {
    const client = supabase.auth as typeof supabase.auth & {
      oauth?: {
        approveAuthorization: (id: string) => Promise<OAuthApiResponse<{ redirect_url?: string; redirect_to?: string }>>;
      };
    };
    if (client.oauth?.approveAuthorization) {
      return client.oauth.approveAuthorization(authorizationId);
    }
    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/auth/v1/oauth/authorizations/${encodeURIComponent(authorizationId)}/approve`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token ?? ""}`,
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          "Content-Type": "application/json",
        },
      },
    );
    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      return { error: { message: body.message || body.error_description || "Failed to approve authorization" } };
    }
    return { data: await response.json() };
  },
  denyAuthorization: async (authorizationId: string): Promise<OAuthApiResponse<{ redirect_url?: string; redirect_to?: string }>> => {
    const client = supabase.auth as typeof supabase.auth & {
      oauth?: {
        denyAuthorization: (id: string) => Promise<OAuthApiResponse<{ redirect_url?: string; redirect_to?: string }>>;
      };
    };
    if (client.oauth?.denyAuthorization) {
      return client.oauth.denyAuthorization(authorizationId);
    }
    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/auth/v1/oauth/authorizations/${encodeURIComponent(authorizationId)}/deny`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token ?? ""}`,
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          "Content-Type": "application/json",
        },
      },
    );
    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      return { error: { message: body.message || body.error_description || "Failed to deny authorization" } };
    }
    return { data: await response.json() };
  },
};

const OAuthConsent = () => {
  const [searchParams] = useSearchParams();
  const authorizationId = searchParams.get("authorization_id") ?? "";
  const { user, isLoading: authLoading } = useAuth();
  const [details, setDetails] = useState<AuthorizationDetails | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);

  const consentUrl = typeof window !== "undefined" ? window.location.pathname + window.location.search : "";

  useEffect(() => {
    let active = true;

    if (!authorizationId) {
      setError("Missing authorization request ID.");
      setLoading(false);
      return;
    }

    if (authLoading) return;

    if (!user) {
      const next = `/admin?next=${encodeURIComponent(consentUrl)}`;
      window.location.href = next;
      return;
    }

    (async () => {
      const { data, error: detailsError } = await oauthApi.getAuthorizationDetails(authorizationId);
      if (!active) return;
      if (detailsError) {
        setError(detailsError.message);
        setLoading(false);
        return;
      }
      const immediate = data?.redirect_url ?? data?.redirect_to;
      if (immediate && !data?.client) {
        window.location.href = immediate;
        return;
      }
      setDetails(data ?? null);
      setLoading(false);
    })();

    return () => {
      active = false;
    };
  }, [authorizationId, user, authLoading, consentUrl]);

  async function decide(approve: boolean) {
    setBusy(true);
    const { data, error: decisionError } = approve
      ? await oauthApi.approveAuthorization(authorizationId)
      : await oauthApi.denyAuthorization(authorizationId);
    if (decisionError) {
      setBusy(false);
      toast.error(decisionError.message);
      return;
    }
    const target = data?.redirect_url ?? data?.redirect_to;
    if (!target) {
      setBusy(false);
      setError("No redirect URL returned by the authorization server.");
      return;
    }
    window.location.href = target;
  }

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Memuat permintaan koneksi...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <XCircle className="h-5 w-5" />
              Koneksi gagal
            </CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (!details) return null;

  const clientName = details.client?.name || "Aplikasi pihak ketiga";
  const redirectUri = details.client?.redirect_uri || details.redirect_url || details.redirect_to || "-";
  const scopes = details.scopes ?? (details.scope ? details.scope.split(" ") : []);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="font-display text-2xl">Hubungkan {clientName}</CardTitle>
          <CardDescription>
            {clientName} meminta izin untuk mengakses ButuhSayur sebagai akun Anda.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="rounded-lg bg-muted p-4 space-y-3">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium">Akun yang terhubung</p>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium">Aplikasi klien</p>
                <p className="text-sm text-muted-foreground">{clientName}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium">Redirect URI</p>
                <p className="text-sm text-muted-foreground break-all">{redirectUri}</p>
              </div>
            </div>
            {scopes.length > 0 && (
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium">Scope</p>
                  <p className="text-sm text-muted-foreground">{scopes.join(", ")}</p>
                </div>
              </div>
            )}
          </div>

          <p className="text-sm text-muted-foreground text-center">
            Izin ini tidak mengabaikan kebijakan atau pembatasan admin di backend ButuhSayur.
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button variant="outline" className="flex-1" disabled={busy} onClick={() => decide(false)}>
              Tolak
            </Button>
            <Button className="flex-1" disabled={busy} onClick={() => decide(true)}>
              {busy ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Izinkan
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OAuthConsent;
