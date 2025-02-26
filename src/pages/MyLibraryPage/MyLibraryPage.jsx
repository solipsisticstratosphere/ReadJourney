import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserLibraryAsync } from "../../redux/books/operations";
import {
  selectLibraryBooks,
  selectLibraryLoading,
} from "../../redux/books/selectors";
import Dashboard from "../../components/Dashboard/Dashboard";

import BookDetailsModal from "../../components/BookDetailsModal/BookDetailsModal";
import styles from "./MyLibraryPage.module.css";

const MyLibraryPage = () => {
  const dispatch = useDispatch();
  const books = useSelector(selectLibraryBooks);
  const isLoading = useSelector(selectLibraryLoading);
  const [selectedBook, setSelectedBook] = useState(null);
  const [readingFilter, setReadingFilter] = useState("all");

  useEffect(() => {
    dispatch(fetchUserLibraryAsync());
  }, [dispatch]);

  const handleBookClick = (book) => {
    setSelectedBook(book);
  };

  const handleCloseModal = () => {
    setSelectedBook(null);
  };

  const handleStartReading = (bookId) => {
    // Navigate to reading page or dispatch start reading action
    console.log("Start reading book:", bookId);
    handleCloseModal();
  };

  const handleFilterChange = (filterValue) => {
    setReadingFilter(filterValue);
  };

  const filteredBooks =
    readingFilter === "all"
      ? books
      : books.filter((book) => book.status === readingFilter);

  return (
    <div className={styles.container}>
      <Dashboard page="library" />
      {/* <MyLibraryBooks
        books={filteredBooks}
        isLoading={isLoading}
        onBookClick={handleBookClick}
        onFilterChange={handleFilterChange}
        currentFilter={readingFilter}
      /> */}

      {selectedBook && (
        <BookDetailsModal
          book={selectedBook}
          onClose={handleCloseModal}
          onStartReading={handleStartReading}
        />
      )}
    </div>
  );
};

export default MyLibraryPage;
