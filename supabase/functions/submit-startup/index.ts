import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const allowedOrigins = new Set([
  "https://heysiddhartha.github.io",
  "http://localhost:5173",
  "http://localhost:4173"
]);

const corsHeaders = (origin: string | null) => ({
  "Access-Control-Allow-Origin": origin && allowedOrigins.has(origin) ? origin : "https://heysiddhartha.github.io",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json"
});

const json = (body: unknown, status = 200, origin: string | null = null) =>
  new Response(JSON.stringify(body), { status, headers: corsHeaders(origin) });

const clean = (value: unknown, max = 500) => String(value ?? "").trim().slice(0, max);

Deno.serve(async req => {
  const origin = req.headers.get("origin");
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders(origin) });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405, origin);
  if (origin && !allowedOrigins.has(origin)) return json({ error: "Origin not allowed" }, 403, origin);

  try {
    const body = await req.json();
    const startup_name = clean(body?.startup_name, 160);
    const website = clean(body?.website, 500);

    if (!startup_name || !website) return json({ error: "startup_name and website are required" }, 400, origin);

    let parsedWebsite: URL;
    try {
      parsedWebsite = new URL(website);
      if (!["http:", "https:"].includes(parsedWebsite.protocol)) throw new Error();
    } catch {
      return json({ error: "A valid website URL is required" }, 400, origin);
    }

    if (clean(body?._company_website, 100)) {
      return json({ ok: true, message: "Submission received for review." }, 200, origin);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const normalizedWebsite = parsedWebsite.toString().replace(/\/$/, "").toLowerCase();

    const { data: existingByName } = await supabase
      .from("startups")
      .select("id,name,status")
      .ilike("name", startup_name)
      .limit(1);
    const { data: existingByWebsite } = await supabase
      .from("startups")
      .select("id,name,status")
      .ilike("website", normalizedWebsite)
      .limit(1);
    if ((existingByName?.length ?? 0) > 0 || (existingByWebsite?.length ?? 0) > 0) {
      return json({ error: "This startup already appears to be in the directory or under review." }, 409, origin);
    }

    const { data: pendingByName } = await supabase
      .from("submissions")
      .select("id,status")
      .ilike("startup_name", startup_name)
      .in("status", ["pending", "needs_review"])
      .limit(1);
    const { data: pendingByWebsite } = await supabase
      .from("submissions")
      .select("id,status")
      .ilike("website", normalizedWebsite)
      .in("status", ["pending", "needs_review"])
      .limit(1);
    if ((pendingByName?.length ?? 0) > 0 || (pendingByWebsite?.length ?? 0) > 0) {
      return json({ error: "We already have a submission for this startup under review." }, 409, origin);
    }

    const slugBase = startup_name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80) || "startup";
    let slug = slugBase;
    for (let i = 0; i < 5; i++) {
      const { data: slugMatch } = await supabase.from("startups").select("id").eq("slug", slug).limit(1);
      if (!slugMatch?.length) break;
      slug = `${slugBase}-${crypto.randomUUID().slice(0, 6)}`;
    }

    const { data: insertedStartup, error: startupError } = await supabase.from("startups").insert({
      name: startup_name,
      slug,
      website: normalizedWebsite,
      founder: clean(body?.founder, 200) || null,
      public_email: clean(body?.email, 254) || null,
      sector: clean(body?.sector, 120) || null,
      area: clean(body?.locality, 120) || "Kolkata",
      description: clean(body?.description, 1200) || null,
      linkedin_url: clean(body?.linkedin_url, 500) || null,
      careers_url: clean(body?.careers_url, 500) || null,
      lat: null,
      lng: null,
      location_confidence: "unknown",
      location_type: "kolkata_roots",
      verified: false,
      status: "needs_review",
      source_url: normalizedWebsite,
      verification_source_url: normalizedWebsite,
      verification_checked_at: new Date().toISOString(),
      last_checked_at: new Date().toISOString()
    }).select("id").single();

    if (startupError) return json({ error: "Could not publish the startup listing" }, 500, origin);

    const { data: inserted, error } = await supabase.from("submissions").insert({
      startup_name,
      website: normalizedWebsite,
      founder: clean(body?.founder, 200) || null,
      email: clean(body?.email, 254) || null,
      sector: clean(body?.sector, 120) || null,
      locality: clean(body?.locality, 120) || null,
      description: clean(body?.description, 1200) || null,
      linkedin_url: clean(body?.linkedin_url, 500) || null,
      careers_url: clean(body?.careers_url, 500) || null,
      status: "needs_review",
      reviewed_at: null, new Date().toISOString()
    }).select("id").single();

    if (error) {
      await supabase.from("startups").delete().eq("id", insertedStartup.id);
      return json({ error: "Could not complete the submission" }, 500, origin);
    }

    await supabase.from("audit_log").insert({
      actor_id: null,
      action: "submit_startup_for_review",
      entity_type: "startup",
      entity_id: insertedStartup.id,
      metadata: { submission_id: inserted.id, source: "public_submission", verified: false }
    });

    const reference = inserted?.id ? String(inserted.id).slice(0, 8).toUpperCase() : "KSM-" + crypto.randomUUID().slice(0, 8).toUpperCase();
    return json({
      ok: true,
      message: "Your startup has been submitted for review. It will appear in the directory after verification.",
      reference
    }, 201, origin);
  } catch {
    return json({ error: "Invalid request" }, 400, origin);
  }
});
