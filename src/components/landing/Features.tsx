import { 
  Brain, 
  Target, 
  FileSearch, 
  TrendingUp,
  Code2,
  Layers
} from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "Skill Gap Analysis",
    description: "AI analyzes your current skills against market demands and identifies exactly what you need to learn."
  },
  {
    icon: Code2,
    title: "Smart Project Generator",
    description: "Get custom engineering project blueprints designed to fill your skill gaps with real, portfolio-worthy work."
  },
  {
    icon: FileSearch,
    title: "Resume Parsing",
    description: "Upload your resume and let our AI extract and validate your technical skills automatically."
  },
  {
    icon: TrendingUp,
    title: "Market Trend Matching",
    description: "Stay ahead with real-time insights into which skills are in demand for your target roles."
  },
  {
    icon: Target,
    title: "Role Roadmaps",
    description: "Get step-by-step learning paths from your current position to your dream job."
  },
  {
    icon: Layers,
    title: "Architecture Blueprints",
    description: "Learn system design through custom project architectures tailored to industry standards."
  }
];

const Features = () => {
  return (
    <section className="py-24 px-4 relative">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-muted/20 to-transparent" />
      
      <div className="max-w-6xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Everything you need to <span className="gradient-text">level up</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            A complete toolkit for career transformation, powered by AI that understands the tech industry.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="glass-card p-6 hover-lift group"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-foreground">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
