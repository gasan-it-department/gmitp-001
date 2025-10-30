export const adminNavMain = [
    {
        title: "Action Center",
        items: [
            { title: "Dashboard", url: "/admin/dashboard" },
            { title: "Requests", url: "/action-center/admin/request-list" },
            // { title: "Activity Logs", url: "/admin/logs" },
            // { title: "Transfers", url: "/admin/transfers", isActive: true },
        ],
    },

    {
        title: "Tourism",
        url: "#",
        items: [
            { title: "Routing", url: "/admin/travels/routing" },
        ],
    },

    {
        title: "Bulletin",
        url: "#",
        items: [
            { title: "Announcement", url: "/bulletin-board/announcement/admin" },
            { title: "Events", url: "/events-form" },
        ],
    },
];
