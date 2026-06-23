import { addContractor } from "@/lib/store";
import { errorResponse } from "@/lib/http";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const contractor = addContractor({
      name: body?.name,
      company: body?.company,
    });
    return Response.json(contractor, { status: 201 });
  } catch (err) {
    return errorResponse(err);
  }
}
