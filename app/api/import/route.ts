import { NextResponse } from "next/server";

import { getSupabaseServerClient } from "@/lib/supabase/server";

type ImportUnit = {
  unit_number: string;
  floor_plan_name: string;
  beds: number;
  baths: number;
  sq_ft?: number | null;
  price?: number | null;
  available_date?: string | null;
  move_in_special?: string | null;
  feature_tags?: string[] | null;
  source?: string | null;
  source_url?: string | null;
};

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "unknown";
}

function compositeKey(unit: ImportUnit) {
  const baths = String(unit.baths).replace(".", "_");
  const sq = unit.sq_ft ?? 0;
  return `${slugify(unit.floor_plan_name)}_${unit.beds}_${baths}_${sq}_${slugify(unit.unit_number)}`;
}

export async function POST(req: Request) {
  const expected = process.env.IMPORT_TOKEN;
  const provided = req.headers.get("x-import-token") || "";

  if (!expected) {
    return NextResponse.json(
      { error: "IMPORT_TOKEN is not set on the server" },
      { status: 500 }
    );
  }

  if (provided !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json(
      { error: "Supabase server client not configured" },
      { status: 500 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const units = (body as { units?: ImportUnit[] }).units;
  if (!Array.isArray(units) || units.length === 0) {
    return NextResponse.json(
      { error: "Body must be { units: ImportUnit[] }" },
      { status: 400 }
    );
  }

  const nowIso = new Date().toISOString();

  const results = {
    received: units.length,
    apartments_upserted: 0,
    floor_plans_created: 0,
    price_points_added: 0,
    errors: [] as string[],
  };

  for (const unit of units) {
    try {
      if (!unit.unit_number || !unit.floor_plan_name) continue;

      // 1) floor plan
      const { data: fpExisting, error: fpErr } = await supabase
        .from("floor_plans")
        .select("id")
        .eq("name", unit.floor_plan_name)
        .eq("beds", unit.beds)
        .eq("baths", unit.baths)
        .limit(1);

      if (fpErr) throw fpErr;

      let floor_plan_id: number | null = fpExisting?.[0]?.id ?? null;

      if (!floor_plan_id) {
        const { data: fpInsert, error: fpInsertErr } = await supabase
          .from("floor_plans")
          .insert({
            name: unit.floor_plan_name,
            beds: unit.beds,
            baths: unit.baths,
            sq_ft_min: unit.sq_ft ?? null,
            sq_ft_max: unit.sq_ft ?? null,
          })
          .select("id")
          .single();

        if (fpInsertErr) throw fpInsertErr;
        floor_plan_id = fpInsert.id;
        results.floor_plans_created += 1;
      }

      // 2) apartment
      const key = compositeKey(unit);

      const aptRow = {
        unit_number: unit.unit_number,
        floor_plan_id,
        composite_key: key,
        beds: unit.beds,
        baths: unit.baths,
        sq_ft: unit.sq_ft ?? null,
        current_price: unit.price ?? null,
        is_available: true,
        available_date: unit.available_date ?? null,
        move_in_special: unit.move_in_special ?? null,
        feature_tags: unit.feature_tags ?? [],
        source: unit.source ?? "manual",
        source_url: unit.source_url ?? null,
        last_seen_at: nowIso,
        first_seen_at: nowIso,
      };

      const { data: aptUpsert, error: aptErr } = await supabase
        .from("apartments")
        .upsert(aptRow, { onConflict: "composite_key" })
        .select("id")
        .single();

      if (aptErr) throw aptErr;
      results.apartments_upserted += 1;

      // 3) price history (only if changed vs latest)
      const apartment_id = aptUpsert.id as number;
      if (unit.price !== null && unit.price !== undefined) {
        const { data: lastPrice } = await supabase
          .from("price_history")
          .select("price")
          .eq("apartment_id", apartment_id)
          .order("recorded_at", { ascending: false })
          .limit(1);

        const previous = lastPrice?.[0]?.price ?? null;
        if (previous === null || Number(previous) !== Number(unit.price)) {
          const { error: phErr } = await supabase.from("price_history").insert({
            apartment_id,
            price: unit.price,
            move_in_special: unit.move_in_special ?? null,
            source: unit.source ?? "manual",
            recorded_at: nowIso,
          });
          if (!phErr) results.price_points_added += 1;
        }
      }
    } catch (err) {
      results.errors.push(String(err));
    }
  }

  return NextResponse.json({ ok: true, results });
}
