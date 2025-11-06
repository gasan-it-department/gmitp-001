"use client";

import { Button } from "@/components/ui/button";
import { router } from "@inertiajs/react";
import { Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function RestrictedAccessPage() {

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-rose-50 via-orange-50 to-amber-100 text-center px-6">
            {/* Lock Icon */}
            <div className="bg-white p-6 rounded-full shadow-md mb-6">
                <Lock className="w-12 h-12 text-orange-500" />
            </div>

            {/* Heading */}
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Restricted Access
            </h1>

            {/* Description */}
            <p className="text-gray-600 max-w-md mb-8">
                You do not have permission to view this page. Please contact your administrator if you believe this is a mistake.
            </p>

            {/* Back Button */}
            <Button
                onClick={() => {
                    router.visit(route("home.show"));
                }}
                className="bg-gradient-to-r from-orange-500 to-red-500 text-white font-medium shadow-md hover:shadow-lg hover:from-orange-600 hover:to-red-600 transition-all duration-200 rounded-md px-6 py-2"
            >
                Return Home
            </Button>
        </div>
    );
}
