import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import type { UseFormReturn } from "react-hook-form";

import { Checkbox } from "@/common/components/ui/checkbox";
import { Input } from "@/common/components/ui/input";
import { Label } from "@/common/components/ui/label";

import type { AccountFormValues } from "../types";

type AccountStepProps = {
    form: UseFormReturn<AccountFormValues>;
    onOpenTermsDialog: () => void;
    onOpenPrivacyDialog: () => void;
};

export function AccountStep({
    form,
    onOpenTermsDialog,
    onOpenPrivacyDialog,
}: AccountStepProps) {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleTermsChange = (checked: boolean) => {
        form.setValue("termsAgreed", checked, {
            shouldValidate: true,
        });
    };

    return (
        <form className="space-y-8">
            <div className="space-y-6">
                <div className="space-y-3">
                    <Label htmlFor="email">Email</Label>
                    <Input
                        id="email"
                        type="email"
                        placeholder="email@example.com"
                        {...form.register("email", {
                            onChange: () => form.trigger("email"),
                        })}
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
                            {...form.register("password", {
                                onChange: () => {
                                    form.trigger("password");
                                    if (form.getValues("confirmPassword")) {
                                        form.trigger("confirmPassword");
                                    }
                                },
                            })}
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
                    <p className="text-muted-foreground text-sm">
                        Password must be at least 8 characters and include
                        uppercase, lowercase, number and special character.
                    </p>
                </div>

                <div className="space-y-3">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <div className="relative">
                        <Input
                            id="confirmPassword"
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder=""
                            {...form.register("confirmPassword", {
                                onChange: () => form.trigger("confirmPassword"),
                            })}
                        />
                        <button
                            type="button"
                            className="absolute inset-y-0 right-0 flex items-center pr-3"
                            onClick={() =>
                                setShowConfirmPassword(!showConfirmPassword)
                            }
                        >
                            {showConfirmPassword ? (
                                <EyeOff className="h-5 w-5 text-gray-400" />
                            ) : (
                                <Eye className="h-5 w-5 text-gray-400" />
                            )}
                        </button>
                    </div>
                    {form.formState.errors.confirmPassword && (
                        <p className="text-sm text-red-500">
                            {form.formState.errors.confirmPassword.message}
                        </p>
                    )}
                </div>

                <div className="flex items-center space-x-2">
                    <Checkbox
                        id="termsAgreed"
                        checked={form.watch("termsAgreed")}
                        onCheckedChange={handleTermsChange}
                    />
                    <Label
                        htmlFor="termsAgreed"
                        className="text-sm leading-none font-medium"
                    >
                        <p>
                            I agree to the{" "}
                            <button
                                type="button"
                                className="text-primary underline"
                                onClick={(e) => {
                                    e.preventDefault();
                                    onOpenTermsDialog();
                                }}
                            >
                                Terms of Service
                            </button>{" "}
                            and{" "}
                            <button
                                type="button"
                                className="text-primary underline"
                                onClick={(e) => {
                                    e.preventDefault();
                                    onOpenPrivacyDialog();
                                }}
                            >
                                Privacy Policy
                            </button>
                        </p>
                    </Label>
                </div>
                {form.formState.errors.termsAgreed && (
                    <p className="text-sm text-red-500">
                        {form.formState.errors.termsAgreed.message}
                    </p>
                )}
            </div>
        </form>
    );
}
