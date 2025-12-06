"use client";

import { useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, Shield, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
// TODO: adapt Style type from Supabase later
// import type { Style } from "@shared/schema";

export default function AdminPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: styles, isLoading } = useQuery<any[]>({
    queryKey: ["/api/styles"],
    enabled: isAuthenticated,
  });

  const handleLogin = () => {
    if (password === "Montem") {
      setIsAuthenticated(true);
      toast({
        title: "Access granted",
        description: "Welcome to the admin panel",
      });
    } else {
      toast({
        title: "Access denied",
        description: "Incorrect password",
        variant: "destructive",
      });
    }
  };

  const handleCSVUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".csv")) {
      toast({
        title: "Invalid file type",
        description: "Please select a CSV file.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("csv", file);

      const response = await apiRequest("POST", "/api/styles/upload", formData);
      const result = await response.json();

      if (result.success) {
        toast({
          title: "Upload successful",
          description: result.message,
        });

        queryClient.invalidateQueries({ queryKey: ["/api/styles"] });
      } else {
        throw new Error(result.error || "Upload failed");
      }
    } catch (error) {
      console.error("CSV upload error:", error);
      toast({
        title: "Upload failed",
        description:
          error instanceof Error
            ? error.message
            : "Failed to upload CSV file",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="bg-background font-sans min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-2xl">Admin Access</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                placeholder="Enter admin password"
                data-testid="admin-password-input"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => router.push("/")}
                className="flex-1"
                data-testid="button-back"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button
                onClick={handleLogin}
                className="flex-1"
                data-testid="button-login"
              >
                Access Panel
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="bg-background font-sans min-h-screen">
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Admin Panel</h1>
            <p className="text-muted-foreground">Manage ceiling design styles and data</p>
          </div>
          <Button 
            variant="outline" 
            onClick={() => setLocation('/')}
            data-testid="button-back-to-app"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to App
          </Button>
        </div>

        {/* CSV Upload Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Upload className="mr-2 h-5 w-5" />
              Upload Style Data
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Upload a CSV file to add or update ceiling design styles. Expected columns:
                <span className="font-mono text-xs bg-muted px-1 rounded ml-1">
                  styleId, name, description, color, finish, lighting, previewImageUrl, finalImageUrl
                </span>
              </p>
              <div className="flex gap-4">
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleCSVUpload}
                  ref={fileInputRef}
                  className="hidden"
                  data-testid="csv-file-input"
                />
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  data-testid="upload-csv-button"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  {isUploading ? "Uploading..." : "Select CSV File"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Styles Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Current Styles ({styles?.length || 0})</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-muted-foreground">Loading styles...</p>
            ) : styles && styles.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {styles.map((style) => (
                  <div key={style.id} className="border rounded-lg p-4 space-y-2">
                    <h3 className="font-medium">{style.name}</h3>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p><span className="font-medium">ID:</span> {style.styleId}</p>
                      <p><span className="font-medium">Color:</span> {style.color}</p>
                      <p><span className="font-medium">Finish:</span> {style.finish}</p>
                      <p><span className="font-medium">Lighting:</span> {style.lighting}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No styles found. Upload a CSV file to add styles.</p>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
