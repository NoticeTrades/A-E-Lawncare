function getSupabaseClient() {
  const projectUrl = window.AE_SUPABASE_URL || "";
  const anonKey = window.AE_SUPABASE_ANON_KEY || "";

  if (!projectUrl || !anonKey || !window.supabase) {
    return null;
  }

  try {
    const parsed = new URL(projectUrl);
    if (!/^https?:$/.test(parsed.protocol)) {
      return null;
    }
  } catch {
    return null;
  }

  if (!window.__aeSupabaseClient) {
    window.__aeSupabaseClient = window.supabase.createClient(projectUrl, anonKey);
  }

  return window.__aeSupabaseClient;
}
