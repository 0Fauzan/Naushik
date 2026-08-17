import "dotenv/config";
import postgres from "postgres";

const url = process.env.DATABASE_URL!;
const sql = postgres(url, { ssl: "require", prepare: false });

async function main() {
  try {
    // Fix admin user role
    const result = await sql`
      UPDATE users SET role = 'admin', name = 'Admin' 
      WHERE email = 'admin@naushik.co'
      RETURNING id, email, role, name
    `;
    console.log("Updated admin:", result);

    // Also fix manager role
    const result2 = await sql`
      UPDATE users SET role = 'site', name = 'Site Manager' 
      WHERE email = 'manager@naushik.co'
      RETURNING id, email, role, name
    `;
    console.log("Updated manager:", result2);
  } catch (e: any) {
    console.error("ERROR:", e.message);
  } finally {
    await sql.end();
  }
}

main();
