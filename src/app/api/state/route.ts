import { getDashboard } from "@/lib/store";

export async function GET() {
  return Response.json(getDashboard());
}
