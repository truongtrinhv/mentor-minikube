import { LoginForm } from "./components/login-form";

export default function Login() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
            <div className="mx-auto w-full max-w-md">
                <LoginForm />
            </div>
        </div>
    );
}
