document.addEventListener('DOMContentLoaded', function() {
    // Existing elements
    const inputBook = document.getElementById('inputBook');
    const bookSubmit = document.getElementById('bookSubmit');
    const incompleteBookshelfList = document.getElementById('incompleteBookshelfList');
    const completeBookshelfList = document.getElementById('completeBookshelfList');
    const searchBook = document.getElementById('searchBook');
    const searchBookTitle = document.getElementById('searchBookTitle');

    //storage
    let books = [];
    const storageBook = localStorage.getItem('books');
    if (storageBook){
        books = JSON.parse(storageBook);
    }
    function saveBooksLocalStorage() {
        localStorage.setItem('books', JSON.stringify(books));
    }

    // Form validation
    function validateForm() {
        const inputBookTitle = document.getElementById('inputBookTitle').value;
        const inputBookAuthor = document.getElementById('inputBookAuthor').value;
        const inputBookYear = document.getElementById('inputBookYear').value;
        const inputBookCategory = document.getElementById('inputBookCategory').value;
        
        if (!inputBookTitle.trim()) {
            alert('Judul buku tidak boleh kosong!');
            return false;
        }
        
        if (!inputBookAuthor.trim()) {
            alert('Penulis buku tidak boleh kosong!');
            return false;
        }
        
        if (!inputBookYear) {
            alert('Tahun terbit tidak boleh kosong!');
            return false;
        }
        
        const year = Number(inputBookYear);
        if (isNaN(year) || year <= 0 || year > new Date().getFullYear()) {
            alert('Tahun terbit tidak valid!');
            return false;
        }
        
        return true;
    }

    // Add book form submission
    inputBook.addEventListener('submit', function(e){
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        const inputBookTitle = document.getElementById('inputBookTitle').value;
        const inputBookAuthor = document.getElementById('inputBookAuthor').value;
        const inputBookYear = Number(document.getElementById('inputBookYear').value);
        const inputBookCategory = document.getElementById('inputBookCategory').value;
        const inputBookRating = Number(document.getElementById('inputBookRating').value) || 0;
        const inputBookReview = document.getElementById('inputBookReview').value || '';
        const inputBookProgress = Number(document.getElementById('inputBookProgress').value) || 0;
        
        // Set isComplete based on progress
        let inputBookIsComplete = document.getElementById('inputBookIsComplete').checked;
        
        // If progress is 100%, automatically mark as complete regardless of checkbox
        if (inputBookProgress >= 100) {
            inputBookIsComplete = true;
        }

        // Check for duplicate
        const isDuplicate = books.some(book => book.title === inputBookTitle);
        if (isDuplicate){
            alert('Buku sudah ada!!!!');
        } else {
            // Create new book object
            books.push({
                id: new Date().getTime(),
                title: inputBookTitle,
                author: inputBookAuthor,
                year: inputBookYear,
                isComplete: inputBookIsComplete,
                category: inputBookCategory,
                rating: inputBookRating,
                review: inputBookReview,
                progress: inputBookProgress,
                createdAt: new Date().toISOString()
            });

            saveBooksLocalStorage();
            updateBookshelf();
            
            // Reset form
            inputBook.reset();
            document.getElementById('textSubmit').innerText = "Belum selesai dibaca";
        } 
    });

    // Update bookshelf display
    function updateBookshelf() {
        incompleteBookshelfList.innerHTML = '';
        completeBookshelfList.innerHTML = '';

        for (const book of books) {
            const bookItem = createBookItem(book);
            if (book.isComplete) {
                completeBookshelfList.appendChild(bookItem);
            } else {
                incompleteBookshelfList.appendChild(bookItem);
            }
        }
    }

    // Remove book
    function removeBook(id){
        if (confirm('Apakah Anda yakin ingin menghapus buku ini?')) {
            const index = books.findIndex(book => book.id === id);
            if (index !== -1){
                books.splice(index, 1);
                saveBooksLocalStorage();
                updateBookshelf();
            }
        }
    }

    // Toggle book completion status
    function toggleisComplete(id){
        const index = books.findIndex(book => book.id === id);
        if (index !== -1){
            books[index].isComplete = !books[index].isComplete;
            
            // If toggling to 'not complete', make sure progress is less than 100%
            if (!books[index].isComplete && books[index].progress >= 100) {
                books[index].progress = 99;
            }
            
            saveBooksLocalStorage();
            updateBookshelf();
        }
    }

    // Update book rating
    function updateRating(id, newRating) {
        const index = books.findIndex(book => book.id === id);
        if (index !== -1) {
            books[index].rating = newRating;
            saveBooksLocalStorage();
            updateBookshelf();
        }
    }

    // Update reading progress
    function updateProgress(id, newProgress) {
        const index = books.findIndex(book => book.id === id);
        if (index !== -1) {
            books[index].progress = newProgress;
            
            // Automatically mark as complete if progress reaches 100%
            if (newProgress >= 100) {
                books[index].isComplete = true;
                // Show a notification that the book has been marked as complete
                alert(`"${books[index].title}" telah ditandai sebagai selesai dibaca karena progress mencapai 100%`);
            }
            
            saveBooksLocalStorage();
            updateBookshelf();
        }
    }

    // Update book review
    function updateReview(id, newReview) {
        const index = books.findIndex(book => book.id === id);
        if (index !== -1) {
            books[index].review = newReview;
            saveBooksLocalStorage();
            updateBookshelf();
        }
    }

    // Search books
    searchBook.addEventListener('submit', function(e){
        e.preventDefault();
        const query = searchBookTitle.value.toLowerCase().trim();

        if (query === '') {
            updateBookshelf();
            return;
        }

        const searchResult = books.filter(book => {
            return(
                book.title.toLowerCase().includes(query) || 
                book.author.toLowerCase().includes(query) ||
                book.year.toString().includes(query) ||
                (book.category && book.category.toLowerCase().includes(query))
            );   
        });
        updateSearchResult(searchResult);
    });

    function updateSearchResult(result){
        incompleteBookshelfList.innerHTML = '';
        completeBookshelfList.innerHTML = '';

        if (result.length === 0) {
            const noResult = document.createElement('div');
            noResult.textContent = 'Tidak ada buku yang ditemukan';
            noResult.style.padding = '20px';
            noResult.style.textAlign = 'center';
            noResult.style.color = '#000';
            incompleteBookshelfList.appendChild(noResult);
            return;
        }

        for (const book of result){
            const bookItem = createBookItem(book);
            if(book.isComplete){
                completeBookshelfList.appendChild(bookItem);
            } else {
                incompleteBookshelfList.appendChild(bookItem);
            }
        }
    }

    // Create book item UI
    function createBookItem(book){
        const bookItem = document.createElement('article');
        bookItem.className = 'book_item';
        bookItem.style.margin = '10px';
        bookItem.style.padding = '15px';
        bookItem.style.border = 'none';
        bookItem.style.borderRadius = '8px';
        bookItem.style.backgroundColor = '#F8E8EE';
        bookItem.style.boxShadow = '0 2px 5px rgba(0,0,0,0.1)';
        bookItem.style.transition = 'transform 0.2s';
        bookItem.style.cursor = 'pointer';

        // Add hover effect
        bookItem.addEventListener('mouseover', function() {
            this.style.transform = 'translateY(-5px)';
            this.style.boxShadow = '0 5px 15px rgba(0,0,0,0.1)';
        });
        
        bookItem.addEventListener('mouseout', function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = '0 2px 5px rgba(0,0,0,0.1)';
        });

        const actionButton = document.createElement('div');
        actionButton.className = 'action';
        
        const title = document.createElement('h3');
        title.textContent = book.title;
        title.style.color = '#000000';
        title.style.marginBottom = '10px';
        title.style.fontSize = '18px';
        
        const author = document.createElement('p');
        author.textContent = `Penulis: ${book.author}`;
        author.style.color = '#000000';
        author.style.marginBottom = '10px';

        const year = document.createElement('p');
        year.textContent = `Tahun: ${book.year}`;
        year.style.color = '#000000';
        year.style.marginBottom = '10px';

        // Category display (if exists)
        if (book.category) {
            const category = document.createElement('p');
            category.textContent = `Kategori: ${book.category}`;
            category.style.color = '#000000';
            category.style.marginBottom = '10px';
            category.style.fontStyle = 'italic';
            bookItem.appendChild(category);
        }

        // Rating display and editor
        const ratingContainer = document.createElement('div');
        ratingContainer.style.marginBottom = '15px';
        
        const ratingLabel = document.createElement('p');
        ratingLabel.textContent = 'Rating: ';
        ratingLabel.style.display = 'inline';
        ratingLabel.style.marginRight = '5px';
        
        const ratingStars = document.createElement('div');
        ratingStars.style.display = 'inline-block';
        
        for (let i = 1; i <= 5; i++) {
            const star = document.createElement('span');
            star.textContent = i <= book.rating ? '★' : '☆';
            star.style.color = i <= book.rating ? '#FFD700' : '#000';
            star.style.cursor = 'pointer';
            star.style.fontSize = '18px';
            star.style.marginRight = '3px';
            
            star.addEventListener('click', function() {
                updateRating(book.id, i);
            });
            
            ratingStars.appendChild(star);
        }
        
        ratingContainer.appendChild(ratingLabel);
        ratingContainer.appendChild(ratingStars);

        // Reading progress
        const progressContainer = document.createElement('div');
        progressContainer.style.marginBottom = '15px';
        
        const progressLabel = document.createElement('p');
        progressLabel.textContent = 'Progress membaca: ';
        progressLabel.style.marginBottom = '5px';
        
        const progressBar = document.createElement('div');
        progressBar.style.width = '100%';
        progressBar.style.backgroundColor = '#ddd';
        progressBar.style.borderRadius = '5px';
        progressBar.style.overflow = 'hidden';
        
        const progressValue = document.createElement('div');
        progressValue.style.width = `${book.progress}%`;
        progressValue.style.backgroundColor = book.progress >= 100 ? '#4CAF50' : '#8ca4c9';
        progressValue.style.height = '15px';
        progressValue.style.transition = 'width 0.3s, background-color 0.3s';
        
        const progressText = document.createElement('span');
        progressText.textContent = `${book.progress}%`;
        progressText.style.marginLeft = '5px';
        progressText.style.fontSize = '12px';
        
        const progressInput = document.createElement('input');
        progressInput.type = 'range';
        progressInput.min = '0';
        progressInput.max = '100';
        progressInput.value = book.progress;
        progressInput.style.width = '100%';
        progressInput.style.marginTop = '5px';
        
        progressInput.addEventListener('input', function() {
            progressValue.style.width = `${this.value}%`;
            // Change progress bar color to green when it reaches 100%
            progressValue.style.backgroundColor = this.value >= 100 ? '#4CAF50' : '#8ca4c9';
            progressText.textContent = `${this.value}%`;
        });
        
        progressInput.addEventListener('change', function() {
            updateProgress(book.id, parseInt(this.value));
        });
        
        progressBar.appendChild(progressValue);
        progressContainer.appendChild(progressLabel);
        progressContainer.appendChild(progressBar);
        progressContainer.appendChild(progressText);
        progressContainer.appendChild(progressInput);

        // Review section
        const reviewContainer = document.createElement('div');
        reviewContainer.style.marginBottom = '15px';
        
        const reviewLabel = document.createElement('p');
        reviewLabel.textContent = 'Ulasan:';
        reviewLabel.style.marginBottom = '5px';
        
        const reviewText = document.createElement('textarea');
        reviewText.value = book.review || '';
        reviewText.placeholder = 'Tulis ulasan untuk buku ini...';
        reviewText.style.width = '100%';
        reviewText.style.padding = '8px';
        reviewText.style.borderRadius = '5px';
        reviewText.style.border = '1px solid #ddd';
        reviewText.style.marginBottom = '5px';
        reviewText.style.height = '60px';
        reviewText.style.resize = 'vertical';
        
        const saveReviewBtn = document.createElement('button');
        saveReviewBtn.textContent = 'Simpan Ulasan';
        saveReviewBtn.style.backgroundColor = '#8ca4c9';
        saveReviewBtn.style.color = 'white';
        saveReviewBtn.style.border = 'none';
        saveReviewBtn.style.borderRadius = '5px';
        saveReviewBtn.style.padding = '5px 10px';
        saveReviewBtn.style.cursor = 'pointer';
        
        saveReviewBtn.addEventListener('click', function() {
            updateReview(book.id, reviewText.value);
        });
        
        reviewContainer.appendChild(reviewLabel);
        reviewContainer.appendChild(reviewText);
        reviewContainer.appendChild(saveReviewBtn);

        // Action buttons
        const removeButton = createActionButton('Hapus Buku', 'red', function(){
            removeBook(book.id);
        });

        let toggleButton;
        if(book.isComplete){
            toggleButton = createActionButton('Belum Selesai di Baca', 'yellow', function(){
                toggleisComplete(book.id);
            });   
        } else {
            toggleButton = createActionButton('Sudah selesai di baca', 'green', function(){
                toggleisComplete(book.id);
            }); 
        } 

        // Button styling
        removeButton.style.padding = '10px';
        removeButton.style.margin = '10px';
        removeButton.style.borderRadius = '10px';
        removeButton.style.border = '0';
        removeButton.style.backgroundColor = '#edabb8';
        removeButton.style.color = 'white';
        removeButton.style.fontWeight = 'bold';
        
        toggleButton.style.padding = '10px';
        toggleButton.style.borderRadius = '10px';
        toggleButton.style.border = '0';
        toggleButton.style.backgroundColor = '#8ca4c9'; 
        toggleButton.style.color = 'white';
        toggleButton.style.fontWeight = 'bold';

        actionButton.appendChild(toggleButton);
        actionButton.appendChild(removeButton);
        
        // Add all elements to the book item
        bookItem.appendChild(title);
        bookItem.appendChild(author);
        bookItem.appendChild(year);
        bookItem.appendChild(ratingContainer);
        bookItem.appendChild(progressContainer);
        bookItem.appendChild(reviewContainer);
        bookItem.appendChild(actionButton);

        return bookItem;
    }

    // Helper function to create action buttons
    function createActionButton(teks, className, clickHandler){
        const button = document.createElement('button');
        button.textContent = teks;
        button.classList.add(className);
        button.addEventListener('click', clickHandler);
        
        return button;
    }

    // Export and import functions
    window.exportData = function() {
        const dataStr = JSON.stringify(books, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `bookshelf_export_${new Date().toISOString().slice(0,10)}.json`;
        link.click();
    };
    
    window.importData = function() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.onchange = function(e) {
            const file = e.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = function(event) {
                try {
                    const importedData = JSON.parse(event.target.result);
                    if (Array.isArray(importedData)) {
                        if (confirm('Impor akan menggantikan semua data buku yang ada. Lanjutkan?')) {
                            books = importedData;
                            saveBooksLocalStorage();
                            updateBookshelf();
                            alert('Data berhasil diimpor!');
                        }
                    } else {
                        throw new Error('Format data tidak valid');
                    }
                } catch (error) {
                    alert('Gagal mengimpor data: ' + error.message);
                }
            };
            reader.readAsText(file);
        };
        
        input.click();
    };

    // Initialize
    updateBookshelf();

    // Make changeText function available globally
    window.changeText = function() {
        const checkbox = document.getElementById("inputBookIsComplete");
        const textSubmit = document.getElementById("textSubmit");
        
        if(checkbox.checked === true){
            textSubmit.innerText = "Sudah selesai dibaca";
        } else {
            textSubmit.innerText = "Belum selesai dibaca";
        }
    };
});
