import { ChatGroq } from "@langchain/groq";
import { createReactAgent } from "@langchain/langgraph/prebuilt";

import { travelTools } from "./tools.js";

export type PlanTripSuccess = {
  status: "success";
  trip_plan: string;
  intermediate_steps: unknown[];
};

export type PlanTripError = {
  status: "error";
  error_message: string;
  trip_plan: null;
};

export type PlanTripResult = PlanTripSuccess | PlanTripError;

let agent: ReturnType<typeof createReactAgent> | null = null;

function getAgent() {
  if (agent) return agent;

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("Missing GROQ_API_KEY. Set it in your environment or .env file.");
  }

  const llm = new ChatGroq({
    apiKey,
    model: "llama-3.3-70b-versatile",
    temperature: 0.7
  });

  agent = createReactAgent({ llm, tools: travelTools });
  return agent;
}

export async function planTrip(userRequest: string): Promise<PlanTripResult> {
  try {
    const compiledAgent = getAgent();
    const result: any = await compiledAgent.invoke({
      messages: [{ role: "user", content: userRequest }]
    });

    const messages: any[] = Array.isArray(result?.messages) ? result.messages : [];
    const lastWithContent = [...messages].reverse().find((m) => typeof m?.content === "string");
    const tripPlan = (lastWithContent?.content as string) ?? "";

    return { status: "success", trip_plan: tripPlan, intermediate_steps: [] };
  } catch (err: any) {
    return {
      status: "error",
      error_message: err?.message ? String(err.message) : String(err),
      trip_plan: null
    };
  }
}

