import { useEffect, useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format, parseISO, isAfter } from "date-fns";
import { LockIcon, UnlockIcon, PlayIcon, CalendarIcon } from "lucide-react";
import useStore from "@/store/useStore";
import { Timeline as TimelineType } from "@/types";
import { toast } from "sonner";

// Using the Timeline type from types but with a local alias for clarity
interface Entry extends Omit<TimelineType, '_id' | 'audioUrl' | 'user' | 'isNotified'> {
  id: string;
  audioURL: string;
}

const Timeline = () => {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<Entry | null>(null);
  const [testMode, setTestMode] = useState<boolean>(false);
  // Access the store data directly
  const { fetchTimelines, timelines, timelineLoading } = useStore();
  
  // Load entries from API
  useEffect(() => {
    fetchTimelines();
  }, [fetchTimelines]);
  
  // Update entries when timelines change in the store
  useEffect(() => {
    if (timelines?.data) {
      // Convert Timeline type to Entry type
      const formattedEntries = timelines.data.map(timeline => ({
        id: timeline._id,
        title: timeline.title,
        mood: timeline.mood,
        createdAt: timeline.createdAt,
        unlockAt: timeline.unlockAt,
        audioURL: timeline.audioUrl
      }));
      setEntries(formattedEntries);
      
      // Check if any entries unlocked since last visit
      const now = new Date();
      const lastVisit = localStorage.getItem("echoverse_last_visit");
      
      if (lastVisit) {
        const lastVisitDate = new Date(lastVisit);
        const newlyUnlockedEntries = formattedEntries.filter((entry: Entry) => {
          const unlockDate = new Date(entry.unlockAt);
          return isAfter(now, unlockDate) && isAfter(unlockDate, lastVisitDate);
        });
        
        if (newlyUnlockedEntries.length > 0) {
          // Show notification using toast
          toast.success(`${newlyUnlockedEntries.length} ${newlyUnlockedEntries.length === 1 ? 'entry' : 'entries'} just unlocked!`, {
            description: 'Check your timeline to listen to your past messages.',
            duration: 5000
          });
        }
      }
      
      localStorage.setItem("echoverse_last_visit", now.toISOString());
    }
  }, [timelines]);
  
  // Group entries by year and month
  const groupedEntries = entries.reduce((groups: Record<string, Entry[]>, entry) => {
    const date = parseISO(entry.createdAt);
    const yearMonth = format(date, "yyyy-MM");
    
    if (!groups[yearMonth]) {
      groups[yearMonth] = [];
    }
    
    groups[yearMonth].push(entry);
    return groups;
  }, {});
  
  // Sort the yearMonth keys in reverse chronological order
  const sortedYearMonths = Object.keys(groupedEntries).sort().reverse();
  
  // Check if entry is unlocked
  const isEntryUnlocked = (unlockAt: string) => {
    // If test mode is enabled, all entries are considered unlocked
    if (testMode) return true;
    
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
  
  return (
    <MainLayout currentPage="timeline">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-2">
          <h1 className="text-3xl font-bold">Your Echo Timeline</h1>
          <Button 
            variant={testMode ? "destructive" : "outline"}
            size="sm"
            onClick={() => setTestMode(!testMode)}
            className="flex items-center gap-2"
          >
            {testMode ? (
              <>
                <LockIcon className="h-4 w-4" />
                Exit Test Mode
              </>
            ) : (
              <>
                <UnlockIcon className="h-4 w-4" />
                Test Mode: Unlock All
              </>
            )}
          </Button>
        </div>
        <p className="text-muted-foreground mb-8">
          Your journey through time, from past reflections to future revelations
          {testMode && <span className="ml-2 text-destructive font-medium">(Test Mode: All entries unlocked)</span>}
        </p>
        
        <div className="grid grid-cols-1 gap-8">
          {timelineLoading ? (
            <Card className="glass-card">
              <CardContent className="pt-6 text-center">
                <div className="text-5xl mb-4">⌛</div>
                <h3 className="text-xl font-semibold mb-2">Loading your echoes...</h3>
              </CardContent>
            </Card>
          ) : entries.length === 0 ? (
            <Card className="glass-card">
              <CardContent className="pt-6 text-center">
                <div className="text-5xl mb-4">🔮</div>
                <h3 className="text-xl font-semibold mb-2">No echoes yet</h3>
                <p className="text-muted-foreground mb-4">
                  Your timeline is waiting for your first echo. Record a message for your future self.
                </p>
                <Button onClick={() => window.location.href = "/dashboard"} className="echo-gradient">
                  Record Your First Echo
                </Button>
              </CardContent>
            </Card>
          ) : (
            sortedYearMonths.map((yearMonth) => (
              <div key={yearMonth}>
                <div className="flex items-center gap-2 mb-4">
                  <CalendarIcon className="h-5 w-5 text-primary" />
                  <h2 className="text-xl font-semibold">
                    {format(parseISO(`${yearMonth}-01`), "MMMM yyyy")}
                  </h2>
                </div>
                
                <div className="space-y-4">
                  {groupedEntries[yearMonth].map((entry) => {
                    const unlocked = isEntryUnlocked(entry.unlockAt);
                    
                    return (
                      <Card 
                        key={entry.id} 
                        className={`glass-card transition-all hover:shadow-md ${
                          !unlocked ? "opacity-80" : ""
                        }`}
                      >
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle>{entry.title}</CardTitle>
                              <CardDescription>
                                Created on {format(parseISO(entry.createdAt), "PPP")}
                              </CardDescription>
                            </div>
                            <Badge variant={unlocked ? "outline" : "secondary"}>
                              {getMoodEmoji(entry.mood)} {entry.mood?.toUpperCase()}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          {unlocked ? (
                            <div>
                              <audio 
                                controls 
                                className="w-full mt-2" 
                                src={entry.audioURL}
                              ></audio>
                            </div>
                          ) : (
                            <div className="bg-muted/30 rounded-lg p-4 text-center">
                              <LockIcon className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                              <p className="text-muted-foreground">
                                This echo will unlock on {format(parseISO(entry.unlockAt), "PPP")}
                              </p>
                            </div>
                          )}
                        </CardContent>
                        <CardFooter>
                          <Button
                            variant={unlocked ? "default" : "outline"}
                            className={unlocked ? "echo-gradient" : ""}
                            size="sm"
                            disabled={!unlocked}
                            onClick={() => setSelectedEntry(entry)}
                          >
                            {unlocked ? (
                              <>
                                <PlayIcon className="h-4 w-4 mr-2" />
                                Listen
                              </>
                            ) : (
                              <>
                                <UnlockIcon className="h-4 w-4 mr-2" />
                                Unlocks in {
                                  Math.ceil((new Date(entry.unlockAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
                                } days
                              </>
                            )}
                          </Button>
                        </CardFooter>
                      </Card>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default Timeline;