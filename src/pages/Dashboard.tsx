import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { 
  Upload, 
  FileText, 
  Briefcase, 
  ArrowRight, 
  X,
  Sparkles,
  Linkedin,
  Link,
  Loader2
} from "lucide-react";
import { Input } from "@/components/ui/input";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { useProfile } from "@/hooks/useProfile";
import { useToast } from "@/hooks/use-toast";

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

const Dashboard = () => {
  const navigate = useNavigate();
  const { profile } = useProfile();
  const { toast } = useToast();
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [inputMethod, setInputMethod] = useState<"pdf" | "linkedin">("pdf");
  const [jobDescription, setJobDescription] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Load target role from profile
  useEffect(() => {
    if (profile?.target_role) {
      setTargetRole(profile.target_role);
    }
  }, [profile]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setResumeFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setResumeFile(e.target.files[0]);
    }
  };

  const isValidLinkedinUrl = (url: string) => {
    return url.match(/^(https?:\/\/)?(www\.)?linkedin\.com\/(in|pub)\/[a-zA-Z0-9_-]+\/?$/i);
  };

  const extractSkillsFromResume = async (file: File): Promise<string[]> => {
    const formData = new FormData();
    formData.append("resume", file);

    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/extract-skills`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: formData,
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to extract skills");
    }

    const data = await response.json();
    return data.skills || [];
  };

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    
    try {
      let extractedSkills: string[] = [];
      
      // Extract skills from PDF if uploaded
      if (inputMethod === "pdf" && resumeFile) {
        toast({
          title: "Analyzing your resume...",
          description: "Extracting skills from your document",
        });
        extractedSkills = await extractSkillsFromResume(resumeFile);
        toast({
          title: "Skills extracted!",
          description: `Found ${extractedSkills.length} skills in your resume`,
        });
      }

      // Store data in sessionStorage for the results page
      sessionStorage.setItem('careerData', JSON.stringify({
        hasResume: !!resumeFile,
        linkedinUrl: inputMethod === "linkedin" ? linkedinUrl : "",
        jobDescription,
        selectedSkills: extractedSkills,
        targetRole
      }));
      navigate('/results');
    } catch (error) {
      console.error("Error analyzing:", error);
      toast({
        title: "Analysis failed",
        description: error instanceof Error ? error.message : "Failed to analyze resume",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const hasValidInput = inputMethod === "pdf" 
    ? !!resumeFile
    : isValidLinkedinUrl(linkedinUrl);

  const isFormValid = hasValidInput && targetRole;

  return (
    <div className="min-h-screen">
      <DashboardHeader />

      <main className="pt-24 pb-12 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Page Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50 border border-border/50 backdrop-blur-sm mb-6">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground">Career Analysis Dashboard</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Let's <span className="gradient-text">architect</span> your career
            </h1>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Upload your resume, describe your target role, and let our AI identify 
              skill gaps and generate a personalized project blueprint.
            </p>
          </div>

          <div className="space-y-6">
            {/* Resume/LinkedIn Input */}
            <div className="glass-card p-6">
              {/* Toggle between PDF and LinkedIn */}
              <div className="flex items-center gap-2 mb-6">
                <button
                  onClick={() => setInputMethod("pdf")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-all duration-200 ${
                    inputMethod === "pdf"
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-muted/50 border-border text-foreground hover:bg-muted'
                  }`}
                >
                  <Upload className="w-4 h-4" />
                  Upload PDF
                </button>
                <button
                  onClick={() => setInputMethod("linkedin")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-all duration-200 ${
                    inputMethod === "linkedin"
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-muted/50 border-border text-foreground hover:bg-muted'
                  }`}
                >
                  <Linkedin className="w-4 h-4" />
                  LinkedIn Profile
                </button>
              </div>

              {inputMethod === "pdf" ? (
                <>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Upload className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold">Upload Resume</h2>
                      <p className="text-sm text-muted-foreground">PDF format recommended</p>
                    </div>
                  </div>

                  <div
                    className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
                      dragActive 
                        ? 'border-primary bg-primary/5' 
                        : resumeFile 
                          ? 'border-success bg-success/5' 
                          : 'border-border hover:border-muted-foreground'
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                  >
                    {resumeFile ? (
                      <div className="flex items-center justify-center gap-3">
                        <FileText className="w-8 h-8 text-success" />
                        <div className="text-left">
                          <p className="font-medium text-foreground">{resumeFile.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {(resumeFile.size / 1024).toFixed(1)} KB
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setResumeFile(null)}
                          className="ml-4"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                        <p className="text-foreground font-medium mb-1">
                          Drag and drop your resume here
                        </p>
                        <p className="text-sm text-muted-foreground mb-4">
                          or click to browse
                        </p>
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx"
                          onChange={handleFileChange}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                      </>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-[#0A66C2]/10 flex items-center justify-center">
                      <Linkedin className="w-5 h-5 text-[#0A66C2]" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold">LinkedIn Profile</h2>
                      <p className="text-sm text-muted-foreground">We'll analyze your public profile</p>
                    </div>
                  </div>

                  <div className="relative">
                    <Link className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      type="url"
                      value={linkedinUrl}
                      onChange={(e) => setLinkedinUrl(e.target.value)}
                      placeholder="https://linkedin.com/in/your-profile"
                      className="pl-11 h-12 bg-muted/50 border-border"
                    />
                  </div>
                  {linkedinUrl && !isValidLinkedinUrl(linkedinUrl) && (
                    <p className="text-sm text-destructive mt-2">
                      Please enter a valid LinkedIn profile URL
                    </p>
                  )}
                  {linkedinUrl && isValidLinkedinUrl(linkedinUrl) && (
                    <p className="text-sm text-success mt-2 flex items-center gap-1">
                      ✓ Valid LinkedIn URL
                    </p>
                  )}
                </>
              )}
            </div>

            {/* Job Description */}
            <div className="glass-card p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-secondary" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">Job Description</h2>
                  <p className="text-sm text-muted-foreground">Paste the job posting you're targeting</p>
                </div>
              </div>

              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the job description here... We'll analyze the requirements and compare them with your skills."
                className="w-full h-32 bg-muted/50 border border-border rounded-lg p-4 text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              />
            </div>


            {/* Target Role */}
            <div className="glass-card p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                  <Briefcase className="w-5 h-5 text-warning" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">Target Role</h2>
                  <p className="text-sm text-muted-foreground">What's your dream position?</p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
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

            {/* Submit Button */}
            <div className="text-center pt-4">
              <Button
                variant="hero"
                size="xl"
                onClick={handleAnalyze}
                disabled={!isFormValid || isAnalyzing}
                className="group"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Analyzing Resume...
                  </>
                ) : (
                  <>
                    Generate My Engineering Blueprint
                    <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </Button>
              {!isFormValid && !isAnalyzing && (
                <p className="text-sm text-muted-foreground mt-3">
                  Please upload a resume or enter LinkedIn URL, and choose a target role
                </p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
