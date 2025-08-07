import { Progress } from "@/components/ui/progress";
import { Sparkles, Brain, FileText, CheckCircle } from "lucide-react";
import { useState, useEffect } from "react";

interface ProgressIndicatorProps {
  isGenerating: boolean;
  onComplete?: () => void;
}

const ProgressIndicator = ({ isGenerating, onComplete }: ProgressIndicatorProps) => {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    { icon: Brain, label: "Analyzing conversation", duration: 30 },
    { icon: FileText, label: "Extracting medical information", duration: 40 },
    { icon: Sparkles, label: "Generating SOAP note", duration: 25 },
    { icon: CheckCircle, label: "Finalizing format", duration: 5 }
  ];

  useEffect(() => {
    if (!isGenerating) {
      setProgress(0);
      setCurrentStep(0);
      return;
    }

    let totalProgress = 0;
    let stepIndex = 0;
    
    const interval = setInterval(() => {
      if (stepIndex < steps.length) {
        const stepProgress = steps[stepIndex].duration;
        totalProgress += stepProgress / 20; // Smooth increment
        
        if (totalProgress >= steps.slice(0, stepIndex + 1).reduce((sum, step) => sum + step.duration, 0)) {
          stepIndex++;
          setCurrentStep(stepIndex);
        }
        
        setProgress(Math.min(totalProgress, 100));
        
        if (totalProgress >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            onComplete?.();
          }, 200);
        }
      }
    }, 50);

    return () => clearInterval(interval);
  }, [isGenerating, onComplete]);

  if (!isGenerating) return null;

  const CurrentIcon = currentStep < steps.length ? steps[currentStep].icon : CheckCircle;
  const currentLabel = currentStep < steps.length ? steps[currentStep].label : "Complete";

  return (
    <div className="space-y-4 p-6 bg-muted/30 rounded-lg border animate-fade-in">
      <div className="flex items-center gap-3">
        <CurrentIcon className="h-5 w-5 text-primary animate-pulse" />
        <span className="text-sm font-medium">{currentLabel}</span>
      </div>
      
      <Progress value={progress} className="h-2" />
      
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>Processing conversation...</span>
        <span>{Math.round(progress)}%</span>
      </div>
      
      <div className="flex gap-2">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isActive = index === currentStep;
          const isCompleted = index < currentStep;
          
          return (
            <div
              key={index}
              className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs transition-all ${
                isActive
                  ? "bg-primary/20 text-primary"
                  : isCompleted
                  ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              <Icon className="h-3 w-3" />
              <span className="hidden sm:inline">{step.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProgressIndicator;