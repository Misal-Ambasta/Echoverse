
import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { TimerIcon, BellIcon, ShieldIcon, UserIcon, LockIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import useStore  from "@/store/useStore";
import { toast as sonnerToast } from "sonner";

const Settings = () => {
  const [capsuleMode, setCapsuleMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [email, setEmail] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();
  const { user, updateUserSettings } = useStore();
  
  useEffect(() => {
    // Load settings from user object if available
    if (user) {
      setCapsuleMode(user.timeCapsuleMode?.enabled || false);
      setEmail(user.email || "");
    }
    
    // Load notification settings from localStorage
    const settings = JSON.parse(localStorage.getItem("echoverse_settings") || "{}");
    setNotifications(settings.notifications !== undefined ? settings.notifications : true);
  }, [user]);
  
  const saveSettings = async () => {
    setIsUpdating(true);
    
    try {
      // Save time capsule mode to backend
      const oneYearFromNow = new Date();
      oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
      
      const result = await updateUserSettings({
        timeCapsuleMode: {
          enabled: capsuleMode,
          contentVisibleAfter: capsuleMode ? oneYearFromNow.toISOString() : null
        }
      });
      
      // Save notification settings to localStorage
      localStorage.setItem("echoverse_settings", JSON.stringify({
        notifications
      }));
      
      if (result.success) {
        toast({
          title: "Settings saved",
          description: "Your preferences have been updated.",
        });
      } else {
        sonnerToast.error("Failed to save settings", {
          description: result.message || "Please try again later"
        });
      }
    } catch (error) {
      sonnerToast.error("Failed to save settings", {
        description: "An unexpected error occurred"
      });
    } finally {
      setIsUpdating(false);
    }
  };
  
  const updatePassword = () => {
    toast({
      title: "Password updated",
      description: "Your password has been changed successfully.",
    });
  };
  
  return (
    <MainLayout currentPage="settings">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-muted-foreground mb-8">
          Configure your experience and manage your account
        </p>
        
        <Tabs defaultValue="preferences">
          <TabsList className="mb-6">
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
            <TabsTrigger value="account">Account</TabsTrigger>
          </TabsList>
          
          <TabsContent value="preferences">
            <div className="space-y-6">
              <Card className="glass-card">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <TimerIcon className="h-5 w-5 text-primary" />
                    <CardTitle>Time Capsule Mode</CardTitle>
                  </div>
                  <CardDescription>
                    Control how and when you can access your echoes
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label htmlFor="capsule-mode">Time Capsule Mode</Label>
                      <p className="text-sm text-muted-foreground">
                        Hide all entries until 1 year from now, even if they have past unlock dates
                      </p>
                    </div>
                    <Switch
                      id="capsule-mode"
                      checked={capsuleMode}
                      onCheckedChange={(checked) => {
                        setCapsuleMode(checked);
                        if (checked) {
                          sonnerToast.info("Time Capsule Mode", {
                            description: "This will hide all entries for 1 year when saved"
                          });
                        }
                      }}
                      disabled={isUpdating}
                    />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="glass-card">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <BellIcon className="h-5 w-5 text-primary" />
                    <CardTitle>Notifications</CardTitle>
                  </div>
                  <CardDescription>
                    Configure how you want to be notified about your echoes
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label htmlFor="unlock-notifications">Unlock Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Get notified when your echoes become unlocked
                      </p>
                    </div>
                    <Switch
                      id="unlock-notifications"
                      checked={notifications}
                      onCheckedChange={setNotifications}
                    />
                  </div>
                </CardContent>
              </Card>
              
              <div className="flex justify-end">
                <Button 
                  onClick={saveSettings} 
                  className="echo-gradient"
                  disabled={isUpdating}
                >
                  {isUpdating ? "Saving..." : "Save Preferences"}
                </Button>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="account">
            <div className="space-y-6">
              <Card className="glass-card">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <UserIcon className="h-5 w-5 text-primary" />
                    <CardTitle>Account Information</CardTitle>
                  </div>
                  <CardDescription>
                    Manage your account details
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-1">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Your email address"
                      disabled
                    />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="glass-card">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <LockIcon className="h-5 w-5 text-primary" />
                    <CardTitle>Security</CardTitle>
                  </div>
                  <CardDescription>
                    Manage your password and security settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <Label htmlFor="current-password">Current Password</Label>
                      <Input
                        id="current-password"
                        type="password"
                        placeholder="Your current password"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="new-password">New Password</Label>
                      <Input
                        id="new-password"
                        type="password"
                        placeholder="Your new password"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="confirm-password">Confirm New Password</Label>
                      <Input
                        id="confirm-password"
                        type="password"
                        placeholder="Confirm your new password"
                      />
                    </div>
                    <Button onClick={updatePassword} className="echo-gradient">
                      Update Password
                    </Button>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-4">
                    <h3 className="font-medium">Data Privacy</h3>
                    <p className="text-sm text-muted-foreground">
                      Your echoes are private and encrypted. Only you can access them when they unlock.
                    </p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <ShieldIcon className="h-4 w-4" />
                      <span>Your data is stored securely</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Settings;
