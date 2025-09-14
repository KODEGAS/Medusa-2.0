import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, ArrowLeft, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { sanitizeFileName, checkRateLimit } from "@/lib/sanitization";
import type { TeamInfo, MemberInfo, PaymentInfo } from "../RegistrationForm";

interface PaymentStepProps {
  teamInfo: TeamInfo;
  members: MemberInfo[];
  onComplete: (paymentData: PaymentInfo) => void;
  onBack: () => void;
}

export const PaymentStep = ({ teamInfo, members, onComplete, onBack }: PaymentStepProps) => {
  // Only upload method is available now
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const registrationFee = 3000; //  registration fee

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Sanitize filename
      const sanitizedName = sanitizeFileName(file.name);
      if (!sanitizedName || sanitizedName.length === 0) {
        toast({
          title: "Invalid file name",
          description: "Please use a file with a valid name containing only letters, numbers, and safe characters",
          variant: "destructive",
        });
        return;
      }

      // Validate file type (strict checking)
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
      const allowedExtensions = ['.jpg', '.jpeg', '.png', '.pdf'];
      
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Invalid file type",
          description: "Please upload a JPEG, PNG, or PDF file",
          variant: "destructive",
        });
        return;
      }

      // Double-check file extension
      const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
      if (!allowedExtensions.includes(fileExtension)) {
        toast({
          title: "Invalid file extension",
          description: "File extension must be .jpg, .jpeg, .png, or .pdf",
          variant: "destructive",
        });
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please upload a file smaller than 5MB",
          variant: "destructive",
        });
        return;
      }

      // Validate minimum file size (to prevent empty files)
      if (file.size < 1024) { // 1KB minimum
        toast({
          title: "File too small",
          description: "File appears to be empty or corrupted",
          variant: "destructive",
        });
        return;
      }

      // Create a new File object with sanitized name
      const sanitizedFile = new File([file], sanitizedName, { type: file.type });
      setUploadedFile(sanitizedFile);
      
      toast({
        title: "File uploaded successfully",
        description: `${file.name} has been uploaded`,
      });
    }
  };

  const handleUploadSubmit = async () => {
    if (!uploadedFile) {
      toast({
        title: "No file selected",
        description: "Please upload your payment slip",
        variant: "destructive",
      });
      return;
    }

    // Rate limiting check
    const clientId = teamInfo.leaderEmail + teamInfo.teamName;
    if (!checkRateLimit(clientId, 2, 600000)) { // 10 minute window for payment
      toast({
        title: "Too Many Attempts",
        description: "Please wait 10 minutes before submitting payment again.",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);

    const formData = new FormData();
    formData.append("receipt", uploadedFile);
    formData.append("teamName", teamInfo.teamName);

    try {
      const response = await fetch("https://medusa-backend-1081502718638.us-central1.run.app/api/payment/upload", {
        method: "POST",
        body: formData
      });
      if (!response.ok) throw new Error("Failed to upload payment slip");
      toast({
        title: "Payment slip submitted",
        description: "Your payment will be verified within 24 hours",
      });
      onComplete({ method: "upload", file: uploadedFile });
    } catch (error) {
      toast({
        title: "Upload failed",
        description: error.message || "An error occurred. Please try again.",
        variant: "destructive"
      });
    }
    setIsProcessing(false);
  };



  return (
    <div className="max-w-2xl mx-auto">
      <Card className="border-primary/20 bg-card/80 backdrop-blur-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-orbitron text-primary">
            Complete Your Registration
          </CardTitle>
          <CardDescription className="text-lg">
            Team: {teamInfo.teamName} • {members.length + 1} members • LKR {registrationFee} total
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Only upload payment slip option remains */}
          <div className="space-y-6">
              <div className="border-2 border-dashed border-primary/30 rounded-lg p-8 text-center">
                <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <div className="space-y-2">
                  <Label htmlFor="payment-slip" className="text-lg font-medium cursor-pointer">
                    Upload your payment slip
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Accepted formats: JPEG, PNG, PDF (max 5MB)
                  </p>
                </div>
                <Input
                  id="payment-slip"
                  type="file"
                  accept=".jpg,.jpeg,.png,.pdf"
                  onChange={handleFileUpload}
                  className="mt-4"
                />
                {uploadedFile && (
                  <div className="mt-4 flex items-center justify-center gap-2 text-green-600">
                    <CheckCircle size={18} />
                    <span>{uploadedFile.name}</span>
                  </div>
                )}
              </div>

              <div className="bg-muted/50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Payment Instructions:</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Transfer LKR 3000 to our bank account</li>
                  <li>• Include your team name "{teamInfo.teamName}" in the reference</li>
                  <li>• Upload a clear photo/scan of your payment receipt</li>
                  <li>• Payment will be verified within 24 hours</li>
                </ul>
              </div>

              <Button 
                onClick={handleUploadSubmit} 
                disabled={!uploadedFile || isProcessing}
                className="w-full"
                size="lg"
              >
                {isProcessing ? "Processing..." : "Submit Payment Slip"}
              </Button>
            </div>

          <div className="flex gap-4">
            <Button
              onClick={onBack}
              variant="outline"
              className="flex-1"
              disabled={isProcessing}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Member Details
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};