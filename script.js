// DOM Elements
const notesContainer = document.getElementById("notesContainer");
const createBtn = document.getElementById("createBtn");

// Constants
const NOTES_KEY = "notes";
const ENTER_KEY = "Enter";

// Function to create a new note
function createNote(content = "") {
  const noteElement = document.createElement("div");
  noteElement.className = "input-box";

  const editableArea = document.createElement("p");
  editableArea.setAttribute("contenteditable", "true");
  editableArea.textContent = content;

  const deleteBtn = document.createElement("button");
  deleteBtn.className = "delete-btn";
  deleteBtn.setAttribute("aria-label", "Delete note");

  const deleteIcon = document.createElement("img");
  deleteIcon.src = "images/delete.png";
  deleteIcon.alt = "Delete Icon";

  deleteBtn.appendChild(deleteIcon);
  noteElement.append(editableArea, deleteBtn);
  notesContainer.appendChild(noteElement);

  // Focus on the new note
  setTimeout(() => {
    editableArea.focus();

    // Place cursor at end of text
    const range = document.createRange();
    const selection = window.getSelection();
    range.selectNodeContents(editableArea);
    range.collapse(false);
    selection.removeAllRanges();
    selection.addRange(range);
  }, 0);

  // Event listeners
  const deleteHandler = () => {
    noteElement.classList.add("fade-out");
    setTimeout(() => {
      noteElement.remove();
      updateStorage();
      checkEmptyState();
    }, 200);
  };

  deleteBtn.addEventListener("click", deleteHandler);
  editableArea.addEventListener("input", updateStorage);

  // Cleanup function
  const cleanup = () => {
    deleteBtn.removeEventListener("click", deleteHandler);
    editableArea.removeEventListener("input", updateStorage);
  };

  // Return cleanup function for potential future use
  return cleanup;
}

// Get notes from local storage with error handling
function getNotesFromStorage() {
  try {
    const notes = localStorage.getItem(NOTES_KEY);
    return notes ? JSON.parse(notes) : [];
  } catch (error) {
    console.error("Error reading notes from storage:", error);
    return [];
  }
}

// Update local storage with current notes
function updateStorage() {
  try {
    const notes = Array.from(document.querySelectorAll(".input-box p"))
      .map((note) => note.textContent.trim())
      .filter((note) => note !== "");
    localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
    checkEmptyState();
  } catch (error) {
    console.error("Error updating storage:", error);
  }
}

// Display notes from storage
function showNotes() {
  const savedNotes = getNotesFromStorage();

  if (savedNotes.length === 0) {
    showEmptyState();
  } else {
    savedNotes.forEach((note) => createNote(note));
  }
}

// Show empty state message
function showEmptyState() {
  notesContainer.innerHTML = `
      <div class="empty-state">
        No notes yet. Click "Create Note" to add your first note!
      </div>
    `;
}

// Check if we should show empty state
function checkEmptyState() {
  const notes = document.querySelectorAll(".input-box");
  if (notes.length === 0) {
    showEmptyState();
  }
}

// Event Listeners
createBtn.addEventListener("click", () => {
  // Remove empty state if shown
  const emptyState = document.querySelector(".empty-state");
  if (emptyState) emptyState.remove();

  createNote();

  // Scroll to the new note smoothly
  setTimeout(() => {
    notesContainer.lastElementChild.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
    });
  }, 100);
});

// Handle Enter key in contenteditable
document.addEventListener("keydown", (event) => {
  if (event.key === ENTER_KEY && event.target.hasAttribute("contenteditable")) {
    document.execCommand("insertLineBreak");
    event.preventDefault();
  }
});

// Initialize the app
showNotes();

// Service Worker Registration for PWA capabilities
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => {
        console.log("ServiceWorker registration successful");
      })
      .catch((err) => {
        console.log("ServiceWorker registration failed: ", err);
      });
  });
}
