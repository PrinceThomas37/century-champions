import { redeemReward } from "@/lib/store";
import { errorResponse } from "@/lib/http";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = redeemReward({
      contractorId: body?.contractorId,
      rewardId: body?.rewardId,
    });
    return Response.json(result);
  } catch (err) {
    return errorResponse(err);
  }
}
