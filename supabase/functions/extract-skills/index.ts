import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const formData = await req.formData();
    const file = formData.get("resume") as File;
    
    if (!file) {
      return new Response(
        JSON.stringify({ error: "No resume file provided" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Read file content as text (for PDF, we'll extract what we can)
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    
    // Convert PDF to base64 for AI processing
    const base64 = btoa(String.fromCharCode(...uint8Array));
    
    // Use Lovable AI to extract skills from the resume
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `You are a resume parser specialized in extracting technical skills. 
            Extract all technical skills, programming languages, frameworks, tools, and technologies from the resume.
            Return ONLY a JSON object with a "skills" array containing the skill names.
            Be comprehensive but only include actual technical/professional skills.
            Example response: {"skills": ["JavaScript", "React", "Node.js", "PostgreSQL", "Docker", "AWS"]}`
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Extract all technical skills from this resume. Return only a JSON object with a skills array."
              },
              {
                type: "file",
                file: {
                  filename: file.name,
                  file_data: `data:application/pdf;base64,${base64}`
                }
              }
            ]
          }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "extract_skills",
              description: "Extract technical skills from a resume",
              parameters: {
                type: "object",
                properties: {
                  skills: {
                    type: "array",
                    items: { type: "string" },
                    description: "List of technical skills found in the resume"
                  }
                },
                required: ["skills"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "extract_skills" } }
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const aiResponse = await response.json();
    console.log("AI Response:", JSON.stringify(aiResponse, null, 2));
    
    // Extract skills from tool call response
    let skills: string[] = [];
    
    if (aiResponse.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments) {
      const args = JSON.parse(aiResponse.choices[0].message.tool_calls[0].function.arguments);
      skills = args.skills || [];
    } else if (aiResponse.choices?.[0]?.message?.content) {
      // Fallback: try to parse JSON from content
      try {
        const content = aiResponse.choices[0].message.content;
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          skills = parsed.skills || [];
        }
      } catch (e) {
        console.error("Failed to parse skills from content:", e);
      }
    }

    return new Response(
      JSON.stringify({ skills }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error extracting skills:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Failed to extract skills" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
