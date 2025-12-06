"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ProgressNav } from "@/components/progress-nav";
import { useCeilingGenerator } from "@/hooks/use-ceiling-generator";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Download,
  Share2,
  RefreshCcw,
  Image as ImageIcon,
  Wand2,
  Check,
  Lightbulb,
  Sparkles,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ResultPage() {
  const router = useRouter();
  const { state, reset, isGenerating } = useCeilingGenerator();
  const { toast } = useToast();

  useEffect(() => {
    if (
      !state.uploadedImage ||
      !state.selectedColor ||
      !state.selectedFinish ||
      !state.selectedLighting ||
      !state.selectedDesign
    ) {
      router.replace("/");
      return;
    }

    console.log("Result page state:", {
      hasGenerationResult: !!state.generationResult,
      generatedImageUrl: state.generationResult?.generation?.generatedImageUrl,
      isGenerating,
    });
  }, [state, router, isGenerating]);

  if (
    !state.uploadedImage ||
    !state.selectedColor ||
    !state.selectedFinish ||
    !state.selectedLighting ||
    !state.selectedDesign
  )
    return null;

  const hasResult = state.generationResult && !isGenerating;
  const isLoading = isGenerating;

  const colorNames: Record<string, string> = {
    white: "Classic White",
    cream: "Warm Cream",
    beige: "Soft Beige",
    gray: "Modern Gray",
    blue: "Sky Blue",
    green: "Sage Green",
    black: "Deep Black",
    brown: "Rich Brown",
    yellow: "Sunny Yellow",
    red: "Warm Red",
  };

  const handleDownload = () => {
    if (state.generationResult?.generation?.generatedImageUrl) {
      const link = document.createElement("a");
      link.href = state.generationResult.generation.generatedImageUrl;
      link.download = "ceiling-design.jpg";
      link.click();
    }
    toast({
      title: "Download started",
      description: "Your ceiling design is being downloaded.",
    });
  };

  const handleShare = async () => {
    const imageUrl = state.generationResult?.generation?.generatedImageUrl;
    if (navigator.share && imageUrl) {
      try {
        await navigator.share({
          title: "My Ceiling Design",
          text: "Check out my AI-generated ceiling design!",
          url: imageUrl,
        });
      } catch {
        if (imageUrl) {
          await navigator.clipboard.writeText(imageUrl);
          toast({
            title: "Link copied",
            description: "Design link copied to clipboard.",
          });
        }
      }
    } else if (imageUrl) {
      await navigator.clipboard.writeText(imageUrl);
      toast({
        title: "Link copied",
        description: "Design link copied to clipboard.",
      });
    }
  };

  const handleCreateNew = () => {
    reset();
    router.push("/");
  };

  return (
    <div className="bg-background font-sans min-h-screen">
      <ProgressNav currentStep={6} totalSteps={6} />

      <main className="max-w-4xl mx-auto px-4 py-8">
        {isLoading || !hasResult ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-accent/10 rounded-full mb-6">
              <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Generating Your Ceiling Design
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Our AI is analyzing your preferences and creating a personalized
              ceiling design just for you...
            </p>
          </div>
        ) : (
          <div>
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-foreground mb-4">
                Your New Ceiling Design
              </h2>
              <p className="text-lg text-muted-foreground">
                Here's your AI-generated ceiling transformation
              </p>
            </div>

            <div className="max-w-4xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <Card className="overflow-hidden shadow-lg">
                  <CardHeader className="bg-muted/50 py-3">
                    <CardTitle className="text-foreground flex items-center text-base">
                      <ImageIcon className="text-muted-foreground mr-2" size={16} />
                      Original Ceiling
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <img
                      src={state.uploadedImage!}
                      alt="Original ceiling"
                      className="w-full h-64 object-cover"
                      data-testid="original-image"
                    />
                  </CardContent>
                </Card>

                <Card className="overflow-hidden shadow-lg">
                  <CardHeader className="bg-accent/10 py-3">
                    <CardTitle className="text-foreground flex items-center text-base">
                      <Wand2 className="text-accent mr-2" size={16} />
                      AI-Generated Design
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <img
                      src={
                        state.generationResult?.generation?.generatedImageUrl!
                      }
                      alt="Generated ceiling design"
                      className="w-full h-64 object-cover"
                      data-testid="generated-image"
                    />
                  </CardContent>
                </Card>
              </div>

              <Card className="mb-8 shadow-lg">
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-foreground mb-4">
                    Design Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-secondary rounded-lg">
                      <div className="w-8 h-8 bg-white rounded-full mx-auto mb-2 border-2 border-border" />
                      <p
                        className="font-medium text-foreground"
                        data-testid="selected-color"
                      >
                        {colorNames[state.selectedColor!] ||
                          state.selectedColor}
                      </p>
                      <p className="text-sm text-muted-foreground">Color</p>
                    </div>
                    <div className="text-center p-4 bg-secondary rounded-lg">
                      <Sparkles
                        className="mx-auto text-2xl text-accent mb-2"
                        size={24}
                      />
                      <p
                        className="font-medium text-foreground"
                        data-testid="selected-finish"
                      >
                        {
                          state.generationResult?.generation?.style
                            ?.name
                        }
                      </p>
                      <p className="text-sm text-muted-foreground">Finish</p>
                    </div>
                    <div className="text-center p-4 bg-secondary rounded-lg">
                      <Lightbulb
                        className="mx-auto text-2xl text-accent mb-2"
                        size={24}
                      />
                      <p
                        className="font-medium text-foreground"
                        data-testid="selected-lighting"
                      >
                        {state.selectedLighting}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Lighting
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="text-center space-y-4">
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <Button onClick={handleDownload} data-testid="button-download">
                    <Download className="mr-2" size={16} />
                    Download Design
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={handleShare}
                    data-testid="button-share"
                  >
                    <Share2 className="mr-2" size={16} />
                    Share Design
                  </Button>
                </div>
                <div className="pt-4">
                  <Button
                    variant="outline"
                    onClick={handleCreateNew}
                    data-testid="button-create-new"
                  >
                    <RefreshCcw className="mr-2" size={16} />
                    Create Another Design
                  </Button>
                </div>
              </div>

              <Card className="mt-8 border-green-200 bg-green-50">
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <Check className="text-green-600 mr-3" size={20} />
                    <div>
                      <p className="font-medium text-green-800">
                        Design Saved Successfully!
                      </p>
                      <p className="text-sm text-green-600">
                        Your ceiling design has been automatically saved to your
                        gallery.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
