import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { History, Clock, FileText, Trash2, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

interface HistoryItem {
  id: number;
  timestamp: string;
  transcript: string;
  soapNote: string;
  patientId?: string;
}

interface HistoryPanelProps {
  onLoadHistory: (transcript: string, soapNote: string) => void;
  className?: string;
}

const HistoryPanel = ({ onLoadHistory, className }: HistoryPanelProps) => {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const fetchHistory = useCallback(async () => {
    try {
      const response = await fetch('/api/history');
      if (!response.ok) {
        throw new Error('Failed to fetch history');
      }
      const data = await response.json();
      setHistory(data);
    } catch (error) {
      console.error("Failed to fetch history:", error);
      toast({
        title: "Error",
        description: "Could not load history. Please try again later.",
        variant: "destructive",
      });
    }
  }, [toast]);

  useEffect(() => {
    if (isOpen) {
      fetchHistory();
    }
  }, [isOpen, fetchHistory]);

  const filteredHistory = history.filter(item =>
    item.transcript.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.soapNote.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.patientId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" className={className}>
          <History className="h-4 w-4 mr-2" />
          History
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>SOAP Note History</SheetTitle>
          <SheetDescription>
            View and reload previously generated SOAP notes.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-4 mt-6">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search history..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* History List */}
          <ScrollArea className="h-[calc(100vh-250px)]">
            <div className="space-y-3">
              {filteredHistory.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No SOAP notes generated yet.</p>
                  <p className="text-sm">Your history will appear here.</p>
                </div>
              ) : (
                filteredHistory.map((item) => (
                  <Card
                    key={item.id}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => onLoadHistory(item.transcript, item.soapNote)}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">
                              {formatTimeAgo(item.timestamp)}
                            </span>
                          </div>
                          {item.patientId && (
                            <Badge variant="outline" className="text-xs">
                              {item.patientId}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-2">
                        <div className="text-sm">
                          <p className="font-medium mb-1">Transcript:</p>
                          <p className="text-muted-foreground line-clamp-2">
                            {item.transcript.substring(0, 100)}...
                          </p>
                        </div>
                        <div className="text-sm">
                          <p className="font-medium mb-1">SOAP Note:</p>
                          <p className="text-muted-foreground line-clamp-2">
                            {item.soapNote.substring(0, 100)}...
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default HistoryPanel;