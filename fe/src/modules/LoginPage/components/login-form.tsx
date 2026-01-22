import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import type { z } from "zod";

import { Button } from "@/common/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/common/components/ui/card";
import { Checkbox } from "@/common/components/ui/checkbox";
import { Input } from "@/common/components/ui/input";
import { Label } from "@/common/components/ui/label";
import { REMEMBER_ME_KEY } from "@/common/constants/keys";
import { useAuthContext } from "@/common/context/auth-context";

import { loginSchema } from "../utils/schemas";

export function LoginForm() {
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuthContext();
    const navigate = useNavigate();

    const form = useForm({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: "",
            rememberMe: false,
        },
    });

    useEffect(() => {
        if (localStorage.getItem(REMEMBER_ME_KEY) === "true") {
            form.setValue("rememberMe", true);
        } else {
            form.setValue("rememberMe", false);
            localStorage.removeItem(REMEMBER_ME_KEY);
        }
    }, []);

    async function onSubmit(values: z.infer<typeof loginSchema>) {
        setIsLoading(true);
        try {
            if (values.rememberMe == true)
                localStorage.setItem(REMEMBER_ME_KEY, "true");
            else localStorage.removeItem(REMEMBER_ME_KEY);
            const route = await login({
                email: values.email,
                password: values.password,
            });
            navigate(route);
        } catch (err) {
            console.error("Login failed:", err);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Card className="w-full max-w-md">
            <CardHeader className="space-y-1">
                <CardTitle className="text-center text-2xl">Sign in</CardTitle>
                <CardDescription className="text-center">
                    Enter your email and password to login to your account
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-6"
                >
                    <div className="space-y-3">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="email@example.com"
                            {...form.register("email")}
                        />
                        {form.formState.errors.email && (
                            <p className="text-sm text-red-500">
                                {form.formState.errors.email.message}
                            </p>
                        )}
                    </div>
                    <div className="space-y-3">
                        <Label htmlFor="password">Password</Label>
                        <div className="relative">
                            <Input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                placeholder=""
                                {...form.register("password")}
                            />
                            <button
                                type="button"
                                className="absolute inset-y-0 right-0 flex items-center pr-3"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? (
                                    <EyeOff className="h-5 w-5 text-gray-400" />
                                ) : (
                                    <Eye className="h-5 w-5 text-gray-400" />
                                )}
                            </button>
                        </div>
                        {form.formState.errors.password && (
                            <p className="text-sm text-red-500">
                                {form.formState.errors.password.message}
                            </p>
                        )}
                    </div>
                    <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="remember"
                                checked={form.watch("rememberMe")}
                                onCheckedChange={(checked) =>
                                    form.setValue("rememberMe", !!checked)
                                }
                            />
                            <Label
                                htmlFor="remember"
                                className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                                Remember me
                            </Label>
                        </div>
                        <a
                            href="/forgot-password"
                            className="text-primary text-sm hover:underline"
                        >
                            Forgot password?
                        </a>
                    </div>
                    <Button
                        disabled={isLoading}
                        type="submit"
                        className="mt-4 w-full"
                    >
                        {isLoading ? (
                            <div className="flex items-center justify-center gap-2">
                                <Loader2 className="animate-spin" />
                                <span>Signing in...</span>
                            </div>
                        ) : (
                            "Sign in"
                        )}
                    </Button>
                </form>
            </CardContent>
            <CardFooter className="flex flex-col items-center justify-center space-y-2">
                <div className="text-muted-foreground text-sm">
                    Don't have an account?{" "}
                    <Link
                        to="/register"
                        className="text-primary underline-offset-4 hover:underline"
                    >
                        Sign up
                    </Link>
                </div>
            </CardFooter>
        </Card>
    );
}
