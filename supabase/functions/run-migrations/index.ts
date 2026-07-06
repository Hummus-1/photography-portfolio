import { withSupabase } from "npm:@supabase/server";
import postgres from "npm:postgres";

const dbUrl = Deno.env.get("SUPABASE_DB_URL")!;

export default {
  fetch: withSupabase({ auth: "secret" }, async (req) => {
    if (req.method !== "POST") {
      return Response.json({ error: "Method not allowed" }, { status: 405 });
    }

    try {
      const { sql: sqlQuery } = await req.json();
      if (!sqlQuery) {
        return Response.json({ error: "Missing SQL query in body" }, { status: 400 });
      }

      // Connect to the Postgres database directly (resolved on local network inside cloud)
      const sql = postgres(dbUrl);
      const result = await sql.unsafe(sqlQuery);
      await sql.end();

      return Response.json({ success: true, result });
    } catch (err: any) {
      console.error("SQL execution failed:", err);
      return Response.json({ error: err.message }, { status: 500 });
    }
  }),
};
