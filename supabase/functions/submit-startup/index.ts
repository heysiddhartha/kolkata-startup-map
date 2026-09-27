import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json"
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: cors });

Deno.serve(async req => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const body = await req.json();
    for (const key of ["startup_name", "website"]) {
      if (!String(body?.[key] ?? "").trim()) return json({ error: key + " is required" }, 400);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!
    );

    const { error } = await supabase.from("submissions").insert({
      startup_name: String(body.startup_name).trim(),
      website: String(body.website).trim(),
      founder: body.founder || null,
      email: body.email || null,
      sector: body.sector || null,
      locality: body.locality || null,
      description: body.description || null,
      linkedin_url: body.linkedin_url || null,
      careers_url: body.careers_url || null,
      status: "pending"
    });

    if (error) return json({ error: "Could not save submission" }, 500);
    return json({ ok: true, message: "Submission received for review." });
  } catch {
    return json({ error: "Invalid request" }, 400);
  }
});
