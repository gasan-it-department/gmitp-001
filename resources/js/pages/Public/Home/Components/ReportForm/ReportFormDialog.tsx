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
import {
  Upload,
  X,
  CheckCircle2,
  AlertTriangle,
  FileIcon,
} from "lucide-react";
import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import ClassicDialog from "@/pages/Utility/ClassicDialog";
import MapCoordinates from "./MapCoordinates";
import { Progress } from "@/components/ui/progress";

interface ReportFormValues {
  issueType: string;
  location: string;
  description: string;
  fullName?: string;
  phone: string;
  latitude?: string;
  longitude?: string;
  files: File[];
}

interface ReportFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ReportFormDialog({ open, onOpenChange }: ReportFormDialogProps) {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isGettingCoordinates, setIsGettingCoordinates] = useState(false);
  const [classicDialog, setClassicDialog] = useState({
    title: "",
    message: "",
    positiveButtonTitle: "",
    negativeButtonTitle: "",
    isShowing: false,
    hideNegativeButton: false,
  });
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    clearErrors,
    watch,
    formState: { errors },
    reset,
  } = useForm<ReportFormValues>({
    defaultValues: {
      issueType: "",
      location: "",
      description: "",
      fullName: "",
      phone: "",
      latitude: "",
      longitude: "",
      files: [],
    },
    mode: "onSubmit"
  });

  const files = watch("files");
  const MAX_FILES = 5;
  const MAX_TOTAL_SIZE = 50 * 1024 * 1024; // 50MB

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const newFiles = Array.from(e.target.files);
    const combined = [...files, ...newFiles].slice(0, MAX_FILES);

    const totalSize = combined.reduce((acc, file) => acc + file.size, 0);
    if (totalSize > MAX_TOTAL_SIZE) {
      setError("Total file size exceeds 50MB limit.");
      return;
    }
    setError(null);
    setValue("files", combined);
  };

  const removeFile = (index: number) => {
    const updatedFiles = files.filter((_, i) => i !== index);
    setValue("files", updatedFiles);
  };

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      setIsGettingCoordinates(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setValue("latitude", String(position.coords.latitude));
          setValue("longitude", String(position.coords.longitude));
          setIsGettingCoordinates(false);
        },
        (error) => {
          setClassicDialog((prev) => ({
            ...prev,
            title: "Permission Denied",
            message: "Unable to get coordinates. Please allow Location permission.",
            hideNegativeButton: true,
            positiveButtonTitle: "Close",
            isShowing: true,
          }));
          console.error(error);
          setIsGettingCoordinates(false);
        }
      );
    } else {
      alert("Geolocation is not supported by this browser.");
      setIsGettingCoordinates(false);
    }
  };

  const onSubmit = (data: ReportFormValues) => {
    console.log("Report Submitted:", data);
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      reset();
      setError(null);
      onOpenChange(false);
    }, 3000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className="max-h-[90vh] w-full sm:max-w-3xl overflow-y-auto p-6 sm:p-8">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            Report Local Issue
          </DialogTitle>
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
          <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-8">
            {/* Issue Type */}
            <div className="space-y-3">
              <Label className="font-semibold">
                Type of Issue <span className="text-destructive">*</span>
              </Label>
              <Controller
                control={control}
                name="issueType"
                rules={{ required: "Please select an issue type." }}
                render={({ field }) => (
                  <RadioGroup
                    value={field.value}
                    onValueChange={(value) => {
                      field.onChange(value);
                      clearErrors("issueType");
                    }}
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
                )}
              />
              {errors.issueType && (
                <p className="text-sm text-destructive">{errors.issueType.message}</p>
              )}
            </div>

            {/* Location */}
            <div className="space-y-3">
              <Label htmlFor="location" className="font-semibold">
                Location <span className="text-destructive">*</span>
              </Label>
              <Input
                id="location"
                placeholder="e.g., Barangay Poblacion, near the municipal hall"
                {...register("location", { required: "Location is required." })}
                className={errors.location ? "border-destructive" : ""}
              />
              {errors.location && (
                <p className="text-sm text-destructive">{errors.location.message}</p>
              )}

              <div className="grid sm:grid-cols-2 gap-3 pt-3">
                <Input type="text" placeholder="Latitude" {...register("latitude")} readOnly />
                <Input type="text" placeholder="Longitude" {...register("longitude")} readOnly />
              </div>

              {watch("latitude") && watch("longitude") && (
                <div className="relative mt-3 h-64 w-full z-10 overflow-hidden rounded-xl border">
                  <MapCoordinates
                    latitude={Number(watch("latitude"))}
                    longitude={Number(watch("longitude"))}
                  />
                </div>
              )}

              <Button
                type="button"
                variant="outline"
                className="mt-2"
                onClick={handleGetLocation}
                disabled={isGettingCoordinates}
              >
                {isGettingCoordinates ? "Getting coordinates..." : "Get GPS Coordinates"}
              </Button>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="font-semibold">
                Description <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="description"
                rows={5}
                placeholder="Describe the issue in detail..."
                {...register("description", { required: "Description is required." })}
                className={errors.description ? "border-destructive" : ""}
              />
              {errors.description && (
                <p className="text-sm text-destructive">{errors.description.message}</p>
              )}
            </div>

            {/* File Upload (Feedback-style) */}
            <div className="space-y-3">
              <Label className="font-semibold text-foreground">Upload Photos or Videos (Optional)</Label>
              <p className="text-sm text-muted-foreground">
                You may upload up to <span className="font-semibold">5 files</span> — total size must not exceed{" "}
                <span className="font-semibold">50MB</span>.
              </p>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById("evidence")?.click()}
                  className="sm:w-auto"
                  disabled={files.length >= MAX_FILES}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  {files.length >= MAX_FILES ? "Max Files Reached" : "Choose Files"}
                </Button>

                <input
                  id="evidence"
                  type="file"
                  multiple
                  accept="image/*,video/*,.pdf,.doc,.docx"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 text-destructive text-sm bg-destructive/10 p-2 rounded-md">
                  <AlertTriangle className="h-4 w-4" />
                  {error}
                </div>
              )}

              {files.length > 0 && (
                <div className="mt-2 space-y-2">
                  {files.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between gap-2 rounded-md bg-muted px-3 py-2 text-sm text-foreground"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <FileIcon className="h-4 w-4 text-muted-foreground" />
                        <span className="truncate">{file.name}</span>
                        <span className="text-xs text-muted-foreground">
                          ({(file.size / (1024 * 1024)).toFixed(1)} MB)
                        </span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                        className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Personal Info */}
            <div className="space-y-5 border-t pt-6">
              <h3 className="text-lg font-semibold">Your Information</h3>
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <Label htmlFor="fullName" className="font-semibold text-foreground">
                    Full Name (Optional)
                  </Label>
                  <Input id="fullName" placeholder="Full name (optional)" {...register("fullName")} />
                </div>

                <div>
                  <Label htmlFor="tel" className="font-semibold text-foreground">
                    Contact Number (Optional)
                  </Label>
                  <Input
                    id="tel"
                    type="tel"
                    placeholder="+63 912 345 6789"
                    {...register("phone")}
                  />
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex flex-row gap-4 pt-4">
              <Button type="button" variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-gradient-to-r from-red-500 to-orange-500 text-white hover:opacity-90"
              >
                Submit Report
              </Button>
            </div>
          </form>
        )}

        <ClassicDialog
          title={classicDialog.title}
          message={classicDialog.message}
          positiveButtonText={classicDialog.positiveButtonTitle}
          negativeButtonText={classicDialog.negativeButtonTitle}
          hideNegativeButton={classicDialog.hideNegativeButton}
          onPositiveClick={() => setClassicDialog((prev) => ({ ...prev, isShowing: false }))}
          onNegativeClick={() => setClassicDialog((prev) => ({ ...prev, isShowing: false }))}
          open={classicDialog.isShowing}
        />
      </DialogContent>
    </Dialog>
  );
}
