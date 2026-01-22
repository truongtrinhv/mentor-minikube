import { PasswordResetForm } from "./components/password-reset-form";

export default function ForgotPassword() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
            <div className="mx-auto w-full max-w-md">
                <PasswordResetForm />
            </div>
        </div>
    );
}
