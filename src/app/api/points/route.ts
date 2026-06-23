import { awardPoints } from "@/lib/store";
import { errorResponse } from "@/lib/http";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const contractor = awardPoints({
      contractorId: body?.contractorId,
      amount: body?.amount,
      reason: body?.reason,
    });
    return Response.json(contractor);
  } catch (err) {
    return errorResponse(err);
  }
}
