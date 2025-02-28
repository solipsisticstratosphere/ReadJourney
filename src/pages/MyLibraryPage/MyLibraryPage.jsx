import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserLibraryAsync } from "../../redux/books/operations";
import {
  selectUserLibrary,
  selectUserLibraryLoading,
  selectUserLibraryError,
} from "../../redux/books/selectors";
import Dashboard from "../../components/Dashboard/Dashboard";

import BookDetailsModal from "../../components/BookDetailsModal/BookDetailsModal";
import styles from "./MyLibraryPage.module.css";
import MyLibraryBooks from "../../components/MyLibraryBooks/MyLibraryBooks";
import { useNavigate } from "react-router-dom";

const MyLibraryPage = () => {
  const dispatch = useDispatch();
  const books = useSelector(selectUserLibrary);
  const isLoading = useSelector(selectUserLibraryLoading);
  const error = useSelector(selectUserLibraryError);
  const [selectedBook, setSelectedBook] = useState(null);
  const [readingFilter, setReadingFilter] = useState("all");
  const navigate = useNavigate();

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
    navigate(`/reading/${bookId}`);
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
      <MyLibraryBooks
        books={filteredBooks}
        isLoading={isLoading}
        error={error}
        onBookClick={handleBookClick}
        onFilterChange={handleFilterChange}
        currentFilter={readingFilter}
      />

      {selectedBook && (
        <BookDetailsModal
          book={selectedBook}
          onClose={handleCloseModal}
          onStartReading={() =>
            handleStartReading(selectedBook._id || selectedBook.id)
          }
        />
      )}
    </div>
  );
};

export default MyLibraryPage;
