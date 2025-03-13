import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { toast } from "react-toastify";

import {
  addBookToLibraryAsync,
  loadLimitedRecommendedBooks,
  startReadingSessionAsync,
  stopReadingSessionAsync,
  loadCurrentBookAsync,
  deleteReadingSession,
  loadBookForReadingAsync,
} from "../../redux/books/operations";

import {
  selectLimitedRecommendedBooks,
  selectLimitedRecommendedBooksLoading,
  selectCurrentBook,
  selectIsReadingActive,
} from "../../redux/books/selectors";

import RecommendedBooks from "../RecommendedBooks/RecommendedBooks";
import SuccessModal from "../ModalSuccess/ModalSuccess";
import BookCompletedModal from "../BookCompletedModal/BookCompletedModal";

import { addBookSchema, readingPageSchema } from "../../utils/validations";

import smallBooks from "../../assets/images/smallBooks.png";
import star from "../../assets/images/star.png";

import styles from "./Dashboard.module.css";

import RecommendedPageContent from "./RecommendedPageContent";
import LibraryPageContent from "./LibraryPageContent";
import ReadingPageContent from "./ReadingPageContent";

const Dashboard = ({
  page,
  onFilterSubmit,
  filters,
  bookId,
  externalFormControl,
}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // ==================== STATE ====================
  const [activeView, setActiveView] = useState("statistics");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showBookCompletedModal, setShowBookCompletedModal] = useState(false);
  const [addedBook, setAddedBook] = useState(null);

  // ==================== SELECTORS ====================

  const limitedRecommendedBooks = useSelector(selectLimitedRecommendedBooks);
  const isLoadingLimitedRecommended = useSelector(
    selectLimitedRecommendedBooksLoading
  );

  const currentBook = useSelector(selectCurrentBook);
  const isReadingActive = useSelector(selectIsReadingActive);

  // ==================== COMPUTED VALUES ====================

  const hasProgress = page === "reading" && currentBook?.progress?.length > 0;

  const totalPagesRead = currentBook?.progress
    ? currentBook.progress.reduce((total, session) => {
        // Проверить, что startPage и finishPage действительные числа
        const startPage = isNaN(session.startPage) ? 0 : session.startPage;
        const finishPage = isNaN(session.finishPage) ? 0 : session.finishPage;
        return total + (finishPage - startPage + 1);
      }, 0)
    : 0;

  const totalPages = currentBook?.totalPages || 0;

  const calculatePercentage = () => {
    if (isReadingActive && totalPagesRead === 0) {
      return 100;
    }

    if (totalPages > 0) {
      const percentage = Math.min((totalPagesRead / totalPages) * 100, 100);
      return isNaN(percentage) ? 0 : Number(percentage.toFixed(2));
    }

    return 0;
  };

  const percentageRead = calculatePercentage();

  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = isNaN(percentageRead)
    ? circumference
    : circumference - (percentageRead / 100) * circumference;

  // ==================== FORM SETUP ====================

  const getFormSchema = () => {
    switch (page) {
      case "library":
        return addBookSchema;
      case "reading":
        return readingPageSchema;
      default:
        return null;
    }
  };

  const validateCurrentPage = (value) => {
    const lastFinishPage =
      currentBook?.progress?.length > 0
        ? currentBook.progress[currentBook.progress.length - 1].finishPage
        : 0;
    const pageNum = parseInt(value);
    return (
      pageNum > lastFinishPage || "Page must be greater than last finished page"
    );
  };

  const schema = getFormSchema();
  const resolver = schema ? yupResolver(schema) : undefined;

  const {
    register,
    handleSubmit: processSubmit,
    formState: { errors, dirtyFields, isSubmitted, isValid },
    reset,
    watch,
    setValue,
  } = useForm({
    resolver,
    mode: "onChange",
    defaultValues:
      page === "recommended"
        ? {
            title: filters?.title || "",
            author: filters?.author || "",
          }
        : page === "reading"
        ? {
            currentPage: isReadingActive
              ? ""
              : externalFormControl?.initialPage ||
                (currentBook?.progress?.length > 0
                  ? currentBook.progress[currentBook.progress.length - 1]
                      .finishPage + 1
                  : 1),
          }
        : {
            title: "",
            author: "",
            pages: "",
          },
  });

  // ==================== EFFECTS ====================

  useEffect(() => {
    if (page === "library") {
      dispatch(loadLimitedRecommendedBooks());
    }
    if (page === "reading" && bookId) {
      dispatch(loadCurrentBookAsync(bookId));
    }
  }, [dispatch, page, bookId]);

  useEffect(() => {
    if (page === "reading" && currentBook) {
      // If reading is active, leave the field empty
      if (isReadingActive) {
        setValue("currentPage", "");
        return;
      }

      const newValue =
        externalFormControl?.initialPage ||
        (currentBook.progress?.length > 0
          ? currentBook.progress[currentBook.progress.length - 1].finishPage + 1
          : 1);

      setValue("currentPage", isNaN(newValue) ? 1 : newValue);
    }
  }, [
    currentBook,
    setValue,
    page,
    externalFormControl?.initialPage,
    isReadingActive,
  ]);

  useEffect(() => {
    if (page === "reading" && currentBook?.progress?.length > 0) {
      const lastFinishPage =
        currentBook.progress[currentBook.progress.length - 1].finishPage;
      const currentPageValue = watch("currentPage");

      if (parseInt(currentPageValue) <= lastFinishPage) {
        setValue("currentPage", lastFinishPage + 1, {
          shouldValidate: true,
          shouldDirty: true,
        });
      }
    }
  }, [page, currentBook, watch, setValue]);

  // ==================== HELPERS ====================

  const processProgressData = () => {
    if (!currentBook || !currentBook.progress) return [];

    const processedEntries = currentBook.progress
      .filter((entry) => entry.finishReading)
      .map((entry) => {
        const readingTime = Math.round(
          (new Date(entry.finishReading) - new Date(entry.startReading)) / 60000
        );
        const pageCount = entry.finishPage - entry.startPage + 1;
        const readingDate = new Date(entry.finishReading)
          .toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          })
          .replace(/\//g, ".");

        return {
          ...entry,
          date: readingDate,
          pages: pageCount,
          percentage: Number(
            ((pageCount / currentBook.totalPages) * 100).toFixed(2)
          ),
          time: readingTime,
          pagesPerHour: Math.round(pageCount / (readingTime / 60) || 0),
        };
      })
      .sort((a, b) => sortByDate(a.date, b.date));

    const processedEntriesWithTotals = processedEntries.reduce((acc, entry) => {
      const existingDateEntry = acc.find((e) => e.date === entry.date);

      if (existingDateEntry) {
        existingDateEntry.totalDatePages += entry.pages;
        existingDateEntry.entries.push(entry);
      } else {
        acc.push({
          ...entry,
          totalDatePages: entry.pages,
          entries: [entry],
        });
      }

      return acc;
    }, []);

    return processedEntriesWithTotals.sort((a, b) =>
      sortByDate(a.date, b.date)
    );
  };

  const sortByDate = (date1, date2) => {
    const [day1, month1, year1] = date1.split(".");
    const [day2, month2, year2] = date2.split(".");
    return (
      new Date(`${year2}-${month2}-${day2}`) -
      new Date(`${year1}-${month1}-${day1}`)
    );
  };

  const processedProgressData = processProgressData();
  const processedEntriesWithDateFlag = processedProgressData.map((entry) => ({
    ...entry,
    shouldShowDate: true,
  }));

  const getInputContainerClass = (fieldName) => {
    if (dirtyFields[fieldName] || isSubmitted) {
      if (errors[fieldName]) {
        return styles.inputContainerError;
      } else {
        return styles.inputContainerSuccess;
      }
    }
    return styles.inputContainer;
  };

  const getStatusMessage = (fieldName) => {
    if ((dirtyFields[fieldName] || isSubmitted) && errors[fieldName]) {
      return <span className={styles.error}>{errors[fieldName].message}</span>;
    }
    return null;
  };

  // ==================== EVENT HANDLERS ====================

  const toggleView = (view) => {
    setActiveView(view);
  };

  const handleDeleteSession = (readingId) => {
    if (currentBook && currentBook._id) {
      const updatedProgress = currentBook.progress.filter(
        (session) => session._id !== readingId
      );

      dispatch(
        deleteReadingSession({
          bookId: currentBook._id,
          readingId: readingId,
        })
      );

      dispatch(
        loadBookForReadingAsync.fulfilled({
          ...currentBook,
          progress: updatedProgress,
        })
      );
    }
  };

  const handleBookClick = (book) => {
    console.log("Book clicked:", book);
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
  };

  const onSubmit = async (data) => {
    if (page === "recommended") {
      onFilterSubmit(data);
      return;
    }

    if (page === "reading") {
      return handleReadingSubmit(data);
    }

    if (page === "library") {
      return handleLibrarySubmit(data);
    }
  };

  const handleReadingSubmit = async (data) => {
    const currentPageValue = parseInt(data.currentPage);
    const lastFinishPage =
      currentBook?.progress?.length > 0
        ? currentBook.progress[currentBook.progress.length - 1].finishPage
        : 0;

    if (currentPageValue <= lastFinishPage) {
      toast.error(`Page must be greater than ${lastFinishPage}`);
      return;
    }

    if (externalFormControl?.onSubmit) {
      try {
        await externalFormControl.onSubmit(data);
        toast.success(
          externalFormControl.isReadingActive
            ? "Reading session stopped successfully"
            : "Reading session started successfully"
        );

        if (
          externalFormControl.isReadingActive &&
          parseInt(data.currentPage) >=
            (externalFormControl.totalPages || currentBook?.totalPages)
        ) {
          setShowBookCompletedModal(true);
        }
      } catch (error) {
        toast.error(error || "Failed to update reading session");
      }
      return;
    }

    try {
      if (isReadingActive) {
        await dispatch(
          stopReadingSessionAsync({
            bookId,
            currentPage: parseInt(data.currentPage),
          })
        ).unwrap();

        toast.success("Reading session stopped successfully");
        if (parseInt(data.currentPage) >= currentBook.totalPages) {
          setShowBookCompletedModal(true);
        }
      } else {
        await dispatch(
          startReadingSessionAsync({
            bookId,
            startPage: parseInt(data.currentPage),
          })
        ).unwrap();

        toast.success("Reading session started successfully");
      }
    } catch (error) {
      toast.error(error || "Failed to update reading session");
    }
  };

  const handleLibrarySubmit = async (data) => {
    try {
      const bookData = {
        title: data.title,
        author: data.author,
        totalPages: parseInt(data.pages),
      };

      const result = await dispatch(addBookToLibraryAsync(bookData)).unwrap();

      setAddedBook(result);
      setShowSuccessModal(true);

      reset();
    } catch (error) {
      toast.error(error || "Failed to add book to library");
    }
  };

  const onError = (errors) => {
    const errorMessages = Object.values(errors)
      .map((err) => err.message)
      .join(", ");
    toast.error(errorMessages);
  };

  // ==================== RENDER HELPERS ====================

  const renderPageContent = () => {
    switch (page) {
      case "recommended":
        return (
          <RecommendedPageContent
            getInputContainerClass={getInputContainerClass}
            getStatusMessage={getStatusMessage}
            register={register}
            dirtyFields={dirtyFields}
            isSubmitted={isSubmitted}
            errors={errors}
            processSubmit={processSubmit}
            onSubmit={onSubmit}
            smallBooks={smallBooks}
          />
        );
      case "library":
        return (
          <LibraryPageContent
            getInputContainerClass={getInputContainerClass}
            getStatusMessage={getStatusMessage}
            register={register}
            dirtyFields={dirtyFields}
            isSubmitted={isSubmitted}
            errors={errors}
            processSubmit={processSubmit}
            onSubmit={onSubmit}
            onError={onError}
            limitedRecommendedBooks={limitedRecommendedBooks}
            isLoadingLimitedRecommended={isLoadingLimitedRecommended}
            handleBookClick={handleBookClick}
          />
        );
      case "reading":
        return (
          <ReadingPageContent
            currentBook={currentBook}
            isReadingActive={isReadingActive}
            getInputContainerClass={getInputContainerClass}
            register={register}
            dirtyFields={dirtyFields}
            isSubmitted={isSubmitted}
            errors={errors}
            processSubmit={processSubmit}
            onSubmit={onSubmit}
            onError={onError}
            isValid={isValid}
            hasProgress={hasProgress}
            activeView={activeView}
            toggleView={toggleView}
            totalPagesRead={totalPagesRead}
            percentageRead={percentageRead}
            radius={radius}
            circumference={circumference}
            strokeDashoffset={strokeDashoffset}
            processedEntriesWithDateFlag={processedEntriesWithDateFlag}
            handleDeleteSession={handleDeleteSession}
            star={star}
            externalFormControl={externalFormControl}
            validateCurrentPage={validateCurrentPage}
          />
        );
      default:
        return null;
    }
  };

  // ==================== RENDER ====================
  return (
    <div className={styles.dashboard}>
      {renderPageContent()}

      {showSuccessModal && page === "library" && (
        <SuccessModal
          showSuccessModal={showSuccessModal}
          handleCloseSuccessModal={handleCloseSuccessModal}
        />
      )}

      {showBookCompletedModal && currentBook && (
        <BookCompletedModal
          isOpen={showBookCompletedModal}
          onClose={() => setShowBookCompletedModal(false)}
          bookTitle={currentBook.title}
        />
      )}
    </div>
  );
};

export default Dashboard;
