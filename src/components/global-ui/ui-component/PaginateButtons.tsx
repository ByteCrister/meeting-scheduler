import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";

type propTypes = {
    handlePaginatePage: (newPage: number) => void;
    currentPage: number;
    maxItems: number;
    totalItems: number;
};

const PaginateButtons = ({
    handlePaginatePage,
    currentPage,
    maxItems,
    totalItems,
}: propTypes) => {
    const totalPages = Math.ceil(totalItems / maxItems);
    const isFirstPage = currentPage === 1;
    const isLastPage = currentPage === totalPages;

    const getPageNumbers = () => {
        if (totalPages <= 3) return Array.from({ length: totalPages }, (_, i) => i + 1);
        if (currentPage <= 2) return [1, 2, 3, "..."];
        if (currentPage >= totalPages - 1) return ["...", totalPages - 2, totalPages - 1, totalPages];
        return ["...", currentPage - 1, currentPage, currentPage + 1, "..."];
    };

    return (
        <Pagination>
            <PaginationContent className="mt-6 space-x-2">
                {/* Previous Button */}
                <PaginationItem>
                    <PaginationPrevious
                        onClick={(e) => {
                            e.preventDefault();
                            if (!isFirstPage) handlePaginatePage(currentPage - 1);
                        }}
                        className={`transition-colors duration-200 ${isFirstPage
                                ? "opacity-50 cursor-not-allowed"
                                : "hover:bg-blue-100 text-blue-300 cursor-pointer"
                            }`}
                    />
                </PaginationItem>

                {/* Page Numbers */}
                {getPageNumbers().map((page, index) => (
                    <PaginationItem key={index}>
                        {page === "..." ? (
                            <PaginationEllipsis />
                        ) : (
                            <PaginationLink
                                isActive={currentPage === page}
                                className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors cursor-pointer duration-200 ${currentPage === page
                                        ? "bg-blue-300 text-white shadow"
                                        : "bg-gray-100 text-gray-700 hover:bg-blue-100 hover:text-blue-700"
                                    }`}
                                onClick={(e) => {
                                    e.preventDefault();
                                    handlePaginatePage(Number(page));
                                }}
                            >
                                {page}
                            </PaginationLink>
                        )}
                    </PaginationItem>
                ))}

                {/* Next Button */}
                <PaginationItem>
                    <PaginationNext
                        onClick={(e) => {
                            e.preventDefault();
                            if (!isLastPage) handlePaginatePage(currentPage + 1);
                        }}
                        className={`transition-colors duration-200 cursor-pointer ${isLastPage
                                ? "opacity-50 cursor-not-allowed"
                                : "hover:bg-blue-100 text-blue-400"
                            }`}
                    />
                </PaginationItem>
            </PaginationContent>
        </Pagination>
    );
};

export default PaginateButtons;
