import { Button } from "@/common/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/common/components/ui/dialog";

type PrivacyDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

export function PrivacyDialog({ open, onOpenChange }: PrivacyDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[80vh] max-w-2xl overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-xl">
                        Privacy Policy
                    </DialogTitle>
                    <DialogDescription>
                        Learn how we collect, use, and protect your personal
                        information
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <h3 className="text-lg font-semibold">
                        1. Information We Collect
                    </h3>
                    <p>
                        We collect information you provide directly to us when
                        creating an account or updating your profile, including:
                    </p>
                    <ul className="list-disc space-y-2 pl-6">
                        <li>Contact information (name, email address)</li>
                        <li>Profile information (photo, biography, skills)</li>
                        <li>Communication preferences</li>
                        <li>
                            Session data and content you share on the platform
                        </li>
                    </ul>

                    <h3 className="text-lg font-semibold">
                        2. How We Use Your Information
                    </h3>
                    <p>We use the information we collect to:</p>
                    <ul className="list-disc space-y-2 pl-6">
                        <li>Provide, maintain, and improve our services</li>
                        <li>
                            Process transactions and send related information
                        </li>
                        <li>Match mentors and mentees based on preferences</li>
                        <li>
                            Send technical notices, updates, and support
                            messages
                        </li>
                        <li>
                            Respond to your comments, questions, and requests
                        </li>
                        <li>Provide personalized content and experiences</li>
                        <li>
                            Monitor and analyze trends, usage, and activities
                        </li>
                        <li>
                            Detect, investigate, and prevent fraudulent or
                            unauthorized transactions
                        </li>
                    </ul>

                    <h3 className="text-lg font-semibold">
                        3. Sharing of Information
                    </h3>
                    <p>We may share personal information as follows:</p>
                    <ul className="list-disc space-y-2 pl-6">
                        <li>
                            With other users as part of the mentorship matching
                            process (based on your privacy settings)
                        </li>
                        <li>
                            With vendors, consultants, and service providers who
                            need access to such information to carry out work on
                            our behalf
                        </li>
                        <li>
                            In response to a request for information if required
                            by law
                        </li>
                        <li>
                            If we believe disclosure is necessary to protect the
                            rights, property, or safety of our users
                        </li>
                        <li>
                            In connection with, or during negotiations of, any
                            merger, sale of company assets, financing, or
                            acquisition
                        </li>
                    </ul>

                    <h3 className="text-lg font-semibold">4. Data Security</h3>
                    <p>
                        We take reasonable measures to help protect information
                        about you from loss, theft, misuse, unauthorized access,
                        disclosure, alteration, and destruction. However, no
                        internet or email transmission is ever fully secure or
                        error-free.
                    </p>

                    <h3 className="text-lg font-semibold">5. Your Choices</h3>
                    <p>
                        You can access and update certain information through
                        your account settings. You can also request deletion of
                        your account by contacting us. Note that we may retain
                        certain information as required by law or for legitimate
                        business purposes.
                    </p>

                    <h3 className="text-lg font-semibold">6. Cookies</h3>
                    <p>
                        We use cookies and similar technologies to collect
                        information about your browsing activities and to
                        distinguish you from other users. You can instruct your
                        browser to refuse all cookies or to indicate when a
                        cookie is being sent.
                    </p>

                    <h3 className="text-lg font-semibold">
                        7. Children's Privacy
                    </h3>
                    <p>
                        Our service is not directed to children under 16, and we
                        do not knowingly collect personal information from
                        children under 16. If we learn we have collected
                        personal information from a child under 16, we will
                        delete this information.
                    </p>

                    <h3 className="text-lg font-semibold">
                        8. Changes to Privacy Policy
                    </h3>
                    <p>
                        We may change this privacy policy from time to time. If
                        we make changes, we will notify you by revising the date
                        at the top of the policy and, in some cases, we may
                        provide you with additional notice.
                    </p>

                    <h3 className="text-lg font-semibold">9. Contact Us</h3>
                    <p>
                        If you have any questions about this privacy policy,
                        please contact us at privacy@mentorplatform.com.
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
