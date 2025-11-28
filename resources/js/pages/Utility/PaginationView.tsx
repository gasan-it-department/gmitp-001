import React from "react";
import { Button } from "@/components/ui/button";

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    onPageChange: (page: number) => void;
    maxVisible?: number;
}

const PaginationView: React.FC<PaginationProps> = ({
    currentPage,
    totalPages,
    onPageChange,
    maxVisible = 9,
}) => {
    console.log("Total page: ", totalPages);
    if (totalPages <= 1) return null;

    let pages: (number | string)[] = [];

    if (totalPages <= maxVisible) {
        pages = Array.from({ length: totalPages }, (_, i) => i + 1);
    } else if (currentPage <= 4) {
        pages = ([1, 2, 3, 4, 5] as (number | string)[]).concat(["...", totalPages]);
    } else if (currentPage >= totalPages - 3) {
        pages = ([1, "..."] as (number | string)[]).concat(
            Array.from({ length: 5 }, (_, i) => totalPages - 4 + i)
        );
    } else {
        pages = [1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages];
    }

    return (
        <div className="flex flex-wrap justify-center items-center gap-2 mt-5">
            <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => onPageChange(currentPage - 1)}
                className="border-gray-300 text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300"
            >
                Prev
            </Button>

            {pages.map((page, index) =>
                typeof page === "number" ? (
                    <Button
                        key={index}
                        size="sm"
                        onClick={() => onPageChange(page)}
                        className={`${page === currentPage
                            ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md"
                            : "border-gray-300 text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300"
                            }`}
                        variant={page === currentPage ? "default" : "outline"}
                    >
                        {page}
                    </Button>
                ) : (
                    <span key={index} className="px-2 text-gray-500 select-none">
                        {page}
                    </span>
                )
            )}

            <Button
                variant="outline"
                size="sm"
                disabled={currentPage === totalPages}
                onClick={() => onPageChange(currentPage + 1)}
                className="border-gray-300 text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300"
            >
                Next
            </Button>
        </div>
    );
};

export default PaginationView;
