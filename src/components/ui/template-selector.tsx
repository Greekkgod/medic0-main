import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, FileText } from "lucide-react";

interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  content: string;
}

interface TemplateSelectorProps {
  onSelectTemplate: (content: string) => void;
  className?: string;
}

const templates: Template[] = [
  {
    id: "general-checkup",
    name: "General Checkup",
    category: "Primary Care",
    description: "Routine annual physical examination",
    content: `Doctor: Good morning! I'm Dr. Smith. How are you feeling today?
Patient: Good morning, Doctor. I'm here for my annual checkup. Overall, I feel pretty good.
Doctor: Excellent. Any specific concerns or symptoms you'd like to discuss?
Patient: Well, I've been feeling a bit more tired than usual lately, and I've noticed some occasional headaches.
Doctor: How long have you been experiencing the fatigue and headaches?
Patient: The tiredness started about 3 months ago, and the headaches maybe once or twice a week for the past month.
Doctor: Are you getting adequate sleep? Any changes in your sleep pattern?
Patient: I try to get 7-8 hours, but sometimes I have trouble falling asleep.
Doctor: Any stress at work or home that might be contributing?
Patient: Work has been busier than usual with a big project deadline.`
  },
  {
    id: "respiratory-complaint",
    name: "Respiratory Issues",
    category: "Respiratory",
    description: "Patient with cough and breathing difficulties",
    content: `Doctor: What brings you in today?
Patient: I've had this persistent cough for about two weeks now, and it's getting worse.
Doctor: Can you describe the cough? Is it dry or are you bringing anything up?
Patient: It's mostly dry, but sometimes I cough up a little clear mucus. It's worse at night.
Doctor: Any fever, chills, or body aches?
Patient: No fever, but I've been feeling more tired than usual.
Doctor: Any shortness of breath or chest pain?
Patient: Yes, I get short of breath when I walk up stairs, which is unusual for me.
Doctor: Any recent travel or exposure to sick contacts?
Patient: My coworker was sick with something similar last week.
Doctor: Are you taking any medications or have any allergies?
Patient: No regular medications, and no known allergies.`
  },
  {
    id: "abdominal-pain",
    name: "Abdominal Pain",
    category: "Gastroenterology",
    description: "Patient presenting with stomach pain",
    content: `Doctor: I understand you're having abdominal pain. Can you tell me about it?
Patient: Yes, I've had this stomach pain for the past three days. It's really bothering me.
Doctor: Where exactly is the pain located?
Patient: It's mainly in the upper part of my stomach, right here under my ribs.
Doctor: How would you describe the pain? Sharp, dull, cramping?
Patient: It's a burning sensation, especially after I eat.
Doctor: Does anything make it better or worse?
Patient: It gets worse when I eat spicy or acidic foods, and better when I take antacids.
Doctor: Any nausea, vomiting, or changes in bowel movements?
Patient: Some nausea, especially in the morning, but no vomiting. Bowel movements are normal.
Doctor: Any history of ulcers or stomach problems?
Patient: My father had ulcers, but I've never had stomach problems before.`
  },
  {
    id: "mental-health",
    name: "Mental Health Check",
    category: "Psychiatry",
    description: "Mental health screening and assessment",
    content: `Doctor: Thank you for coming in today. How have you been feeling emotionally lately?
Patient: Honestly, not great. I've been feeling pretty down for the past few weeks.
Doctor: Can you tell me more about what you mean by feeling down?
Patient: I just don't have energy for things I used to enjoy. I feel sad most of the time.
Doctor: How long has this been going on?
Patient: About 6 weeks now. It started gradually but has gotten worse.
Doctor: Are you having trouble sleeping or eating?
Patient: I'm sleeping too much - like 10-12 hours but still feel tired. My appetite is poor.
Doctor: Any thoughts of hurting yourself or others?
Patient: No, nothing like that. I just feel hopeless sometimes.
Doctor: Have you experienced anything like this before?
Patient: My mom had depression, but this is new for me.
Doctor: Any major life changes or stressful events recently?
Patient: I lost my job about two months ago, and my relationship ended around the same time.`
  }
];

const TemplateSelector = ({ onSelectTemplate, className }: TemplateSelectorProps) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = [...new Set(templates.map(t => t.category))];
  const filteredTemplates = selectedCategory 
    ? templates.filter(t => t.category === selectedCategory)
    : templates;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className={className}>
          <FileText className="h-4 w-4 mr-2" />
          Load Template
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Choose a Conversation Template</DialogTitle>
          <DialogDescription>
            Select a pre-made template to get started quickly with common medical scenarios.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedCategory === null ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(null)}
            >
              All Categories
            </Button>
            {categories.map(category => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Button>
            ))}
          </div>

          {/* Templates Grid */}
          <div className="grid gap-4 md:grid-cols-2">
            {filteredTemplates.map(template => (
              <Card
                key={template.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => onSelectTemplate(template.content)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                      <Badge variant="secondary" className="text-xs">
                        {template.category}
                      </Badge>
                    </div>
                    <Plus className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <CardDescription className="line-clamp-2">
                    {template.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded max-h-24 overflow-hidden">
                    {template.content.substring(0, 150)}...
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TemplateSelector;