import { useState, useEffect } from "react";
import Dashboard from "../../components/Dashboard/Dashboard";

import styles from "./RecommendedPage.module.css";

const RecommendedPage = () => {
  //   const [books, setBooks] = useState([]);
  //   const [currentPage, setCurrentPage] = useState(1);
  //   const [totalPages, setTotalPages] = useState(1);
  //   const [isLoading, setIsLoading] = useState(false);
  //   const [selectedBook, setSelectedBook] = useState(null);
  //   const [isModalOpen, setIsModalOpen] = useState(false);
  const [filters, setFilters] = useState({ title: "", author: "" });

  //   const booksPerPage = 10;

  //   useEffect(() => {
  //     loadBooks(currentPage, filters);
  //   }, [currentPage, filters]);

  //   const loadBooks = async (page, filters) => {
  //     setIsLoading(true);
  //     try {
  //       const response = await fetchRecommendedBooks(page, booksPerPage, filters);
  //       setBooks(response.books);
  //       setTotalPages(response.totalPages);
  //     } catch (error) {
  //       console.error("Error loading recommended books:", error);
  //     } finally {
  //       setIsLoading(false);
  //     }
  //   };

  //   const handlePageChange = (newPage) => {
  //     setCurrentPage(newPage);
  //   };

  const handleFilterSubmit = (newFilters) => {
    // setFilters(newFilters);
    // setCurrentPage(1); // Reset to first page when applying filters
  };

  //   const handleBookClick = (book) => {
  //     setSelectedBook(book);
  //     setIsModalOpen(true);
  //   };

  //   const handleCloseModal = () => {
  //     setIsModalOpen(false);
  //   };

  //   const handleAddToLibrary = async (bookId) => {
  //     // Implementation for adding the book to the user's library
  //     console.log("Adding book to library:", bookId);
  //     // Add actual API call here

  //     // Close the modal after adding
  //     setIsModalOpen(false);
  //   };

  return (
    <div className={styles.recommendedPage}>
      <Dashboard
        page="recommended"
        onFilterSubmit={handleFilterSubmit}
        filters={filters}
      />
      {/* <RecommendedBooks
        books={books}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        onBookClick={handleBookClick}
        isLoading={isLoading}
      />
      {isModalOpen && selectedBook && (
        <BookDetailsModal
          book={selectedBook}
          onClose={handleCloseModal}
          onAddToLibrary={() => handleAddToLibrary(selectedBook.id)}
        />
      )} */}
    </div>
  );
};

export default RecommendedPage;
