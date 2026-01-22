import { Button } from "@/common/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/common/components/ui/dialog";

type TermsDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

export function TermsDialog({ open, onOpenChange }: TermsDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[80vh] max-w-2xl overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-xl">
                        Terms of Service
                    </DialogTitle>
                    <DialogDescription>
                        Please read our Terms of Service carefully
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <h3 className="text-lg font-semibold">
                        1. Acceptance of Terms
                    </h3>
                    <p>
                        By accessing or using the Mentor Platform service, you
                        acknowledge that you have read, understood, and agree to
                        be bound by these Terms of Service. If you do not agree
                        to these terms, please do not use the service.
                    </p>

                    <h3 className="text-lg font-semibold">
                        2. Description of Service
                    </h3>
                    <p>
                        Mentor Platform provides a platform connecting mentors
                        and learners for professional development purposes. The
                        service facilitates communication, scheduling, and
                        resource sharing between users.
                    </p>

                    <h3 className="text-lg font-semibold">3. User Accounts</h3>
                    <p>
                        To use certain features of the service, you must
                        register for an account. You agree to provide accurate,
                        current, and complete information during registration
                        and to update such information to keep it accurate,
                        current, and complete.
                    </p>

                    <h3 className="text-lg font-semibold">4. User Conduct</h3>
                    <p>
                        You agree to use the service in compliance with all
                        applicable laws and regulations. You are responsible for
                        all activity that occurs under your account. You agree
                        not to:
                    </p>
                    <ul className="list-disc space-y-2 pl-6">
                        <li>Violate any applicable laws or regulations</li>
                        <li>Impersonate any person or entity</li>
                        <li>Engage in any harassment or bullying</li>
                        <li>Distribute spam or malicious content</li>
                        <li>
                            Attempt to gain unauthorized access to the service
                        </li>
                    </ul>

                    <h3 className="text-lg font-semibold">
                        5. Intellectual Property
                    </h3>
                    <p>
                        The service and its contents are protected by copyright,
                        trademark, and other laws. Our trademarks and trade
                        dress may not be used in connection with any product or
                        service without prior written consent.
                    </p>

                    <h3 className="text-lg font-semibold">6. Termination</h3>
                    <p>
                        We reserve the right to terminate or suspend your
                        account at our sole discretion, without notice, for
                        conduct that we believe violates these terms or is
                        harmful to other users, us, or third parties, or for any
                        other reason.
                    </p>

                    <h3 className="text-lg font-semibold">
                        7. Disclaimer of Warranties
                    </h3>
                    <p>
                        The service is provided "as is" without warranties of
                        any kind, either express or implied. We do not guarantee
                        that the service will be uninterrupted, secure, or
                        error-free.
                    </p>

                    <h3 className="text-lg font-semibold">
                        8. Limitation of Liability
                    </h3>
                    <p>
                        To the maximum extent permitted by law, we shall not be
                        liable for any indirect, incidental, special,
                        consequential, or punitive damages resulting from your
                        use or inability to use the service.
                    </p>

                    <h3 className="text-lg font-semibold">
                        9. Changes to Terms
                    </h3>
                    <p>
                        We reserve the right to modify these terms at any time.
                        Continued use of the service after any such changes
                        constitutes your consent to such changes.
                    </p>

                    <h3 className="text-lg font-semibold">10. Governing Law</h3>
                    <p>
                        These terms shall be governed by and construed in
                        accordance with the laws of the jurisdiction in which
                        our company is registered, without regard to its
                        conflict of law provisions.
                    </p>
                </div>
                <DialogFooter>
                    <Button onClick={() => onOpenChange(false)}>
                        I Understand
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
