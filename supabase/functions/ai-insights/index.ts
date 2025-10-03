import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { memberData } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Generating insights for member:", memberData.name);

    const prompt = `You are a professional health advisor analyzing real-time health data for a family member.

Member Information:
- Name: ${memberData.name}
- Age: ${memberData.age}
- Relationship: ${memberData.relationship}
- Health History: ${memberData.healthHistory}

Current Vitals:
- Heart Rate: ${memberData.heartRate} BPM
- Blood Pressure: ${memberData.bpSystolic}/${memberData.bpDiastolic} mmHg
- Steps Today: ${memberData.steps}

Analyze this data and provide:
1. A brief summary of their current health status
2. Specific, actionable recommendations for the caregiver

Keep your response professional, clear, and focused on actionable insights.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: "You are a professional health advisor. Provide clear, actionable health insights for caregivers monitoring their family members."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "provide_health_insights",
              description: "Provide health analysis summary and recommendations",
              parameters: {
                type: "object",
                properties: {
                  summary: {
                    type: "string",
                    description: "A brief summary of current health status"
                  },
                  recommendation: {
                    type: "string",
                    description: "Specific actionable recommendations for the caregiver"
                  }
                },
                required: ["summary", "recommendation"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "provide_health_insights" } }
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        console.error("Rate limit exceeded");
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        console.error("Payment required");
        return new Response(
          JSON.stringify({ error: "AI credits depleted. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI API error:", response.status, errorText);
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    console.log("AI response received");
    
    const toolCall = data.choices[0].message.tool_calls?.[0];
    if (toolCall?.function?.arguments) {
      const insights = JSON.parse(toolCall.function.arguments);
      return new Response(
        JSON.stringify(insights),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    throw new Error("No insights generated");
  } catch (error) {
    console.error("Error in ai-insights function:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to generate insights";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});