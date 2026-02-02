import { useState, useRef, useEffect } from "react";
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
  X,
  FileText,
  Upload,
  Trash2,
  ExternalLink
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
  const { profile, savedSkills, loading, updateProfile, saveSkills, uploadResume, deleteResume, getResumeUrl } = useProfile();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [displayName, setDisplayName] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [resumeUrl, setResumeUrl] = useState<string | null>(null);

  // Update local state when profile loads
  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || "");
      setTargetRole(profile.target_role || "");
    }
  }, [profile]);

  useEffect(() => {
    setSelectedSkills(savedSkills);
  }, [savedSkills]);

  useEffect(() => {
    const loadResumeUrl = async () => {
      if (profile?.resume_url) {
        const url = await getResumeUrl();
        setResumeUrl(url);
      } else {
        setResumeUrl(null);
      }
    };
    loadResumeUrl();
  }, [profile?.resume_url]);

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

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      return;
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      return;
    }

    setUploadingResume(true);
    const url = await uploadResume(file);
    if (url) {
      setResumeUrl(url);
    }
    setUploadingResume(false);
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDeleteResume = async () => {
    await deleteResume();
    setResumeUrl(null);
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

            {/* Resume */}
            <div className="glass-card p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-accent" />
                Resume
              </h2>
              
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleResumeUpload}
                accept=".pdf,.doc,.docx"
                className="hidden"
              />
              
              {profile?.resume_url ? (
                <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg border border-border">
                  <FileText className="w-8 h-8 text-primary" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">Resume uploaded</p>
                    <p className="text-sm text-muted-foreground">
                      {profile.resume_url.split('/').pop()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {resumeUrl && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(resumeUrl, '_blank')}
                      >
                        <ExternalLink className="w-4 h-4" />
                        View
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDeleteResume}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 hover:bg-muted/30 transition-all duration-200"
                >
                  {uploadingResume ? (
                    <Loader2 className="w-8 h-8 mx-auto mb-3 animate-spin text-primary" />
                  ) : (
                    <Upload className="w-8 h-8 mx-auto mb-3 text-muted-foreground" />
                  )}
                  <p className="font-medium mb-1">
                    {uploadingResume ? 'Uploading...' : 'Upload your resume'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    PDF, DOC, or DOCX (max 10MB)
                  </p>
                </div>
              )}
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
