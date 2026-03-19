// Library Management System - Main Application

class Library {
    constructor() {
        this.books = JSON.parse(localStorage.getItem('libraryBooks')) || [];
        this.init();
    }

    init() {
        this.cacheDOM();
        this.bindEvents();
        this.render();
        this.updateStats();
    }

    cacheDOM() {
        this.form = document.getElementById('book-form');
        this.titleInput = document.getElementById('title');
        this.authorInput = document.getElementById('author');
        this.isbnInput = document.getElementById('isbn');
        this.genreInput = document.getElementById('genre');
        this.searchInput = document.getElementById('search');
        this.booksList = document.getElementById('books-list');
        this.totalSpan = document.getElementById('total-books');
        this.availableSpan = document.getElementById('available-books');
        this.borrowedSpan = document.getElementById('borrowed-books');
    }

    bindEvents() {
        this.form.addEventListener('submit', (e) => this.addBook(e));
        this.searchInput.addEventListener('input', (e) => this.searchBooks(e.target.value));
    }

    addBook(e) {
        e.preventDefault();
        
        const book = {
            id: Date.now(),
            title: this.titleInput.value.trim(),
            author: this.authorInput.value.trim(),
            isbn: this.isbnInput.value.trim() || 'N/A',
            genre: this.genreInput.value || 'Uncategorized',
            borrowed: false,
            addedAt: new Date().toLocaleDateString()
        };

        this.books.push(book);
        this.save();
        this.render();
        this.updateStats();
        this.form.reset();
        
        this.showNotification('Book added successfully!', 'success');
    }

    deleteBook(id) {
        if (confirm('Are you sure you want to delete this book?')) {
            this.books = this.books.filter(book => book.id !== id);
            this.save();
            this.render();
            this.updateStats();
            this.showNotification('Book deleted', 'info');
        }
    }

    toggleBorrow(id) {
        const book = this.books.find(b => b.id === id);
        if (book) {
            book.borrowed = !book.borrowed;
            this.save();
            this.render();
            this.updateStats();
            const msg = book.borrowed ? 'Book borrowed' : 'Book returned';
            this.showNotification(msg, 'success');
        }
    }

    searchBooks(query) {
        const filtered = this.books.filter(book => 
            book.title.toLowerCase().includes(query.toLowerCase()) ||
            book.author.toLowerCase().includes(query.toLowerCase()) ||
            book.isbn.toLowerCase().includes(query.toLowerCase())
        );
        this.render(filtered);
    }

    updateStats() {
        const total = this.books.length;
        const borrowed = this.books.filter(b => b.borrowed).length;
        const available = total - borrowed;
        
        this.totalSpan.textContent = total;
        this.availableSpan.textContent = available;
        this.borrowedSpan.textContent = borrowed;
    }

    render(booksToRender = this.books) {
        if (booksToRender.length === 0) {
            this.booksList.innerHTML = `
                <div class="empty-state" style="grid-column: 1/-1;">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                    </svg>
                    <h3>No books found</h3>
                    <p>Add your first book to get started</p>
                </div>
            `;
            return;
        }

        this.booksList.innerHTML = booksToRender.map(book => `
            <div class="book-card ${book.borrowed ? 'borrowed' : ''}">
                <div class="book-title">${this.escapeHtml(book.title)}</div>
                <div class="book-author">👤 ${this.escapeHtml(book.author)}</div>
                <div class="book-isbn">📖 ISBN: ${this.escapeHtml(book.isbn)}</div>
                <span class="book-genre">${this.escapeHtml(book.genre)}</span>
                <div class="book-actions">
                    <button class="btn-small ${book.borrowed ? 'btn-return' : 'btn-borrow'}" 
                            onclick="library.toggleBorrow(${book.id})">
                        ${book.borrowed ? '↩ Return' : '📥 Borrow'}
                    </button>
                    <button class="btn-small btn-delete" 
                            onclick="library.deleteBook(${book.id})">
                        🗑 Delete
                    </button>
                </div>
            </div>
        `).join('');
    }

    save() {
        localStorage.setItem('libraryBooks', JSON.stringify(this.books));
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    showNotification(message, type) {
        // Create notification element
        const notif = document.createElement('div');
        notif.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#2ed573' : '#667eea'};
            color: white;
            padding: 15px 25px;
            border-radius: 10px;
            box-shadow: 0 5px 20px rgba(0,0,0,0.2);
            z-index: 1000;
            animation: slideIn 0.3s ease;
        `;
        notif.textContent = message;
        document.body.appendChild(notif);
        
        setTimeout(() => {
            notif.remove();
        }, 3000);
    }
}

// Initialize library
const library = new Library();

// Add CSS animation for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
`;
document.head.appendChild(style);