import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, X, CheckCircle2, MapPin, AlertTriangle } from "lucide-react";
import { useState } from "react";
import ClassicDialog from "@/pages/Utility/ClassicDialog";

interface ReportFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ReportFormDialog({ open, onOpenChange }: ReportFormDialogProps) {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [fileName, setFileName] = useState("");
  const [formData, setFormData] = useState({
    issueType: "",
    location: "",
    description: "",
    fullName: "",
    phone: "",
    latitude: "",
    longitude: "",
  });

  const [errors, setErrors] = useState<{
    longitude?: any;
    latitude?: any;
    issueType?: string;
    location?: string;
    description?: string;
    phone?: string;
  }>({});

  const [classicDialog, setClassicDialog] = useState({
    title: "",
    message: "",
    positiveButtonTitle: "",
    negativeButtonTitle: "",
    isShowing: false,
    hideNegativeButton: false
  });

  const handleInputChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };


  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) setFileName(files[0].name);
  };

  const removeFile = () => setFileName("");

  const handleSubmit = (e: { preventDefault: () => void; }) => {
    try {
      e.preventDefault();
      const newErrors: {
        issueType?: string;
        location?: string;
        description?: string;
        phone?: string;
      } = {};

      if (!formData.issueType) newErrors.issueType = "Please select an issue type.";
      if (!formData.location) newErrors.location = "Location is required.";
      if (!formData.description) newErrors.description = "Description is required.";
      if (!formData.phone) newErrors.phone = "Phone number is required.";

      setErrors(newErrors);
      if (Object.keys(newErrors).length === 0) {
        setIsSubmitted(true);
        setTimeout(() => {
          setIsSubmitted(false);
          onOpenChange(false);
        }, 3000);
      }
    } catch (error) {
      setClassicDialog(prev => ({
        ...prev,
        title: "Oops! Something went wrong!",
        message:
          error instanceof Error
            ? error.message
            : String(error),
        hideNegativeButton: true,
        positiveButtonTitle: "Close",
        isShowing: true,
      }));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] w-full sm:max-w-3xl overflow-y-auto p-6 sm:p-8">
        <DialogHeader className="mb-2 flex flex-col items-start">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-7 w-7 text-orange-500" />
            <DialogTitle className="text-2xl font-bold text-foreground">
              Report Local Issue
            </DialogTitle>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Help your community by reporting damaged roads, broken streetlights, or other local concerns.
          </p>
        </DialogHeader>

        {isSubmitted ? (
          <Alert className="bg-success/10 border-success/20 duration-300 animate-in fade-in-0 zoom-in-95">
            <CheckCircle2 className="text-success h-5 w-5" />
            <AlertDescription className="text-success font-medium">
              ✅ Issue reported successfully! Thank you for helping your community.
            </AlertDescription>
          </Alert>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 space-y-8">
            {/* Issue Type */}
            <div className="space-y-3">
              <Label className="text-base font-semibold text-foreground">
                Type of Issue <span className="text-destructive">*</span>
              </Label>
              <RadioGroup
                value={formData.issueType}
                onValueChange={(value) => handleInputChange("issueType", value)}
                className="flex flex-wrap gap-4 pt-2"
              >
                {["Road Damage", "Streetlight", "Garbage", "Water Leak", "Others"].map(
                  (issue) => (
                    <div key={issue} className="flex items-center space-x-2">
                      <RadioGroupItem value={issue.toLowerCase()} id={issue} />
                      <Label htmlFor={issue} className="cursor-pointer font-normal">
                        {issue}
                      </Label>
                    </div>
                  )
                )}
              </RadioGroup>
              {errors.issueType && (
                <p className="text-sm text-destructive">{errors.issueType}</p>
              )}
            </div>

            {/* Location */}
            <div className="space-y-2">
              <div className="space-y-2">
                <Label htmlFor="location" className="font-semibold text-foreground">
                  Location <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => handleInputChange("location", e.target.value)}
                  placeholder="e.g., Barangay Poblacion, near the municipal hall"
                  className={errors.location ? "border-destructive" : ""}
                />
                {errors.location && (
                  <p className="text-sm text-destructive">{errors.location}</p>
                )}

                {/* GPS Coordinates Section */}
                <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="space-y-1">
                    <Label htmlFor="latitude" className="text-sm font-medium text-foreground">
                      GPS Latitude
                    </Label>
                    <Input
                      id="latitude"
                      type="number"
                      step="any"
                      value={formData.latitude}
                      onChange={(e) => handleInputChange("latitude", e.target.value)}
                      placeholder="e.g., 13.3265"
                      className={errors.latitude ? "border-destructive" : ""}
                      readOnly
                    />
                    {errors.latitude && (
                      <p className="text-sm text-destructive">{errors.latitude}</p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="longitude" className="text-sm font-medium text-foreground">
                      GPS Longitude
                    </Label>
                    <Input
                      id="longitude"
                      type="number"
                      step="any"
                      value={formData.longitude}
                      onChange={(e) => handleInputChange("longitude", e.target.value)}
                      placeholder="e.g., 121.8677"
                      className={errors.longitude ? "border-destructive" : ""}
                      readOnly
                    />
                    {errors.longitude && (
                      <p className="text-sm text-destructive">{errors.longitude}</p>
                    )}
                  </div>
                </div>

                {/* Button to Get GPS */}
                <div className="pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full sm:w-auto"
                    onClick={() => {
                      if (navigator.geolocation) {
                        navigator.geolocation.getCurrentPosition(
                          (position) => {
                            handleInputChange("latitude", position.coords.latitude);
                            handleInputChange("longitude", position.coords.longitude);
                            console.log("Latitude:" + position.coords.latitude);
                            console.log("Longitudde:" + position.coords.longitude);
                          },
                          (error) => {
                            setClassicDialog(prev => ({
                              ...prev,
                              title: "Permission Denied",
                              message: "Unable to get coordinates. Please allow Location permission.",
                              hideNegativeButton: true,
                              positiveButtonTitle: "Close",
                              isShowing: true
                            }));
                            console.error(error);
                          }
                        );
                      } else {
                        alert("Geolocation is not supported by this browser.");
                      }
                    }}
                  >
                    Get GPS Coordinates
                  </Button>
                </div>
              </div>

            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="font-semibold text-foreground">
                Description <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="Describe the issue in detail..."
                rows={5}
                className={errors.description ? "border-destructive" : ""}
              />
              {errors.description && (
                <p className="text-sm text-destructive">{errors.description}</p>
              )}
            </div>

            {/* File Upload */}
            <div className="space-y-3">
              <Label className="font-semibold text-foreground">
                Upload Photo
              </Label>
              <p className="text-sm text-muted-foreground">
                You may attach a photo showing the issue to help us identify it quickly.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById("evidence")?.click()}
                  className="sm:w-auto"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Choose File
                </Button>
                {fileName && (
                  <div className="flex flex-1 items-center gap-2 rounded-md bg-muted px-3 py-2">
                    <span className="truncate text-sm text-foreground">{fileName}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={removeFile}
                      className="h-6 w-6 p-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
              <input
                id="evidence"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            {/* Personal Info */}
            <div className="space-y-5 border-t pt-6">
              <h3 className="text-lg font-semibold text-foreground">
                Your Information
              </h3>
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="font-semibold text-foreground">
                    Full Name (Optional)
                  </Label>
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) => handleInputChange("fullName", e.target.value)}
                    placeholder="Enter your full name"
                  />
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="phone" className="font-semibold text-foreground">
                    Phone Number <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    placeholder="+63 912 345 6789"
                    className={errors.phone ? "border-destructive" : ""}
                  />
                  {errors.phone && (
                    <p className="text-sm text-destructive">{errors.phone}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex flex-col gap-4 pt-4 sm:flex-row">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-gradient-to-r from-red-500 to-orange-500 text-white hover:opacity-90"
              >
                Submit Report
              </Button>
            </div>

            <ClassicDialog
              title={classicDialog.title}
              message={classicDialog.message}
              positiveButtonText={classicDialog.positiveButtonTitle}
              negativeButtonText={classicDialog.negativeButtonTitle}
              hideNegativeButton={classicDialog.hideNegativeButton}
              onPositiveClick={() => {
                setClassicDialog(prev => ({
                  ...prev,
                  isShowing: false
                }));
              }}
              onNegativeClick={() => {
                setClassicDialog(prev => ({
                  ...prev,
                  isShowing: false
                }));
              }}
              open={classicDialog.isShowing} />
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
