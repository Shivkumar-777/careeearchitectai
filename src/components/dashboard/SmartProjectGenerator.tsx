import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Loader2, Clock, BookOpen, Code, ChevronRight, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ProjectIdea {
  title: string;
  description: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  estimatedTime: string;
  skillsToLearn: string[];
  techStack: string[];
  learningOutcomes: string[];
}

interface SmartProjectGeneratorProps {
  targetRole: string;
  currentSkills: string[];
  missingSkills: string[];
  onSelectProject?: (project: ProjectIdea) => void;
}

const difficultyColors = {
  beginner: "bg-green-500/10 text-green-500 border-green-500/20",
  intermediate: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  advanced: "bg-red-500/10 text-red-500 border-red-500/20",
};

const SmartProjectGenerator = ({
  targetRole,
  currentSkills,
  missingSkills,
  onSelectProject,
}: SmartProjectGeneratorProps) => {
  const [projects, setProjects] = useState<ProjectIdea[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const generateProjects = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: funcError } = await supabase.functions.invoke("generate-projects", {
        body: {
          targetRole,
          currentSkills,
          missingSkills,
          projectCount: 3,
        },
      });

      if (funcError) {
        throw new Error(funcError.message);
      }

      if (data.error) {
        throw new Error(data.error);
      }

      setProjects(data.projects);
      toast({
        title: "Projects Generated!",
        description: `${data.projects.length} tailored project ideas created for you.`,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to generate projects";
      setError(message);
      toast({
        title: "Generation Failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Smart Project Generator</h3>
            <p className="text-sm text-muted-foreground">
              AI-powered project ideas tailored to your skill gaps
            </p>
          </div>
        </div>
        <Button
          onClick={generateProjects}
          disabled={loading}
          variant={projects.length > 0 ? "outline" : "default"}
          className="gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Generating...
            </>
          ) : projects.length > 0 ? (
            <>
              <RefreshCw className="w-4 h-4" />
              Regenerate
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Generate Projects
            </>
          )}
        </Button>
      </div>

      {/* Error State */}
      {error && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="pt-6">
            <p className="text-sm text-destructive">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {!loading && projects.length === 0 && !error && (
        <Card className="border-dashed">
          <CardContent className="pt-6 pb-6 text-center">
            <Sparkles className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
            <h4 className="font-medium mb-2">No Projects Generated Yet</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Click "Generate Projects" to get AI-powered project ideas based on your skill gaps
              for the {targetRole} role.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {loading && (
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-5 bg-muted rounded w-2/3" />
                <div className="h-4 bg-muted rounded w-full mt-2" />
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 mb-4">
                  <div className="h-6 bg-muted rounded w-20" />
                  <div className="h-6 bg-muted rounded w-24" />
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-muted rounded w-full" />
                  <div className="h-3 bg-muted rounded w-4/5" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Project Cards */}
      {!loading && projects.length > 0 && (
        <div className="grid gap-4">
          {projects.map((project, index) => (
            <Card
              key={index}
              className="group hover:border-primary/50 transition-colors cursor-pointer"
              onClick={() => onSelectProject?.(project)}
            >
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <CardTitle className="text-lg group-hover:text-primary transition-colors">
                      {project.title}
                    </CardTitle>
                    <CardDescription className="mt-1">{project.description}</CardDescription>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Metadata */}
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className={difficultyColors[project.difficulty]}>
                    {project.difficulty}
                  </Badge>
                  <Badge variant="outline" className="gap-1">
                    <Clock className="w-3 h-3" />
                    {project.estimatedTime}
                  </Badge>
                </div>

                {/* Tech Stack */}
                <div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                    <Code className="w-3 h-3" />
                    Tech Stack
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {project.techStack.map((tech, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">
                        {tech}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Skills to Learn */}
                <div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                    <BookOpen className="w-3 h-3" />
                    Skills You'll Learn
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {project.skillsToLearn.map((skill, i) => (
                      <Badge
                        key={i}
                        variant="outline"
                        className="text-xs bg-primary/5 border-primary/20 text-primary"
                      >
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Learning Outcomes */}
                <div>
                  <div className="text-xs text-muted-foreground mb-2">Learning Outcomes:</div>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {project.learningOutcomes.slice(0, 3).map((outcome, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        {outcome}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default SmartProjectGenerator;
