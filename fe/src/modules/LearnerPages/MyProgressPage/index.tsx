import React from "react";

const MyProgressPage: React.FC = () => {
    return (
        <div className="container mx-auto p-6">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    My Progress
                </h1>
                <p className="mt-2 text-gray-600 dark:text-gray-300">
                    Track your learning journey and achievements
                </p>
            </div>

            <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                <div className="rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
                    <div className="text-center">
                        <div className="mb-2 text-4xl">📚</div>
                        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                            Courses Completed
                        </h3>
                        <p className="mt-2 text-2xl font-bold text-blue-600 dark:text-blue-400">
                            0
                        </p>
                    </div>
                </div>

                <div className="rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
                    <div className="text-center">
                        <div className="mb-2 text-4xl">⏱️</div>
                        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                            Hours Learned
                        </h3>
                        <p className="mt-2 text-2xl font-bold text-green-600 dark:text-green-400">
                            0
                        </p>
                    </div>
                </div>

                <div className="rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
                    <div className="text-center">
                        <div className="mb-2 text-4xl">🎯</div>
                        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                            Goals Achieved
                        </h3>
                        <p className="mt-2 text-2xl font-bold text-purple-600 dark:text-purple-400">
                            0
                        </p>
                    </div>
                </div>
            </div>

            <div className="rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
                <div className="py-12 text-center">
                    <div className="mb-4 text-6xl">📈</div>
                    <h2 className="mb-2 text-xl font-semibold text-gray-700 dark:text-gray-300">
                        Your Learning Progress
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400">
                        Start your learning journey to see your progress here.
                        Detailed analytics and progress tracking coming soon.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default MyProgressPage;
