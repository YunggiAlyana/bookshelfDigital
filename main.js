document.addEventListener('DOMContentLoaded', function() {
    // Ini adalah event listener yang akan dijalankan ketika DOM telah dimuat sepenuhnya.
    // Ini memastikan bahwa script JavaScript hanya berjalan setelah HTML selesai dimuat.

    const inputBook = document.getElementById('inputBook');
    const bookSubmit = document.getElementById('bookSubmit');
    const incompleteBookshelfList = document.getElementById('incompleteBookshelfList');
    const completeBookshelfList = document.getElementById('completeBookshelfList');

    //storage
    let books = [];
    const storageBook = localStorage.getItem('books');
    if (storageBook){
        books = JSON.parse(storageBook);
    }
    function saveBooksLocalStorage() {
        // Ini menyimpan objek buku ke dalam localStorage setelah diubah menjadi string JSON.
        localStorage.setItem('books', JSON.stringify(books));
    }

    //atur submit
    inputBook.addEventListener('submit', function(e){
        e.preventDefault();

        // Ini mendapatkan nilai dari input form untuk judul, penulis, tahun, dan status buku.
        const inputBookTitle = document.getElementById('inputBookTitle').value;
        const inputBookAuthor = document.getElementById('inputBookAuthor').value;
        const inputBookYear = Number(document.getElementById('inputBookYear').value);
        const inputBookIsComplete = document.getElementById('inputBookIsComplete').checked;

        // Mengecek apakah buku yang diinputkan sudah ada.
        const isDuplicate = books.some(book => book.title === inputBookTitle);
        if (isDuplicate){
            alert('Buku sudah ada!!!!');
        } else {
            // Membuat objek buku baru dan memasukkannya ke dalam array buku.
            books.push({
                id: new Date().getTime(),
                title: inputBookTitle,
                author: inputBookAuthor,
                year: inputBookYear,
                isComplete: inputBookIsComplete,
            });
            saveBooksLocalStorage(); // Menyimpan perubahan ke dalam localStorage.
            updateBookshelf(); // Memperbarui tampilan rak buku.
            // Mengosongkan nilai input setelah buku ditambahkan.
            document.getElementById('inputBookTitle').value = '';
            document.getElementById('inputBookAuthor').value = '';
            document.getElementById('inputBookYear').value = '';
            document.getElementById('inputBookIsComplete').checked = false;
        } 
    });

  
    // Fungsi untuk memperbarui tampilan rak buku.
    function updateBookshelf() {
        incompleteBookshelfList.innerHTML = '';
        completeBookshelfList.innerHTML = '';

        for (const book of books) {
            const bookItem = createBookItem(book); // Membuat elemen untuk setiap buku.
            if (book.isComplete) {
                completeBookshelfList.appendChild(bookItem); // Menambahkan buku ke rak yang sesuai.
            } else {
                incompleteBookshelfList.appendChild(bookItem);
            }
        }
    }

    // Fungsi untuk menghapus buku berdasarkan ID.
    function removeBook(id){
        const index = books.findIndex(book => book.id === id);
        if (index !== -1){
            books.splice(index, 1); // Menghapus buku dari array.
            saveBooksLocalStorage(); // Menyimpan perubahan ke dalam localStorage.
            updateBookshelf(); // Memperbarui tampilan rak buku.
        }
    }

    // Fungsi untuk mengubah status buku menjadi lengkap atau belum lengkap.
    function toggleisComplete(id){
        const index = books.findIndex(book => book.id === id);
        if (index !== -1){
            books[index].isComplete = !books[index].isComplete; // Toggle status buku.
            saveBooksLocalStorage(); // Menyimpan perubahan ke dalam localStorage.
            updateBookshelf(); // Memperbarui tampilan rak buku.
        }
    }

    // Event listener untuk pencarian buku.
    const searchBook = document.getElementById('searchBook');
    const searchBookTitle = document.getElementById('searchBookTitle');
    
    searchBook.addEventListener('submit', function(e){
        e.preventDefault();
        const query = searchBookTitle.value.toLowerCase().trim();

        // Mencari buku berdasarkan judul, penulis, atau tahun.
        const searchResult = books.filter(book => {
            return(
                book.title.toLowerCase().includes(query)|| 
                book.author.toLowerCase().includes(query)||
                book.year.toString().includes(query)
            );   
        });
        updateSearchResult(searchResult); // Memperbarui tampilan hasil pencarian.
    });

    // Fungsi untuk memperbarui tampilan hasil pencarian.
    function updateSearchResult(result){
        incompleteBookshelfList.innerHTML = '';
        completeBookshelfList.innerHTML = '';

        for (const book of result){
            const bookItem = createBookItem(book); // Membuat elemen untuk setiap buku dalam hasil pencarian.
            if(book.isComplete){
                completeBookshelfList.appendChild(bookItem); // Menambahkan buku ke rak yang sesuai.
            } else {
                incompleteBookshelfList.appendChild(bookItem);
            }
        }
    }

    // Fungsi untuk membuat elemen buku.
    function createBookItem(book){
        const bookItem = document.createElement('article');
        bookItem.className = 'book_item';
        bookItem.style.margin = '10px';
        bookItem.style.border = 'none';
        bookItem.style.backgroundColor ='#F8E8EE';

        const actionButton = document.createElement('div');
        actionButton.className = 'action';
        
        const title = document.createElement('h3');
        title.textContent = book.title;
        title.style.color = '#000000';
        title.style.marginBottom = '10px';
        
        const author = document.createElement('p');
        author.textContent = book.author;
        author.style.color = '#000000';
        author.style.marginBottom = '10px';

        const year = document.createElement('p');
        year.textContent = book.year;
        year.style.color = '#000000';
        year.style.marginBottom = '10px';

        // Membuat tombol untuk menghapus buku.
        const removeButton = createActionButton('Hapus Buku', 'red', function(){
            removeBook(book.id);
        });

        // Membuat tombol untuk mengubah status buku.
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

        // Styling tombol hapus buku.
        removeButton.style.padding = '10px';
        removeButton.style.margin = '10px';
        removeButton.style.borderRadius = '10px';
        removeButton.style.border = '0';
        removeButton.style.backgroundColor = '#edabb8';
        removeButton.style.color = 'white';
        removeButton.style.fontWeight = 'bold';
        
        // Styling tombol ubah status buku.
        toggleButton.style.padding = '10px';
        toggleButton.style.borderRadius = '10px';
        toggleButton.style.border = '0';
        toggleButton.style.backgroundColor = '#8ca4c9'; 
        toggleButton.style.color = 'white';
        toggleButton.style.fontWeight = 'bold';

        // Menambahkan tombol ke dalam elemen aksi.
        actionButton.appendChild(toggleButton);
        actionButton.appendChild(removeButton);
        
        // Menambahkan elemen judul, penulis, tahun, dan aksi ke dalam elemen buku.
        bookItem.appendChild(title);
        bookItem.appendChild(author);
        bookItem.appendChild(year);
        bookItem.appendChild(actionButton);

        return bookItem; // Mengembalikan elemen buku yang telah dibuat.
    }

    // Fungsi untuk membuat tombol aksi.
    function createActionButton(teks, className, clickHandler){
        const button = document.createElement('button');
        button.textContent = teks; // Menambahkan teks pada tombol.
        button.classList.add(className); // Menambahkan kelas pada tombol.
        button.addEventListener('click', clickHandler); // Menambahkan event listener untuk klik pada tombol.
        
        return button; // Mengembalikan elemen tombol yang telah dibuat.
    }

    updateBookshelf(); // Memperbarui tampilan rak buku setelah DOM dimuat.
});


function changeText(){
    // Mendapatkan elemen checkbox dengan id "inputBookIsComplete"
    const checkbox = document.getElementById("inputBookIsComplete");
    // Mendapatkan elemen dengan id "textSubmit"
    const textSubmit = document.getElementById("textSubmit");

    // Memeriksa status checkbox
    if(checkbox.checked === true){
        // Jika diceklis, ubah teks menjadi "Sudah selesai dibaca"
        textSubmit.innerText = "Sudah selesai dibaca";
    }else{
        // Jika tidak, ubah teks menjadi "Belum selesai dibaca"
        textSubmit.innerText = "Belum selesai dibaca";
    }
    
    updateBookshelf();
};



