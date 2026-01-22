import { Link } from "react-router-dom";

import { Button } from "@/common/components/ui/button";

export default function HomePage() {
    return (
        <div className="bg-background text-foreground flex min-h-screen flex-col items-center justify-center">
            <div className="container mx-auto flex flex-col items-center px-4 py-8">
                <h1 className="mb-6 text-4xl font-bold">Mentor Platform</h1>
                <p className="mb-8 max-w-2xl text-center text-xl">
                    Connect with mentors in your field and accelerate your
                    professional growth
                </p>

                <div className="mt-6 flex gap-4">
                    <Button asChild size="lg">
                        <Link to="/login">Sign In</Link>
                    </Button>

                    <Button asChild variant="outline" size="lg">
                        <Link to="/register">Register Now</Link>
                    </Button>
                </div>

                <div className="mt-16 grid max-w-4xl grid-cols-1 gap-8 md:grid-cols-3">
                    <div className="bg-card rounded-lg p-6 shadow-sm">
                        <h3 className="mb-2 text-xl font-semibold">
                            Find Mentors
                        </h3>
                        <p>
                            Connect with experienced professionals who can guide
                            your career journey
                        </p>
                    </div>

                    <div className="bg-card rounded-lg p-6 shadow-sm">
                        <h3 className="mb-2 text-xl font-semibold">
                            Structured Learning
                        </h3>
                        <p>
                            Engage in personalized sessions tailored to your
                            specific goals and needs
                        </p>
                    </div>

                    <div className="bg-card rounded-lg p-6 shadow-sm">
                        <h3 className="mb-2 text-xl font-semibold">
                            Share Knowledge
                        </h3>
                        <p>
                            Become a mentor and give back to the community by
                            sharing your expertise
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
