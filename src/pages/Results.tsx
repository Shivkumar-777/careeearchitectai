import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { 
  Compass, 
  ArrowRight, 
  CheckCircle2, 
  XCircle, 
  TrendingUp,
  Sparkles
} from "lucide-react";
import SmartProjectGenerator from "@/components/dashboard/SmartProjectGenerator";
import { 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar, 
  ResponsiveContainer,
  Legend
} from "recharts";

interface CareerData {
  hasResume: boolean;
  linkedinUrl?: string;
  jobDescription: string;
  selectedSkills?: string[];
  targetRole: string;
}

// Simulated skill gap analysis based on target role
const getSkillAnalysis = (targetRole: string, userSkills: string[]) => {
  const roleRequirements: Record<string, { required: string[]; nice: string[] }> = {
    "Backend Developer": {
      required: ["Java", "Spring Boot", "PostgreSQL", "REST APIs", "Docker", "Git", "CI/CD"],
      nice: ["Kafka", "Kubernetes", "Redis", "Microservices", "AWS"]
    },
    "Frontend Developer": {
      required: ["JavaScript", "TypeScript", "React", "HTML/CSS", "Git", "REST APIs"],
      nice: ["Next.js", "GraphQL", "Testing", "Figma", "Tailwind"]
    },
    "Full Stack Developer": {
      required: ["JavaScript", "TypeScript", "React", "Node.js", "PostgreSQL", "Git", "REST APIs"],
      nice: ["Docker", "AWS", "CI/CD", "GraphQL", "Redis"]
    },
    "Data Engineer": {
      required: ["Python", "SQL", "Spark", "Kafka", "Airflow", "AWS", "Git"],
      nice: ["Scala", "Docker", "Kubernetes", "dbt", "Snowflake"]
    },
    "DevOps Engineer": {
      required: ["Docker", "Kubernetes", "CI/CD", "AWS", "Linux", "Git", "Terraform"],
      nice: ["Ansible", "Prometheus", "Grafana", "Python", "Jenkins"]
    },
    "Cloud Architect": {
      required: ["AWS", "Azure", "Docker", "Kubernetes", "Terraform", "Networking", "Security"],
      nice: ["GCP", "Serverless", "Cost Optimization", "Multi-cloud", "IaC"]
    },
  };

  const role = roleRequirements[targetRole] || roleRequirements["Backend Developer"];
  const allRequired = [...role.required, ...role.nice];
  
  const userSkillsLower = userSkills.map(s => s.toLowerCase());
  
  const hasSkill = (skill: string) => 
    userSkillsLower.some(us => 
      us.includes(skill.toLowerCase()) || skill.toLowerCase().includes(us)
    );

  const matched = allRequired.filter(hasSkill);
  const missing = allRequired.filter(skill => !hasSkill(skill));

  return {
    matched,
    missing,
    total: allRequired.length,
    matchPercentage: Math.round((matched.length / allRequired.length) * 100)
  };
};

const getRadarData = (targetRole: string, userSkills: string[]) => {
  const categories = [
    { name: "Backend", skills: ["Java", "Spring Boot", "Node.js", "Python", "Go"] },
    { name: "Frontend", skills: ["React", "JavaScript", "TypeScript", "Vue", "Angular"] },
    { name: "Database", skills: ["PostgreSQL", "MongoDB", "Redis", "SQL", "MySQL"] },
    { name: "DevOps", skills: ["Docker", "Kubernetes", "CI/CD", "Jenkins", "GitHub Actions"] },
    { name: "Cloud", skills: ["AWS", "Azure", "GCP", "Terraform", "CloudFormation"] },
    { name: "Architecture", skills: ["Microservices", "REST APIs", "GraphQL", "System Design", "Kafka"] }
  ];

  return categories.map(cat => {
    const userMatch = cat.skills.filter(skill => 
      userSkills.some(us => us.toLowerCase().includes(skill.toLowerCase()) || skill.toLowerCase().includes(us.toLowerCase()))
    ).length;
    const marketDemand = Math.floor(Math.random() * 20) + 70; // Simulated market demand

    return {
      category: cat.name,
      userSkills: (userMatch / cat.skills.length) * 100,
      marketDemand: marketDemand
    };
  });
};

const Results = () => {
  const navigate = useNavigate();
  const [careerData, setCareerData] = useState<CareerData | null>(null);
  const [analysis, setAnalysis] = useState<ReturnType<typeof getSkillAnalysis> | null>(null);
  const [radarData, setRadarData] = useState<ReturnType<typeof getRadarData>>([]);

  useEffect(() => {
    const stored = sessionStorage.getItem('careerData');
    if (stored) {
      const data = JSON.parse(stored) as CareerData;
      setCareerData(data);
      // Use selectedSkills if available, otherwise use empty array (skills will be extracted from resume/LinkedIn)
      const skills = data.selectedSkills || [];
      setAnalysis(getSkillAnalysis(data.targetRole, skills));
      setRadarData(getRadarData(data.targetRole, skills));
    } else {
      navigate('/dashboard');
    }
  }, [navigate]);

  if (!careerData || !analysis) {
    return null;
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div 
            className="flex items-center gap-2 cursor-pointer" 
            onClick={() => navigate('/')}
          >
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <Compass className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-foreground">
              Career<span className="gradient-text">Architect</span>
            </span>
          </div>
          <Button variant="outline" onClick={() => navigate('/dashboard')}>
            New Analysis
          </Button>
        </div>
      </header>

      <main className="pt-24 pb-12 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Page Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50 border border-border/50 backdrop-blur-sm mb-6">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground">Skill Gap Analysis Complete</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Your path to <span className="gradient-text">{careerData.targetRole}</span>
            </h1>
            <p className="text-muted-foreground max-w-xl mx-auto">
              We've analyzed your skills against market demands. Here's your personalized roadmap.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-6 mb-8">
            {/* Radar Chart */}
            <div className="glass-card p-6">
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Skills vs Market Demand
              </h2>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="hsl(var(--border))" />
                    <PolarAngleAxis 
                      dataKey="category" 
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    />
                    <PolarRadiusAxis 
                      angle={30} 
                      domain={[0, 100]}
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                    />
                    <Radar
                      name="Your Skills"
                      dataKey="userSkills"
                      stroke="hsl(var(--primary))"
                      fill="hsl(var(--primary))"
                      fillOpacity={0.3}
                    />
                    <Radar
                      name="Market Demand"
                      dataKey="marketDemand"
                      stroke="hsl(var(--secondary))"
                      fill="hsl(var(--secondary))"
                      fillOpacity={0.2}
                    />
                    <Legend 
                      wrapperStyle={{ 
                        paddingTop: '20px',
                        color: 'hsl(var(--foreground))'
                      }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Match Score */}
            <div className="glass-card p-6">
              <h2 className="text-xl font-semibold mb-6">Overall Match Score</h2>
              
              {/* Circular Progress */}
              <div className="flex items-center justify-center mb-6">
                <div className="relative w-40 h-40">
                  <svg className="w-full h-full -rotate-90">
                    <circle
                      cx="80"
                      cy="80"
                      r="70"
                      stroke="hsl(var(--muted))"
                      strokeWidth="10"
                      fill="none"
                    />
                    <circle
                      cx="80"
                      cy="80"
                      r="70"
                      stroke="url(#gradient)"
                      strokeWidth="10"
                      fill="none"
                      strokeLinecap="round"
                      strokeDasharray={`${analysis.matchPercentage * 4.4} 440`}
                    />
                    <defs>
                      <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="hsl(var(--primary))" />
                        <stop offset="100%" stopColor="hsl(var(--secondary))" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-4xl font-bold gradient-text">{analysis.matchPercentage}%</span>
                  </div>
                </div>
              </div>

              <div className="text-center">
                <p className="text-muted-foreground">
                  You have <span className="text-success font-semibold">{analysis.matched.length}</span> of{" "}
                  <span className="font-semibold">{analysis.total}</span> required skills
                </p>
              </div>
            </div>
          </div>

          {/* Skills Breakdown */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Skills You Have */}
            <div className="glass-card p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-success" />
                Skills You Have
              </h2>
              <div className="space-y-2">
                {analysis.matched.length > 0 ? (
                  analysis.matched.map((skill) => (
                    <div
                      key={skill}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg bg-success/10 border border-success/20"
                    >
                      <CheckCircle2 className="w-4 h-4 text-success" />
                      <span className="text-foreground">{skill}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-center py-4">
                    No matching skills detected
                  </p>
                )}
              </div>
            </div>

            {/* Missing Skills */}
            <div className="glass-card p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <XCircle className="w-5 h-5 text-destructive" />
                Skills to Acquire
              </h2>
              <div className="space-y-2">
                {analysis.missing.map((skill) => (
                  <div
                    key={skill}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg bg-destructive/10 border border-destructive/20"
                  >
                    <XCircle className="w-4 h-4 text-destructive" />
                    <span className="text-foreground">{skill}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Smart Project Generator */}
          <div className="glass-card p-6 mb-8">
            <SmartProjectGenerator
              targetRole={careerData.targetRole}
              currentSkills={analysis.matched}
              missingSkills={analysis.missing}
              onSelectProject={(project) => {
                // Store the selected project and navigate to blueprint
                sessionStorage.setItem('selectedProject', JSON.stringify(project));
                navigate('/blueprint');
              }}
            />
          </div>

          {/* CTA */}
          <div className="text-center">
            <Button
              variant="hero"
              size="xl"
              onClick={() => navigate('/blueprint')}
              className="group"
            >
              Generate Project Blueprint
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </Button>
            <p className="text-sm text-muted-foreground mt-3">
              Get a custom engineering project to fill your skill gaps
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Results;
