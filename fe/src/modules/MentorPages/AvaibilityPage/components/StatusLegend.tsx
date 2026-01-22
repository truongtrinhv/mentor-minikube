export const StatusLegend = () => {
    const statusItems = [
        {
            color: "bg-green-500",
            label: "Available",
        },
        {
            color: "bg-orange-500",
            label: "Unavailable",
        },
    ];

    return (
        <div className="mt-6 flex flex-wrap justify-center gap-6 text-sm">
            {statusItems.map((item) => (
                <div key={item.label} className="flex items-center space-x-2">
                    <div
                        className={`h-4 w-4 rounded-full ${item.color} border border-gray-300`}
                    ></div>
                    <div className="flex flex-col">
                        <span className="font-semibold text-gray-800 dark:text-gray-200">
                            {item.label}
                        </span>
                    </div>
                </div>
            ))}
        </div>
    );
};
