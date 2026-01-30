import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { 
  Compass, 
  Download, 
  CheckCircle2,
  Code2,
  Database,
  Cloud,
  Layers,
  ArrowRight,
  Sparkles,
  MessageSquare,
  Trophy
} from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface CareerData {
  hasResume: boolean;
  jobDescription: string;
  selectedSkills: string[];
  targetRole: string;
}

// Project blueprints based on target roles
const projectBlueprints: Record<string, {
  title: string;
  problem: string;
  techStack: { name: string; icon: React.ComponentType<{ className?: string }> }[];
  phases: { title: string; tasks: string[]; duration: string }[];
  interviewQuestions: string[];
}> = {
  "Backend Developer": {
    title: "Build a Distributed Real-Time Stock Ticker System",
    problem: "Design and implement a scalable microservices architecture that handles real-time stock market data, processes millions of events per second, and provides low-latency APIs for frontend consumers. This project demonstrates proficiency in event-driven architecture, distributed systems, and modern DevOps practices.",
    techStack: [
      { name: "Java Spring Boot", icon: Code2 },
      { name: "Apache Kafka", icon: Layers },
      { name: "PostgreSQL", icon: Database },
      { name: "Docker & Kubernetes", icon: Cloud },
      { name: "Redis", icon: Database },
      { name: "React Dashboard", icon: Code2 }
    ],
    phases: [
      {
        title: "Setup Backend Foundation",
        tasks: [
          "Initialize Spring Boot project with required dependencies",
          "Set up PostgreSQL database with proper schema design",
          "Implement REST API endpoints for stock data",
          "Add authentication with JWT tokens"
        ],
        duration: "Week 1-2"
      },
      {
        title: "Microservices Integration",
        tasks: [
          "Break monolith into microservices (Price Service, Order Service, User Service)",
          "Implement service discovery with Eureka",
          "Set up API Gateway with rate limiting",
          "Add circuit breaker patterns with Resilience4j"
        ],
        duration: "Week 3-4"
      },
      {
        title: "Event Streaming with Kafka",
        tasks: [
          "Set up Kafka cluster with Zookeeper",
          "Implement event producers for real-time price updates",
          "Create consumer groups for processing",
          "Add dead letter queue for failed messages"
        ],
        duration: "Week 5-6"
      },
      {
        title: "Deployment & Monitoring",
        tasks: [
          "Containerize services with Docker",
          "Create Kubernetes manifests for deployment",
          "Set up CI/CD pipeline with GitHub Actions",
          "Implement monitoring with Prometheus & Grafana"
        ],
        duration: "Week 7-8"
      }
    ],
    interviewQuestions: [
      "How would you ensure exactly-once delivery in your Kafka implementation?",
      "Explain your database schema design and normalization decisions.",
      "How does your system handle backpressure during high-volume periods?",
      "Walk me through your CI/CD pipeline and deployment strategy.",
      "How would you scale this system to handle 10x the current load?"
    ]
  },
  "Full Stack Developer": {
    title: "Build a Collaborative Project Management Platform",
    problem: "Create a full-stack application similar to Linear or Notion that enables teams to manage projects, track tasks in real-time, and collaborate seamlessly. This project showcases your ability to build production-ready applications with modern frontend frameworks and scalable backend services.",
    techStack: [
      { name: "Next.js / React", icon: Code2 },
      { name: "TypeScript", icon: Code2 },
      { name: "Node.js / Express", icon: Layers },
      { name: "PostgreSQL", icon: Database },
      { name: "WebSockets", icon: Cloud },
      { name: "Docker", icon: Cloud }
    ],
    phases: [
      {
        title: "Frontend Foundation",
        tasks: [
          "Set up Next.js project with TypeScript",
          "Implement component library with Tailwind CSS",
          "Create responsive layouts and navigation",
          "Add state management with Zustand or Redux"
        ],
        duration: "Week 1-2"
      },
      {
        title: "Backend API Development",
        tasks: [
          "Design RESTful API with Express.js",
          "Implement authentication with OAuth and JWT",
          "Set up PostgreSQL with Prisma ORM",
          "Create API documentation with Swagger"
        ],
        duration: "Week 3-4"
      },
      {
        title: "Real-Time Features",
        tasks: [
          "Implement WebSocket connections for live updates",
          "Add collaborative editing features",
          "Create notification system",
          "Build activity feed with real-time sync"
        ],
        duration: "Week 5-6"
      },
      {
        title: "Production Deployment",
        tasks: [
          "Set up Docker containers",
          "Deploy to cloud platform (Vercel + Railway)",
          "Implement CDN for static assets",
          "Add monitoring and error tracking"
        ],
        duration: "Week 7-8"
      }
    ],
    interviewQuestions: [
      "How did you handle real-time synchronization conflicts?",
      "Explain your authentication flow and security measures.",
      "What was your approach to state management?",
      "How would you optimize the application for mobile users?",
      "Describe your testing strategy for this application."
    ]
  },
  "Data Engineer": {
    title: "Build an End-to-End Data Pipeline for E-Commerce Analytics",
    problem: "Design and implement a complete data engineering solution that ingests, transforms, and serves analytics data from multiple e-commerce sources. This project demonstrates expertise in data modeling, ETL/ELT processes, and building scalable data infrastructure.",
    techStack: [
      { name: "Python", icon: Code2 },
      { name: "Apache Spark", icon: Layers },
      { name: "Apache Airflow", icon: Cloud },
      { name: "Snowflake / BigQuery", icon: Database },
      { name: "dbt", icon: Database },
      { name: "Kafka", icon: Layers }
    ],
    phases: [
      {
        title: "Data Ingestion Layer",
        tasks: [
          "Set up Kafka for real-time event streaming",
          "Create connectors for various data sources",
          "Implement schema registry for data validation",
          "Build landing zone in cloud storage"
        ],
        duration: "Week 1-2"
      },
      {
        title: "Transformation Pipeline",
        tasks: [
          "Design dimensional data model",
          "Implement dbt models for transformations",
          "Create data quality checks",
          "Set up incremental processing logic"
        ],
        duration: "Week 3-4"
      },
      {
        title: "Orchestration & Automation",
        tasks: [
          "Configure Airflow DAGs for pipeline orchestration",
          "Implement retry logic and alerting",
          "Add data lineage tracking",
          "Create monitoring dashboards"
        ],
        duration: "Week 5-6"
      },
      {
        title: "Serving & Analytics",
        tasks: [
          "Build analytics API layer",
          "Create BI dashboards with Metabase",
          "Implement caching with Redis",
          "Document data catalog"
        ],
        duration: "Week 7-8"
      }
    ],
    interviewQuestions: [
      "How do you handle late-arriving data in your pipeline?",
      "Explain your approach to data quality and validation.",
      "How would you debug a failed Airflow DAG?",
      "Describe your dimensional modeling approach.",
      "How do you ensure data freshness for real-time dashboards?"
    ]
  }
};

const getBlueprint = (targetRole: string) => {
  return projectBlueprints[targetRole] || projectBlueprints["Backend Developer"];
};

const Blueprint = () => {
  const navigate = useNavigate();
  const [careerData, setCareerData] = useState<CareerData | null>(null);
  const [blueprint, setBlueprint] = useState<ReturnType<typeof getBlueprint> | null>(null);
  const [activePhase, setActivePhase] = useState(0);

  useEffect(() => {
    const stored = sessionStorage.getItem('careerData');
    if (stored) {
      const data = JSON.parse(stored) as CareerData;
      setCareerData(data);
      setBlueprint(getBlueprint(data.targetRole));
    } else {
      navigate('/dashboard');
    }
  }, [navigate]);

  if (!careerData || !blueprint) {
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
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => navigate('/results')}>
              Back to Results
            </Button>
            <Button variant="default">
              <Download className="w-4 h-4 mr-2" />
              Export PDF
            </Button>
          </div>
        </div>
      </header>

      <main className="pt-24 pb-12 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Page Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50 border border-border/50 backdrop-blur-sm mb-6">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground">Your Engineering Blueprint</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              {blueprint.title}
            </h1>
            <p className="text-muted-foreground max-w-3xl mx-auto">
              A comprehensive project designed to fill your skill gaps and prepare you for {careerData.targetRole} roles.
            </p>
          </div>

          {/* Progress Tracker */}
          <div className="glass-card p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Your Progress</h2>
              <span className="text-sm text-muted-foreground">Beginner → Industry Ready</span>
            </div>
            <Progress value={15} className="h-3 mb-4" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Getting Started</span>
              <span>Foundation</span>
              <span>Advanced</span>
              <span>Production Ready</span>
            </div>
          </div>

          {/* Problem Statement */}
          <div className="glass-card p-6 mb-8 gradient-border">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              🎯 Problem Statement
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              {blueprint.problem}
            </p>
          </div>

          {/* Architecture Diagram */}
          <div className="glass-card p-6 mb-8">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              🏗️ System Architecture
            </h2>
            <div className="bg-muted/30 rounded-xl p-8">
              <div className="grid grid-cols-3 gap-4 mb-8">
                {/* Clients */}
                <div className="col-span-3 flex justify-center">
                  <div className="glass-card px-6 py-3 text-center">
                    <span className="text-sm font-medium">Clients (Web / Mobile)</span>
                  </div>
                </div>
                
                {/* Arrow */}
                <div className="col-span-3 flex justify-center">
                  <div className="h-8 w-0.5 bg-gradient-to-b from-primary to-secondary" />
                </div>

                {/* API Gateway */}
                <div className="col-span-3 flex justify-center">
                  <div className="glass-card px-8 py-4 text-center bg-primary/10 border-primary/30">
                    <span className="text-sm font-medium text-primary">API Gateway / Load Balancer</span>
                  </div>
                </div>

                {/* Arrow */}
                <div className="col-span-3 flex justify-center">
                  <div className="h-8 w-0.5 bg-gradient-to-b from-primary to-secondary" />
                </div>

                {/* Services */}
                <div className="glass-card p-4 text-center bg-secondary/10 border-secondary/30">
                  <Code2 className="w-6 h-6 mx-auto mb-2 text-secondary" />
                  <span className="text-xs font-medium">Service A</span>
                </div>
                <div className="glass-card p-4 text-center bg-secondary/10 border-secondary/30">
                  <Layers className="w-6 h-6 mx-auto mb-2 text-secondary" />
                  <span className="text-xs font-medium">Service B</span>
                </div>
                <div className="glass-card p-4 text-center bg-secondary/10 border-secondary/30">
                  <Cloud className="w-6 h-6 mx-auto mb-2 text-secondary" />
                  <span className="text-xs font-medium">Service C</span>
                </div>

                {/* Message Queue */}
                <div className="col-span-3 flex justify-center mt-4">
                  <div className="glass-card px-8 py-3 text-center bg-accent/10 border-accent/30">
                    <span className="text-sm font-medium text-accent">Message Queue (Kafka/RabbitMQ)</span>
                  </div>
                </div>

                {/* Databases */}
                <div className="col-span-3 flex justify-center gap-4 mt-4">
                  <div className="glass-card px-4 py-3 text-center">
                    <Database className="w-5 h-5 mx-auto mb-1 text-primary" />
                    <span className="text-xs">PostgreSQL</span>
                  </div>
                  <div className="glass-card px-4 py-3 text-center">
                    <Database className="w-5 h-5 mx-auto mb-1 text-destructive" />
                    <span className="text-xs">Redis Cache</span>
                  </div>
                  <div className="glass-card px-4 py-3 text-center">
                    <Cloud className="w-5 h-5 mx-auto mb-1 text-success" />
                    <span className="text-xs">Cloud Storage</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tech Stack */}
          <div className="glass-card p-6 mb-8">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              🛠️ Tech Stack
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {blueprint.techStack.map((tech) => (
                <div
                  key={tech.name}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <tech.icon className="w-8 h-8 text-primary" />
                  <span className="text-sm font-medium text-center">{tech.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Roadmap */}
          <div className="glass-card p-6 mb-8">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              🗺️ Step-by-Step Roadmap
            </h2>

            <div className="relative">
              <div className="roadmap-line" />
              
              <div className="space-y-6">
                {blueprint.phases.map((phase, index) => (
                  <div
                    key={phase.title}
                    className={`relative pl-14 cursor-pointer transition-all ${
                      activePhase === index ? 'scale-[1.02]' : ''
                    }`}
                    onClick={() => setActivePhase(index)}
                  >
                    {/* Phase Number */}
                    <div 
                      className={`absolute left-0 w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all ${
                        activePhase === index
                          ? 'bg-gradient-to-br from-primary to-secondary text-white glow-effect'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {index + 1}
                    </div>

                    {/* Phase Content */}
                    <div 
                      className={`glass-card p-5 transition-all ${
                        activePhase === index ? 'border-primary/50' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-semibold">{phase.title}</h3>
                        <span className="text-sm text-muted-foreground px-3 py-1 rounded-full bg-muted">
                          {phase.duration}
                        </span>
                      </div>

                      {activePhase === index && (
                        <ul className="space-y-2">
                          {phase.tasks.map((task, taskIndex) => (
                            <li 
                              key={taskIndex}
                              className="flex items-start gap-3 text-muted-foreground"
                            >
                              <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                              <span>{task}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Interview Questions */}
          <div className="glass-card p-6 mb-8">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-primary" />
              Mock Interview Questions
            </h2>
            <p className="text-muted-foreground mb-4">
              Practice answering these questions about your project:
            </p>
            <div className="space-y-3">
              {blueprint.interviewQuestions.map((question, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-4 rounded-lg bg-muted/30"
                >
                  <span className="w-6 h-6 rounded-full bg-primary/20 text-primary text-sm font-medium flex items-center justify-center flex-shrink-0">
                    {index + 1}
                  </span>
                  <span className="text-foreground">{question}</span>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="text-center glass-card p-8 gradient-border">
            <Trophy className="w-12 h-12 text-warning mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Ready to become Industry Ready?</h2>
            <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
              This blueprint is your roadmap to landing your dream {careerData.targetRole} role. 
              Start building today and track your progress.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button variant="hero" size="lg" className="group">
                Start Building
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </Button>
              <Button variant="glass" size="lg">
                <Download className="w-4 h-4 mr-2" />
                Download as PDF
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Blueprint;
