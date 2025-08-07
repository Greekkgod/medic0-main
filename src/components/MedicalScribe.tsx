import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Stethoscope, FileText, Sparkles, AlertTriangle, Trash2, Save, Edit3, Shield, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ProgressIndicator from "@/components/ui/progress-indicator";
import CopyButton from "@/components/ui/copy-button";
import ExportButton from "@/components/ui/export-button";
import FileUpload from "@/components/ui/file-upload";
import TemplateSelector from "@/components/ui/template-selector";
import HistoryPanel from "@/components/ui/history-panel";

const MedicalScribe = () => {
  const [transcript, setTranscript] = useState("");
  const [soapNote, setSoapNote] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [confidence, setConfidence] = useState(0);
  const [draftSaved, setDraftSaved] = useState(false);
  const [patientId, setPatientId] = useState("");
  const { toast } = useToast();

  // Auto-save draft to localStorage
  useEffect(() => {
    if (transcript) {
      localStorage.setItem("medic-ai-draft", transcript);
      setDraftSaved(true);
      setTimeout(() => setDraftSaved(false), 2000);
    }
  }, [transcript]);

  // Load draft on component mount
  useEffect(() => {
    const savedDraft = localStorage.getItem("medic-ai-draft");
    if (savedDraft) {
      setTranscript(savedDraft);
    }
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        if (!isGenerating && transcript.trim()) {
          generateSOAPNote();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [transcript, isGenerating]);

  const generateSOAPNote = async () => {
    if (!transcript.trim()) {
      toast({
        title: "Input Required",
        description: "Please enter a conversation transcript to generate a SOAP note.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    setConfidence(0);
    setSoapNote("");

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ transcript }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'An unknown error occurred.');
      }

      const data = await response.json();
      
      setSoapNote(data.soapNote);
      setConfidence(data.confidence || 0);

      // Save to history (if you have a history system)
      if ((window as any).saveToMedicHistory) {
        (window as any).saveToMedicHistory(transcript, data.soapNote, patientId || `Patient-${Date.now()}`);
      }

      toast({
        title: "SOAP Note Generated",
        description: "Your medical note has been successfully generated.",
      });
    } catch (error: any) {
      toast({
        title: "Generation Failed",
        description: error.message || "An error occurred while generating the SOAP note. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const clearForm = useCallback(() => {
    setTranscript("");
    setSoapNote("");
    setPatientId("");
    setConfidence(0);
    localStorage.removeItem("medic-ai-draft");
    toast({
      title: "Form cleared",
      description: "All fields have been reset.",
    });
  }, [toast]);

  const handleFileUpload = useCallback((content: string, filename: string) => {
    setTranscript(content);
    toast({
      title: "File loaded",
      description: `Content from ${filename} has been loaded.`,
    });
  }, [toast]);

  const handleTemplateSelect = useCallback((content: string) => {
    setTranscript(content);
    toast({
      title: "Template loaded",
      description: "Template conversation has been loaded.",
    });
  }, [toast]);

  const handleHistoryLoad = useCallback((historyTranscript: string, historySoapNote: string) => {
    setTranscript(historyTranscript);
    setSoapNote(historySoapNote);
    toast({
      title: "History loaded",
      description: "Previous conversation and SOAP note have been restored.",
    });
  }, [toast]);

  const toggleEditMode = () => {
    setIsEditing(!isEditing);
  };

  const handleSoapNoteEdit = (value: string) => {
    setSoapNote(value);
  };

  const characterCount = transcript.length;
  const wordCount = transcript.trim().split(/\s+/).filter(word => word.length > 0).length;
  const recommendedRange = "500-2000 characters";

  return (
    <div className="min-h-screen bg-medical-light p-4 sm:p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <div className="p-3 bg-primary rounded-full animate-pulse">
              <Stethoscope className="h-8 w-8 text-primary-foreground" />
            </div>
            <h1 className="text-4xl font-bold text-foreground">medic.ai</h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Transform doctor-patient conversations into structured SOAP notes using advanced AI technology
          </p>
          
          {/* Privacy Notice */}
          <Alert className="max-w-2xl mx-auto">
            <Shield className="h-4 w-4" />
            <AlertDescription>
              <strong>Privacy Notice:</strong> This is a demonstration tool. Do not input real patient data. 
              All information should be anonymized for HIPAA compliance.
            </AlertDescription>
          </Alert>
        </div>

        {/* Action Bar */}
        <div className="flex flex-wrap gap-3 justify-center items-center">
          <TemplateSelector onSelectTemplate={handleTemplateSelect} />
          <HistoryPanel onLoadHistory={handleHistoryLoad} />
          <Button variant="outline" onClick={clearForm}>
            <Trash2 className="h-4 w-4 mr-2" />
            Clear Form
          </Button>
          {draftSaved && (
            <Badge variant="secondary" className="animate-fade-in">
              <Save className="h-3 w-3 mr-1" />
              Draft Saved
            </Badge>
          )}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Input Section */}
          <div className="space-y-6">
            <Card className="border-medical-border shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Conversation Transcript
                </CardTitle>
                <CardDescription>
                  Paste the doctor-patient conversation below or upload a transcript file
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Patient ID */}
                <div className="space-y-2">
                  <Label htmlFor="patientId" className="text-sm font-medium">
                    Patient ID (Optional)
                  </Label>
                  <input
                    id="patientId"
                    type="text"
                    placeholder="Enter patient identifier"
                    value={patientId}
                    onChange={(e) => setPatientId(e.target.value)}
                    className="w-full px-3 py-2 border border-medical-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                <Separator />

                {/* File Upload */}
                <FileUpload onFileContent={handleFileUpload} />
                
                <div className="text-center text-sm text-muted-foreground">
                  — OR —
                </div>

                {/* Text Input */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="transcript" className="text-sm font-medium">
                      Enter Conversation
                    </Label>
                    <div className="text-xs text-muted-foreground">
                      {characterCount} chars • {wordCount} words
                    </div>
                  </div>
                  <Textarea
                    id="transcript"
                    placeholder="Doctor: Good morning, how are you feeling today?&#10;Patient: I've been having this persistent cough for about two weeks now...&#10;Doctor: Can you tell me more about the cough? Is it dry or productive?"
                    value={transcript}
                    onChange={(e) => setTranscript(e.target.value)}
                    className="min-h-[300px] resize-y border-medical-border focus:border-primary"
                  />
                  <div className="flex justify-between items-center text-xs text-muted-foreground">
                    <span>Recommended: {recommendedRange}</span>
                    <span className="flex items-center gap-1">
                      Press Ctrl+Enter to generate
                    </span>
                  </div>
                </div>

                {/* Generate Button */}
                <div className="space-y-4">
                  <Button 
                    onClick={generateSOAPNote}
                    disabled={isGenerating || !transcript.trim()}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-3"
                  >
                    {isGenerating ? (
                      <>
                        <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                        Generating SOAP Note...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Generate SOAP Note
                      </>
                    )}
                  </Button>

                  {/* Progress Indicator */}
                  <ProgressIndicator isGenerating={isGenerating} />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Output Section */}
          <div className="space-y-6">
            {soapNote && (
              <Card className="border-medical-border shadow-lg">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-medical-success">
                      <FileText className="h-5 w-5" />
                      Generated SOAP Note
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      {confidence > 0 && (
                        <Badge variant={confidence >= 90 ? "default" : confidence >= 75 ? "secondary" : "destructive"}>
                          {confidence}% confidence
                        </Badge>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={toggleEditMode}
                      >
                        <Edit3 className="h-4 w-4 mr-1" />
                        {isEditing ? "View" : "Edit"}
                      </Button>
                    </div>
                  </div>
                  <CardDescription>
                    Professional medical documentation generated from the conversation transcript
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isEditing ? (
                    <Textarea
                      value={soapNote}
                      onChange={(e) => handleSoapNoteEdit(e.target.value)}
                      className="min-h-[400px] font-mono text-sm"
                      placeholder="Edit your SOAP note here..."
                    />
                  ) : (
                    <div className="bg-muted/50 p-6 rounded-lg border border-medical-border">
                      <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-foreground">
                        {soapNote}
                      </pre>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-2">
                    <CopyButton text={soapNote} />
                    <ExportButton soapNote={soapNote} patientId={patientId || "Unknown"} />
                    {confidence > 0 && confidence < 80 && (
                      <Button variant="outline" size="sm">
                        <AlertTriangle className="h-4 w-4 mr-2" />
                        Review Required
                      </Button>
                    )}
                  </div>

                  {/* Quality Indicators */}
                  {confidence > 0 && (
                    <div className="space-y-2 p-4 bg-muted/30 rounded-lg">
                      <h4 className="text-sm font-medium">Quality Assessment</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Medical Accuracy</span>
                          <Progress value={confidence} className="w-20 h-2" />
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Completeness</span>
                          <Progress value={Math.min(confidence + 5, 100)} className="w-20 h-2" />
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Format Compliance</span>
                          <Progress value={95} className="w-20 h-2" />
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Help Card */}
            {!soapNote && (
              <Card className="border-dashed border-medical-border">
                <CardHeader>
                  <CardTitle className="text-lg">Quick Tips</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-muted-foreground">
                  <div className="flex items-start gap-2">
                    <span className="font-bold text-primary">•</span>
                    <span>Include complete patient responses and doctor questions</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="font-bold text-primary">•</span>
                    <span>Mention vital signs, physical exam findings, and symptoms</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="font-bold text-primary">•</span>
                    <span>Use templates for common scenarios to get started quickly</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="font-bold text-primary">•</span>
                    <span>Upload transcript files (.txt, .csv, .rtf, .html)</span>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center pt-8 border-t border-medical-border">
          <p className="text-sm text-muted-foreground">
            medic.ai Prototype • For demonstration purposes only • Never use real patient data
          </p>
        </div>
      </div>
    </div>
  );
};

export default MedicalScribe;