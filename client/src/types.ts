export type PlanTripSuccess = {
  status: "success";
  trip_plan: string;
  intermediate_steps?: unknown[];
};

export type PlanTripError = {
  status: "error";
  error_message: string;
  trip_plan?: null;
};

export type PlanTripResult = PlanTripSuccess | PlanTripError;

export type ChatRole = "user" | "assistant";

export type ChatMessage = {
  role: ChatRole;
  content: string;
};

