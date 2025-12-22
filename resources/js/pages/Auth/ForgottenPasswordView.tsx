import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";

interface Props {
    onBack: () => void;
}

export default function ForgottenPasswordView({ onBack }: Props) {
    const [userName, setUserName] = useState("");
    const [otp, setOtp] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [isSending, setIsSending] = useState(false);
    const [otpSent, setOtpSent] = useState(false);
    const [resendTimer, setResendTimer] = useState(0);

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (resendTimer > 0) {
            timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
        }
        return () => clearTimeout(timer);
    }, [resendTimer]);

    const validateUserName = (value: string): string | null => {
        if (!value) return "Username is required";
        if (value.length < 4) return "Username must be at least 4 characters";
        if (!/^[a-zA-Z0-9._-]+$/.test(value))
            return "Username can only contain letters, numbers, ., _, and -";
        return null;
    };

    const validateOtp = (value: string): string | null => {
        if (!value) return "OTP is required";
        if (!/^\d{6}$/.test(value)) return "OTP must be 6 digits";
        return null;
    };

    const sendOTPCode = async (userName: string) => {
        const validationError = validateUserName(userName);
        if (validationError) {
            setError(validationError);
            setSuccessMessage(null);
            return;
        }

        try {
            setError(null);
            setIsSending(true);
            setSuccessMessage(null);

            // VERIFY OTP SENDING HERE
            console.log("Sending OTP for username:", userName);
            await new Promise((resolve) => setTimeout(resolve, 2000));

            setOtpSent(true);
            setSuccessMessage("OTP has been sent to your registered mobile number.");
            setResendTimer(60);
        } catch {
            setError("Failed to send OTP. Please try again.");
        } finally {
            setIsSending(false);
        }
    };

    const submitOTP = async () => {
        const otpError = validateOtp(otp);
        if (otpError) {
            setError(otpError);
            setSuccessMessage(null);
            return;
        }

        try {
            setError(null);
            setIsSending(true);

            // CALL API VERIFICATION HERE
            console.log("Verifying OTP:", otp);
            await new Promise((resolve) => setTimeout(resolve, 2000));

            setSuccessMessage("OTP verified! You can now reset your password.");
            setOtp("");
        } catch {
            setError("Invalid OTP. Please try again.");
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="flex flex-col justify-center items-center bg-white px-4 py-10">
            {/* Header */}
            <div className="w-full max-w-md mb-4">
                <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center gap-2 px-0 text-gray-600 hover:text-black"
                    onClick={onBack}
                >
                    <ArrowLeft className="h-4 w-4" /> Back
                </Button>

                <h1 className="text-xl font-semibold mt-2">Forgot your password?</h1>
                <p className="mt-1 text-sm text-gray-700">
                    Enter your username and we’ll send you a one-time password (OTP)
                    using your registered mobile number.
                </p>
            </div>

            {/* Form */}
            <div className="w-full max-w-md space-y-3">
                {!otpSent && (
                    <>
                        <div className="flex flex-col space-y-1">
                            <Label htmlFor="userName">Username</Label>
                            <Input
                                id="userName"
                                type="text"
                                placeholder="juan123"
                                value={userName}
                                onChange={(e) => {
                                    setUserName(e.target.value);
                                    if (error) setError(validateUserName(e.target.value));
                                    if (successMessage) setSuccessMessage(null);
                                }}
                            />
                            {error && <p className="text-xs text-red-600">{error}</p>}
                            {successMessage && <p className="text-xs text-green-600">{successMessage}</p>}
                        </div>

                        <Button
                            className="w-full h-10 bg-gradient-to-r from-red-500 to-orange-500 text-white hover:opacity-90"
                            disabled={isSending || !userName}
                            onClick={() => sendOTPCode(userName)}
                        >
                            {isSending ? "Sending..." : "Send OTP"}
                        </Button>
                    </>
                )}

                {otpSent && (
                    <>
                        <div className="flex flex-col space-y-1">
                            <Label htmlFor="otp">Enter OTP</Label>
                            <Input
                                id="otp"
                                type="text"
                                maxLength={6}
                                placeholder="123456"
                                value={otp}
                                onChange={(e) => {
                                    setOtp(e.target.value.replace(/\D/g, ""));
                                    if (error) setError(validateOtp(e.target.value));
                                    if (successMessage) setSuccessMessage(null);
                                }}
                            />
                            {error && <p className="text-xs text-red-600">{error}</p>}
                            {successMessage && <p className="text-xs text-green-600">{successMessage}</p>}
                        </div>

                        <div className="flex gap-2 mt-2">
                            <Button
                                className="flex-1 h-10 bg-gradient-to-r from-red-500 to-orange-500 text-white hover:opacity-90"
                                disabled={isSending || !otp}
                                onClick={submitOTP}
                            >
                                {isSending ? "Verifying..." : "Submit OTP"}
                            </Button>

                            <Button
                                className={`flex-1 h-10 ${resendTimer > 0
                                        ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                                        : "bg-gradient-to-r from-red-500 to-orange-500 text-white hover:opacity-90"
                                    }`}
                                disabled={resendTimer > 0 || isSending}
                                onClick={() => sendOTPCode(userName)}
                            >
                                {resendTimer > 0 ? `Resend OTP (${resendTimer}s)` : "Resend OTP"}
                            </Button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
