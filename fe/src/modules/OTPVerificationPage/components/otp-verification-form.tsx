import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Loader2 } from "lucide-react";
import type { KeyboardEvent } from "react";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/common/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/common/components/ui/card";
import { Input } from "@/common/components/ui/input";
import { useAuthContext } from "@/common/context/auth-context";
import authService from "@/common/services/authServices";

import type { OTPFormValues } from "../types";
import { otpSchema } from "../utils/schemas";

type OTPVerificationFormProps = {
    email: string;
    onVerificationSuccess: () => void;
    onBack?: () => void;
    purpose: "registration" | "login";
};

export function OTPVerificationForm({
    email,
    onVerificationSuccess,
    onBack,
    purpose,
}: OTPVerificationFormProps) {
    const [isVerifying, setIsVerifying] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [otpValues, setOtpValues] = useState<string[]>(Array(6).fill(""));
    const [canResendOtp, setCanResendOtp] = useState(false);
    const [resendCountdown, setResendCountdown] = useState(60);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
    const { verify } = useAuthContext();
    // Form state for OTP verification
    const otpForm = useForm<OTPFormValues>({
        resolver: zodResolver(otpSchema),
        defaultValues: {
            otp: "",
        },
    });

    // Update OTP value whenever otpValues changes
    useEffect(() => {
        const otpString = otpValues.join("");
        otpForm.setValue("otp", otpString);
    }, [otpValues, otpForm]);

    // Handle OTP input change
    const handleOtpChange = (index: number, value: string) => {
        // Only allow numbers
        if (!/^\d*$/.test(value)) return;

        const newOtpValues = [...otpValues];
        // Only take the last character if more than one is pasted/entered
        newOtpValues[index] = value.slice(-1);
        setOtpValues(newOtpValues);

        // Auto focus next input if a digit was entered
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    // Handle keyboard navigation between OTP inputs
    const handleKeyDown = (
        index: number,
        e: KeyboardEvent<HTMLInputElement>,
    ) => {
        if (e.key === "Backspace") {
            if (!otpValues[index] && index > 0) {
                // If current input is empty and backspace is pressed, focus previous input
                inputRefs.current[index - 1]?.focus();
            }
        } else if (e.key === "ArrowLeft" && index > 0) {
            inputRefs.current[index - 1]?.focus();
        } else if (e.key === "ArrowRight" && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    // Handle paste for OTP
    const handleOtpPaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData("text/plain").trim();
        if (!/^\d+$/.test(pastedData)) return; // Only allow numbers

        const digits = pastedData.slice(0, 6).split("");
        const newOtpValues = [...otpValues];

        digits.forEach((digit, index) => {
            if (index < 6) {
                newOtpValues[index] = digit;
            }
        });

        setOtpValues(newOtpValues);

        // Focus the input after the last filled position
        if (digits.length < 6) {
            inputRefs.current[digits.length]?.focus();
        }
    };

    // Resend OTP countdown timer
    useEffect(() => {
        let timer: NodeJS.Timeout;

        if (!canResendOtp) {
            timer = setInterval(() => {
                setResendCountdown((prev) => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        setCanResendOtp(true);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }

        return () => clearInterval(timer);
    }, [canResendOtp]);

    // Resend OTP
    const resendOtp = async () => {
        if (!canResendOtp) return;

        setIsResending(true);
        setError(null);
        try {
            await authService.resendVerifyEmail({
                email: email,
            });
            toast.success("OTP has been sent! Please check your email.");
            setCanResendOtp(false);
            setResendCountdown(60);
        } catch (error) {
            console.error("Failed to resend OTP:", error);
        } finally {
            setIsResending(false);
        }
    };

    // Verify OTP
    const verifyOtp = async (values: OTPFormValues) => {
        setIsVerifying(true);
        setError(null);
        try {
            await verify({
                email: email,
                code: values.otp,
            });
            // Call success callback
            toast.success(
                purpose === "registration"
                    ? "Email verification successful! Completing registration..."
                    : "Email verification successful! Redirecting to home page...",
            );
            onVerificationSuccess();
        } catch (error) {
            console.error("OTP verification failed:", error);
        } finally {
            setIsVerifying(false);
        }
    };

    return (
        <Card className="mx-auto w-full max-w-md">
            <CardHeader className="space-y-1">
                <CardTitle className="text-center text-2xl">
                    Email Verification
                </CardTitle>
                <CardDescription className="text-center">
                    Enter the 6-digit code sent to {email}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form
                    onSubmit={otpForm.handleSubmit(verifyOtp)}
                    className="space-y-4"
                >
                    <div className="space-y-2">
                        <div
                            className="mx-auto flex justify-center"
                            onPaste={handleOtpPaste}
                        >
                            {[0, 1, 2, 3, 4, 5].map((index) => (
                                <Input
                                    key={index}
                                    ref={(el) => {
                                        inputRefs.current[index] = el;
                                        return undefined;
                                    }}
                                    type="text"
                                    maxLength={1}
                                    className="m-2 h-12 w-12 p-0 text-center text-xl font-semibold"
                                    value={otpValues[index]}
                                    onChange={(e) =>
                                        handleOtpChange(index, e.target.value)
                                    }
                                    onKeyDown={(e) => handleKeyDown(index, e)}
                                    autoFocus={index === 0}
                                />
                            ))}
                        </div>

                        <input
                            type="hidden"
                            {...otpForm.register("otp")}
                            value={otpValues.join("")}
                        />

                        {otpForm.formState.errors.otp && (
                            <p className="text-sm text-red-500">
                                {otpForm.formState.errors.otp.message}
                            </p>
                        )}

                        {error && (
                            <p className="text-center text-sm text-red-500">
                                {error}
                            </p>
                        )}

                        <div className="mt-4 text-center">
                            <p className="text-muted-foreground mb-2 text-sm">
                                Didn't receive the OTP?
                            </p>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={resendOtp}
                                disabled={!canResendOtp || isResending}
                            >
                                {isResending ? (
                                    <div className="flex items-center justify-center gap-2">
                                        <Loader2 className="animate-spin" />
                                        <span>Sending...</span>
                                    </div>
                                ) : canResendOtp ? (
                                    "Resend OTP"
                                ) : (
                                    `Resend after ${resendCountdown}s`
                                )}
                            </Button>
                        </div>
                    </div>

                    <Button
                        disabled={isVerifying}
                        type="submit"
                        className="w-full"
                    >
                        {isVerifying ? (
                            <div className="flex items-center justify-center gap-2">
                                <Loader2 className="animate-spin" />
                                <span>Verifying...</span>
                            </div>
                        ) : (
                            "Verify"
                        )}
                    </Button>
                </form>
            </CardContent>
            <CardFooter>
                {onBack && (
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onBack}
                        className="w-full"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back
                    </Button>
                )}
            </CardFooter>
        </Card>
    );
}
