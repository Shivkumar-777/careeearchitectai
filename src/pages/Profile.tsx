import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/contexts/AuthContext";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  Mail, 
  Briefcase, 
  Loader2,
  Save,
  X
} from "lucide-react";

const popularSkills = [
  "JavaScript", "TypeScript", "React", "Node.js", "Python", 
  "Java", "Spring Boot", "AWS", "Docker", "Kubernetes",
  "PostgreSQL", "MongoDB", "Redis", "GraphQL", "REST APIs",
  "CI/CD", "Git", "Agile", "SQL", "Linux"
];

const targetRoles = [
  "Backend Developer",
  "Frontend Developer",
  "Full Stack Developer",
  "Data Engineer",
  "DevOps Engineer",
  "Cloud Architect",
  "Site Reliability Engineer",
  "Machine Learning Engineer",
  "Software Architect",
  "Engineering Manager"
];

const Profile = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile, savedSkills, loading, updateProfile, saveSkills } = useProfile();
  
  const [displayName, setDisplayName] = useState(profile?.display_name || "");
  const [targetRole, setTargetRole] = useState(profile?.target_role || "");
  const [selectedSkills, setSelectedSkills] = useState<string[]>(savedSkills);
  const [saving, setSaving] = useState(false);

  // Update local state when profile loads
  useState(() => {
    if (profile) {
      setDisplayName(profile.display_name || "");
      setTargetRole(profile.target_role || "");
    }
  });

  useState(() => {
    setSelectedSkills(savedSkills);
  });

  const toggleSkill = (skill: string) => {
    setSelectedSkills(prev => 
      prev.includes(skill) 
        ? prev.filter(s => s !== skill)
        : [...prev, skill]
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProfile({ display_name: displayName, target_role: targetRole });
      await saveSkills(selectedSkills);
    } finally {
      setSaving(false);
    }
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
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Profile Settings</h1>
            <p className="text-muted-foreground">
              Manage your career profile and preferences
            </p>
          </div>

          <div className="space-y-6">
            {/* Basic Info */}
            <div className="glass-card p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                Basic Information
              </h2>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      value={user?.email || ""}
                      disabled
                      className="pl-10 bg-muted/50"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="displayName">Display Name</Label>
                  <Input
                    id="displayName"
                    placeholder="Your name"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Target Role */}
            <div className="glass-card p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-secondary" />
                Target Role
              </h2>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {targetRoles.map((role) => (
                  <button
                    key={role}
                    onClick={() => setTargetRole(role)}
                    className={`px-4 py-3 rounded-lg border text-sm font-medium transition-all duration-200 ${
                      targetRole === role
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-muted/50 border-border text-foreground hover:bg-muted'
                    }`}
                  >
                    {role}
                  </button>
                ))}
              </div>
            </div>

            {/* Skills */}
            <div className="glass-card p-6">
              <h2 className="text-lg font-semibold mb-4">Your Skills</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Select the skills you already have
              </p>
              
              <div className="flex flex-wrap gap-2">
                {popularSkills.map((skill) => (
                  <Badge
                    key={skill}
                    variant={selectedSkills.includes(skill) ? "default" : "outline"}
                    className={`cursor-pointer transition-all duration-200 ${
                      selectedSkills.includes(skill)
                        ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                        : 'hover:bg-muted'
                    }`}
                    onClick={() => toggleSkill(skill)}
                  >
                    {skill}
                    {selectedSkills.includes(skill) && (
                      <X className="w-3 h-3 ml-1" />
                    )}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3">
              <Button variant="outline" onClick={() => navigate('/dashboard')}>
                Cancel
              </Button>
              <Button variant="hero" onClick={handleSave} disabled={saving}>
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;
