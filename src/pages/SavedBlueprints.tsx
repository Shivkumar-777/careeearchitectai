import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useProfile } from "@/hooks/useProfile";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { 
  FileText, 
  Trash2, 
  ArrowRight, 
  Plus,
  Loader2,
  FolderOpen
} from "lucide-react";
import { format } from "date-fns";

const SavedBlueprints = () => {
  const navigate = useNavigate();
  const { savedBlueprints, loading, deleteBlueprint } = useProfile();

  const handleViewBlueprint = (blueprint: typeof savedBlueprints[0]) => {
    // Store blueprint data and navigate to view
    sessionStorage.setItem('blueprintData', JSON.stringify(blueprint.blueprint_data));
    sessionStorage.setItem('careerData', JSON.stringify({
      selectedSkills: blueprint.skills_used,
      targetRole: blueprint.target_role,
    }));
    navigate('/blueprint');
  };

  // Helper to safely get array from Json
  const getMissingSkillsArray = (skills: unknown): string[] => {
    if (Array.isArray(skills)) return skills as string[];
    return [];
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <DashboardHeader />
        <main className="pt-24 pb-12 px-4 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <DashboardHeader />
      
      <main className="pt-24 pb-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">My Blueprints</h1>
              <p className="text-muted-foreground">
                Your saved career project blueprints
              </p>
            </div>
            <Button variant="hero" onClick={() => navigate('/dashboard')}>
              <Plus className="w-4 h-4" />
              New Blueprint
            </Button>
          </div>

          {savedBlueprints.length === 0 ? (
            <div className="glass-card p-12 text-center">
              <FolderOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">No blueprints yet</h2>
              <p className="text-muted-foreground mb-6">
                Generate your first career blueprint to start tracking your progress
              </p>
              <Button variant="hero" onClick={() => navigate('/dashboard')}>
                Create Your First Blueprint
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {savedBlueprints.map((blueprint) => (
                <div 
                  key={blueprint.id} 
                  className="glass-card p-6 hover:border-primary/30 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <FileText className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg mb-1">{blueprint.title}</h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          Target: {blueprint.target_role}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Created {format(new Date(blueprint.created_at), 'MMM d, yyyy')}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleViewBlueprint(blueprint)}
                      >
                        View
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => deleteBlueprint(blueprint.id)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex flex-wrap gap-2">
                    {getMissingSkillsArray(blueprint.missing_skills).slice(0, 4).map((skill) => (
                      <span 
                        key={skill}
                        className="px-2 py-1 text-xs rounded-full bg-warning/10 text-warning border border-warning/20"
                      >
                        {skill}
                      </span>
                    ))}
                    {getMissingSkillsArray(blueprint.missing_skills).length > 4 && (
                      <span className="px-2 py-1 text-xs rounded-full bg-muted text-muted-foreground">
                        +{getMissingSkillsArray(blueprint.missing_skills).length - 4} more
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default SavedBlueprints;
