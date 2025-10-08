export const adminNavMain = [
    {
        title: "Action Center",
        url: "#",
        items: [
            { title: "Dashboard", url: "/admin/dashboard" },
            { title: "Requests", url: "/action-center/admin/request-list" },
            { title: "Activity Logs", url: "/admin/logs" },
            { title: "Transfers", url: "/admin/transfers", isActive: true },
        ],
    },
    {
        title: "Travels",
        url: "#",
        items: [
            { title: "Routing", url: "/admin/travels/routing" },
        ],
    },
];
