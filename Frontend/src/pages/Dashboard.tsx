import { useState, useRef, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { MicIcon, PauseIcon, PlayIcon, SquareIcon, SaveIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import useStore from "@/store/useStore";

const Dashboard = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [title, setTitle] = useState("");
  const [mood, setMood] = useState("");
  const [unlockDate, setUnlockDate] = useState<Date | undefined>(undefined);
  const [recordingState, setRecordingState] = useState<"idle" | "recording" | "paused" | "completed">("idle");
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  
  // Timer interval reference
  const timerIntervalRef = useRef<number | null>(null);
  // Max recording time in seconds (1 minute)
  const MAX_RECORDING_TIME = 60;
  
  const { toast } = useToast();
  const { createTimeline, timelineLoading, timelineError } = useStore();
  
  // Timer for recording duration
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };
  
  // Clear timer interval
  const clearTimerInterval = () => {
    if (timerIntervalRef.current !== null) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
  };
  
  // Effect to stop recording when reaching 1 minute
  useEffect(() => {
    if (recordingTime >= MAX_RECORDING_TIME && recordingState === "recording") {
      stopRecording();
      toast({
        title: "Recording complete",
        description: "Maximum recording time (1 minute) reached.",
      });
    }
  }, [recordingTime, recordingState]);
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      clearTimerInterval();
    };
  }, []);
  
  // Start recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      
      const audioChunks: BlobPart[] = [];
      
      recorder.addEventListener("dataavailable", (event) => {
        audioChunks.push(event.data);
      });
      
      recorder.addEventListener("stop", () => {
        const blob = new Blob(audioChunks, { type: "audio/mp3" });
        const url = URL.createObjectURL(blob);
        setAudioURL(url);
        setAudioBlob(blob);
        setRecordingState("completed");
        clearTimerInterval();
      });
      
      setMediaRecorder(recorder);
      recorder.start();
      setIsRecording(true);
      setRecordingState("recording");
      
      // Start timer
      setRecordingTime(0); // Reset timer when starting new recording
      clearTimerInterval(); // Clear any existing interval
      
      timerIntervalRef.current = window.setInterval(() => {
        setRecordingTime((prevTime) => {
          const newTime = prevTime + 1;
          return newTime;
        });
      }, 1000);
      
      // Store handlers for pause/resume
      recorder.onpause = () => {
        clearTimerInterval();
        setRecordingState("paused");
      };
      
      recorder.onresume = () => {
        timerIntervalRef.current = window.setInterval(() => {
          setRecordingTime((prevTime) => prevTime + 1);
        }, 1000);
        setRecordingState("recording");
      };
      
      recorder.onstop = () => {
        clearTimerInterval();
        stream.getTracks().forEach(track => track.stop());
      };
      
    } catch (error) {
      console.error("Error accessing microphone:", error);
      toast({
        title: "Microphone access denied",
        description: "Please allow microphone access to record audio entries.",
        variant: "destructive",
      });
    }
  };
  
  // Stop recording
  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };
  
  // Toggle pause recording
  const togglePauseRecording = () => {
    if (mediaRecorder) {
      if (recordingState === "recording") {
        mediaRecorder.pause();
        setRecordingState("paused");
      } else if (recordingState === "paused") {
        mediaRecorder.resume();
        setRecordingState("recording");
      }
    }
  };
  
  // Save entry
  const saveEntry = async () => {
    if (!audioBlob || !audioURL) {
      toast({
        title: "No recording found",
        description: "Please record an audio entry first.",
        variant: "destructive",
      });
      return;
    }
    
    if (!title) {
      toast({
        title: "Title required",
        description: "Please add a title for your audio entry.",
        variant: "destructive",
      });
      return;
    }
    
    if (!mood) {
      toast({
        title: "Mood required",
        description: "Please select a mood for your audio entry.",
        variant: "destructive",
      });
      return;
    }
    
    if (!unlockDate) {
      toast({
        title: "Unlock date required",
        description: "Please select when this entry should unlock.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      // Create FormData to send to the backend
      const formData = new FormData();
      
      // Create a file from the audio blob
      const audioFile = new File([audioBlob], `echo-${Date.now()}.mp3`, { type: "audio/mp3" });
      
      // Add all data to the FormData
      formData.append("audio", audioFile);
      formData.append("title", title);
      formData.append("mood", mood);
      formData.append("unlockAt", unlockDate.toISOString());
      
      // Call the createTimeline function from the store
      await createTimeline(formData);
      
      toast({
        title: "Entry saved!",
        description: `"${title}" will be unlocked on ${format(unlockDate, "PPP")}`,
      });
      
      // Reset form
      setTitle("");
      setMood("");
      setUnlockDate(undefined);
      setAudioURL(null);
      setAudioBlob(null);
      setRecordingTime(0);
      setRecordingState("idle");
    } catch (error) {
      toast({
        title: "Error saving entry",
        description: timelineError || "There was a problem saving your entry. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const moods = [
    { value: "happy", label: "😊 Happy", color: "text-yellow-500" },
    { value: "reflective", label: "🤔 Reflective", color: "text-blue-500" },
    { value: "anxious", label: "😰 Anxious", color: "text-red-500" },
    { value: "grateful", label: "🙏 Grateful", color: "text-green-500" },
    { value: "inspired", label: "✨ Inspired", color: "text-purple-500" },
    { value: "sad", label: "😢 Sad", color: "text-blue-700" },
    { value: "excited", label: "🎉 Excited", color: "text-pink-500" },
  ];
  
  return (
    <MainLayout currentPage="record">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Create New Echo</h1>
        <p className="text-muted-foreground mb-8">
          Record a message for your future self
        </p>
        
        <Card className="mb-8 glass-card">
          <CardHeader>
            <CardTitle>Record Your Voice</CardTitle>
            <CardDescription>
              Speak freely. No one will hear this except your future self. (Max 1 minute)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {recordingState === "idle" ? (
              <div className="flex justify-center">
                <Button 
                  onClick={startRecording}
                  size="lg"
                  className="echo-gradient w-16 h-16 rounded-full"
                >
                  <MicIcon size={24} />
                </Button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-center gap-4">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={togglePauseRecording}
                    className="w-12 h-12 rounded-full"
                    disabled={recordingState === "completed"}
                  >
                    {recordingState === "recording" ? <PauseIcon /> : <PlayIcon />}
                  </Button>
                  
                  <div className="text-center">
                    <div className="text-2xl font-mono">
                      {formatTime(recordingTime)}
                      {recordingState === "recording" && recordingTime >= MAX_RECORDING_TIME - 10 && recordingTime < MAX_RECORDING_TIME && (
                        <span className="text-sm text-red-500 ml-2 animate-pulse">
                          {MAX_RECORDING_TIME - recordingTime}s left
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {recordingState === "recording" ? (
                        <span className="flex items-center gap-1">
                          <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span> Recording...
                        </span>
                      ) : recordingState === "paused" ? (
                        "Paused"
                      ) : (
                        "Recorded"
                      )}
                    </div>
                    <div className="text-xs mt-1">
                      {recordingState === "recording" && (
                        <progress 
                          value={recordingTime} 
                          max={MAX_RECORDING_TIME} 
                          className={`w-24 ${recordingTime >= MAX_RECORDING_TIME - 10 ? "text-red-500" : ""}`}
                        />
                      )}
                    </div>
                  </div>
                  
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={stopRecording}
                    className="w-12 h-12 rounded-full border-destructive text-destructive"
                    disabled={recordingState === "completed"}
                  >
                    <SquareIcon />
                  </Button>
                </div>
                
                {audioURL && (
                  <div className="bg-muted/50 rounded-lg p-4">
                    <audio controls className="w-full" src={audioURL}></audio>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
        
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Entry Details</CardTitle>
            <CardDescription>
              Add details to help your future self understand this moment.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="Give your entry a meaningful title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="mood">Mood</Label>
              <Select value={mood} onValueChange={setMood}>
                <SelectTrigger>
                  <SelectValue placeholder="How are you feeling?" />
                </SelectTrigger>
                <SelectContent>
                  {moods.map((mood) => (
                    <SelectItem 
                      key={mood.value} 
                      value={mood.value}
                      className={mood.color}
                    >
                      {mood.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="unlockDate">When to unlock</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    {unlockDate ? (
                      format(unlockDate, "PPP")
                    ) : (
                      <span>Pick a date in the future</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={unlockDate}
                    onSelect={setUnlockDate}
                    disabled={(date) => date < new Date()}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
              <p className="text-xs text-muted-foreground">
                Your echo will remain locked until this date.
              </p>
            </div>
            
            <Button
              onClick={saveEntry}
              className="w-full echo-gradient"
              disabled={!audioURL || !title || !mood || !unlockDate || timelineLoading}
            >
              <SaveIcon className="mr-2 h-4 w-4" />
              Save Echo for the Future
            </Button>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Dashboard;