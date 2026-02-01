import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const VERSION = "v1.0.1";
const DEPLOYED_AT = new Date().toISOString();

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ProjectIdea {
  title: string;
  description: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  estimatedTime: string;
  skillsToLearn: string[];
  techStack: string[];
  learningOutcomes: string[];
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { targetRole, currentSkills, missingSkills, projectCount = 3 } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are an expert career mentor and technical architect. Your role is to generate unique, practical project ideas that help developers bridge their skill gaps and prepare for their target roles.

Each project should:
- Be specific and actionable (not generic like "build a todo app")
- Directly address the missing skills
- Be realistic to complete within the estimated time
- Provide meaningful portfolio value
- Include modern, industry-relevant technologies

You must respond with valid JSON only, no markdown or extra text.`;

    const userPrompt = `Generate ${projectCount} unique project ideas for someone targeting the role of "${targetRole}".

Current Skills: ${currentSkills?.join(", ") || "Not specified"}
Missing Skills to Address: ${missingSkills?.join(", ") || "Various skills needed"}

Return a JSON array of project objects with this exact structure:
{
  "projects": [
    {
      "title": "Project Name",
      "description": "2-3 sentence description of what the project does and why it's valuable",
      "difficulty": "beginner" | "intermediate" | "advanced",
      "estimatedTime": "e.g., 2-3 weeks",
      "skillsToLearn": ["skill1", "skill2"],
      "techStack": ["tech1", "tech2"],
      "learningOutcomes": ["outcome1", "outcome2", "outcome3"]
    }
  ]
}

Make each project unique, creative, and directly relevant to the ${targetRole} role. Focus on projects that would impress in an interview.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No content in AI response");
    }

    // Parse the JSON response
    let projects: ProjectIdea[];
    try {
      // Try to extract JSON from the response (handles markdown code blocks)
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        projects = parsed.projects || parsed;
      } else {
        throw new Error("No JSON found in response");
      }
    } catch (parseError) {
      console.error("Failed to parse AI response:", content);
      throw new Error("Failed to parse AI response");
    }

    return new Response(JSON.stringify({ projects }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error generating projects:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Failed to generate projects" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
