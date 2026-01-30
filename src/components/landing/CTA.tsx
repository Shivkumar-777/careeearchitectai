import { Button } from "@/components/ui/button";
import { ArrowRight, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";

const CTA = () => {
  const navigate = useNavigate();

  return (
    <section className="py-24 px-4 relative">
      <div className="max-w-4xl mx-auto relative">
        {/* Glow Effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-secondary/20 to-accent/20 blur-3xl" />
        
        {/* Card */}
        <div className="relative glass-card-elevated p-12 text-center gradient-border">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <Zap className="w-4 h-4 text-primary" />
            <span className="text-sm text-primary font-medium">Start your transformation today</span>
          </div>
          
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Ready to <span className="gradient-text">architect</span> your future?
          </h2>
          
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Join thousands of developers who've used AI-powered career blueprints 
            to land their dream jobs at top tech companies.
          </p>
          
          <Button 
            variant="hero" 
            size="xl" 
            onClick={() => navigate('/dashboard')}
            className="group"
          >
            Analyze My Career Now
            <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
          </Button>
          
          <p className="text-sm text-muted-foreground mt-4">
            No credit card required • Free skill analysis
          </p>
        </div>
      </div>
    </section>
  );
};

export default CTA;
