
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { format, parseISO, isAfter } from "date-fns";
import { LockIcon, ArrowLeftIcon, SaveIcon } from "lucide-react";

interface Entry {
  id: string;
  title: string;
  mood: string;
  createdAt: string;
  unlockAt: string;
  audioURL: string;
  reflection?: string;
}

const EntryDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [entry, setEntry] = useState<Entry | null>(null);
  const [reflection, setReflection] = useState("");
  const navigate = useNavigate();
  
  useEffect(() => {
    // Load entries from localStorage
    const entries = JSON.parse(localStorage.getItem("echoverse_entries") || "[]");
    const foundEntry = entries.find((e: Entry) => e.id === id);
    
    if (foundEntry) {
      setEntry(foundEntry);
      setReflection(foundEntry.reflection || "");
    }
  }, [id]);
  
  // Check if entry is unlocked
  const isEntryUnlocked = (unlockAt: string) => {
    const unlockDate = new Date(unlockAt);
    const now = new Date();
    return isAfter(now, unlockDate);
  };
  
  const getMoodEmoji = (mood: string) => {
    const moods: Record<string, string> = {
      happy: "😊",
      reflective: "🤔",
      anxious: "😰",
      grateful: "🙏",
      inspired: "✨",
      sad: "😢",
      excited: "🎉",
    };
    
    return moods[mood] || "📝";
  };
  
  const getMoodLabel = (mood: string) => {
    const labels: Record<string, string> = {
      happy: "Happy",
      reflective: "Reflective",
      anxious: "Anxious",
      grateful: "Grateful",
      inspired: "Inspired",
      sad: "Sad",
      excited: "Excited",
    };
    
    return labels[mood] || mood;
  };
  
  const saveReflection = () => {
    if (!entry) return;
    
    // Update the entry with the reflection
    const entries = JSON.parse(localStorage.getItem("echoverse_entries") || "[]");
    const updatedEntries = entries.map((e: Entry) => {
      if (e.id === entry.id) {
        return { ...e, reflection };
      }
      return e;
    });
    
    localStorage.setItem("echoverse_entries", JSON.stringify(updatedEntries));
    
    // Update the local state
    setEntry({ ...entry, reflection });
  };
  
  if (!entry) {
    return (
      <MainLayout currentPage="timeline">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-semibold mb-4">Entry not found</h2>
          <Button onClick={() => navigate("/timeline")} variant="outline">
            <ArrowLeftIcon className="h-4 w-4 mr-2" /> 
            Back to Timeline
          </Button>
        </div>
      </MainLayout>
    );
  }
  
  const unlocked = isEntryUnlocked(entry.unlockAt);
  
  return (
    <MainLayout currentPage="timeline">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <Button 
            onClick={() => navigate("/timeline")} 
            variant="outline"
            size="sm"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" /> 
            Back to Timeline
          </Button>
        </div>
        
        <Card className="glass-card">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl">{entry.title}</CardTitle>
                <CardDescription>
                  Recorded on {format(parseISO(entry.createdAt), "PPP")}
                </CardDescription>
              </div>
              <Badge className="text-sm">
                {getMoodEmoji(entry.mood)} {getMoodLabel(entry.mood)}
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {unlocked ? (
              <>
                <div className="bg-muted/30 rounded-lg p-4">
                  <audio 
                    controls 
                    className="w-full" 
                    src={entry.audioURL}
                  ></audio>
                </div>
                
                <div className="space-y-3">
                  <h3 className="font-medium">Your Reflection</h3>
                  <p className="text-sm text-muted-foreground">
                    How do you feel listening to this message from your past self?
                  </p>
                  <Textarea
                    placeholder="Write your thoughts after listening to this echo..."
                    value={reflection}
                    onChange={(e) => setReflection(e.target.value)}
                    rows={5}
                  />
                  <Button 
                    onClick={saveReflection} 
                    className="echo-gradient"
                    disabled={reflection === entry.reflection}
                  >
                    <SaveIcon className="h-4 w-4 mr-2" />
                    Save Reflection
                  </Button>
                </div>
              </>
            ) : (
              <div className="bg-muted/30 rounded-lg p-6 text-center">
                <LockIcon className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-medium mb-2">This echo is still locked</h3>
                <p className="text-muted-foreground mb-4">
                  Your message will be available on {format(parseISO(entry.unlockAt), "PPP")}
                </p>
                <p className="text-sm">
                  {Math.ceil((new Date(entry.unlockAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days remaining
                </p>
              </div>
            )}
          </CardContent>
          
          <CardFooter className="border-t bg-muted/20 flex justify-between">
            <div className="text-sm text-muted-foreground">
              {unlocked ? "Unlocked" : "Unlocks"} on {format(parseISO(entry.unlockAt), "PPP")}
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground"
              onClick={() => navigate("/timeline")}
            >
              Back to Timeline
            </Button>
          </CardFooter>
        </Card>
      </div>
    </MainLayout>
  );
};

export default EntryDetails;
