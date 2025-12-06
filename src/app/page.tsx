"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { ProgressNav } from "@/components/progress-nav";
import { useCeilingGenerator } from "@/hooks/use-ceiling-generator";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CloudUpload, Check, Image, Trash2, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

export default function UploadPage() {
  const router = useRouter();
  const { uploadImage, state, isUploading, reset } = useCeilingGenerator();
  const { toast } = useToast();
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<{ name: string; size: string } | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      processFile(files[0]);
    }
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  }, []);

  const processFile = async (file: File) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a JPEG or PNG image.",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 10MB.",
        variant: "destructive",
      });
      return;
    }

    try {
      await uploadImage(file);
      setUploadedFile({
        name: file.name,
        size: (file.size / 1024 / 1024).toFixed(1) + " MB",
      });
      toast({
        title: "Upload successful",
        description: "Your ceiling image has been uploaded.",
      });
    } catch {
      toast({
        title: "Upload failed",
        description: "There was an error uploading your image. Please try again.",
        variant: "destructive",
      });
    }
  };

  const removeImage = () => {
    setUploadedFile(null);
    reset();
  };

  const canContinue = state.uploadedImage && !isUploading;

  return (
    <div className="bg-background font-sans min-h-screen">
      <ProgressNav currentStep={1} totalSteps={6} />

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Upload Your Ceiling Image
          </h2>
          <p className="text-lg text-muted-foreground">
            Take or upload a photo of your ceiling to get started
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          {!state.uploadedImage ? (
            <Card
              className={cn(
                "border-2 border-dashed cursor-pointer transition-colors relative",
                isDragging ? "border-accent bg-accent/5" : "border-border hover:border-accent"
              )}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={(e) => {
                e.stopPropagation();
                document.getElementById("file-input")?.click();
              }}
              data-testid="upload-zone"
            >
              <CardContent className="p-12 text-center">
                <CloudUpload className="mx-auto text-4xl text-muted-foreground mb-4" size={48} />
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  Drag & drop your ceiling image
                </h3>
                <p className="text-muted-foreground mb-4">
                  or click to select from your device
                </p>
                <div className="flex items-center justify-center space-x-4 text-sm text-muted-foreground">
                  <span className="flex items-center">
                    <Check className="text-accent mr-1" size={16} />
                    JPG, PNG supported
                  </span>
                  <span className="flex items-center">
                    <Check className="text-accent mr-1" size={16} />
                    Max 10MB
                  </span>
                </div>
                <input
                  type="file"
                  id="file-input"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  accept="image/*"
                  onChange={handleFileSelect}
                  onClick={(e) => e.stopPropagation()}
                  data-testid="file-input"
                />
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-4">
                <img
                  src={state.uploadedImage}
                  alt="Ceiling preview"
                  className="w-full h-64 object-cover rounded-lg mb-4"
                  data-testid="preview-image"
                />
                <div className="flex items-center justify-between bg-secondary p-4 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Image className="text-accent" size={20} />
                    <div>
                      <p className="font-medium text-foreground">
                        {uploadedFile?.name || "ceiling-photo.jpg"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {uploadedFile?.size || "2.1 MB"}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={removeImage}
                    data-testid="button-remove-image"
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="mt-8 text-center">
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                size="lg"
                disabled={!canContinue}
                onClick={() => router.push("/color")}
                data-testid="button-continue"
              >
                {isUploading ? "Uploading..." : "Continue to Color Selection"}
                {!isUploading && <span className="ml-2">→</span>}
              </Button>

              <Button
                variant="outline"
                size="lg"
                onClick={() => router.push("/admin")}
                data-testid="button-admin"
              >
                <Settings className="mr-2 h-4 w-4" />
                Admin Panel
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
