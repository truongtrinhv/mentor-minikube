import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { PATH } from "@/common/constants/paths";

import { OTPVerificationForm } from "./components/otp-verification-form";

export default function OTPVerificationPage() {
    const [email, setEmail] = useState<string>("");
    const [purpose, setPurpose] = useState<"registration" | "login">(
        "registration",
    );
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        // Get email and purpose from URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const emailParam = urlParams.get("email");
        const purposeParam = urlParams.get("purpose") as
            | "registration"
            | "login";

        if (!emailParam) {
            setError("Email is required. Please try again.");
            return;
        }

        setEmail(emailParam);

        if (purposeParam === "login" || purposeParam === "registration") {
            setPurpose(purposeParam);
        }
    }, []);

    const handleVerificationSuccess = () => {
        // Redirect based on purpose
        if (purpose === "registration") {
            navigate(PATH.Login + "?verified=true");
        } else {
            navigate("/home");
        }
    };

    const handleBack = () => {
        // Go back based on purpose
        if (purpose === "registration") {
            navigate("/register");
        } else {
            navigate("/login");
        }
    };

    if (error) {
        return (
            <div className="container flex min-h-screen items-center justify-center py-10">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-red-500">Error</h1>
                    <p className="mt-2">{error}</p>
                    <button
                        onClick={() => (window.location.href = "/login")}
                        className="bg-primary hover:bg-primary/90 mt-4 rounded px-4 py-2 text-white"
                    >
                        Back to Login
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
            <div className="mx-auto w-full max-w-md">
                <OTPVerificationForm
                    email={email}
                    purpose={purpose}
                    onVerificationSuccess={handleVerificationSuccess}
                    onBack={handleBack}
                />
            </div>
        </div>
    );
}
