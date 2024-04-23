import './App.css';
import React, { useState, useEffect } from 'react';
import { Button } from "./components/Button/Button";
import { Note } from "./components/Note/Note";
import { Loading } from "./components/Loading/Loading";

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [notes, setNotes] = useState([]);
  const [selectedNoteId, setSelectedNoteId] = useState(null);
  const [username, setUsername] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isNightMode, setIsNightMode] = useState(false);

  useEffect(() => { // Chargement du profile
    fetch("http://localhost:4000/profile")
      .then(response => response.json())
      .then(data => {
        setUsername(data.name);
      });
  }, []);  

  useEffect(() => { // Chargement du nightmode
    document.body.className = isNightMode ? 'night-mode' : '';
  }, [isNightMode]);  

  useEffect(() => { // Chargement des notes
    fetch("http://localhost:4000/notes")
      .then(response => {
        if (!response.ok) {
          throw new Error('Impossible de charger les notes');
        }
        return response.json();
      })
      .then(data => {
        setNotes(data);
        setIsLoading(false);
      })
      .catch(error => {
        alert("Erreur : " + error.message);
      });
  }, []);
  
  const createNote = async () => { // Création d'une note
    try {
      const response = await fetch("http://localhost:4000/notes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: "Nouvelle note",
          content: "",
          lastUpdatedAt: new Date()
        })
      });
      if (!response.ok) {
        throw new Error('Impossible de créer la note');
      }
      const newNote = await response.json();
      setNotes(prevNotes => [{ ...newNote, isPinned: false }, ...prevNotes]);
    } catch (error) {
      alert("Erreur : " + error.message);
    }
  };  

  const togglePinNote = async (id) => {
    try {
      const note = notes.find(note => note.id === id);
      const updatedNote = { ...note, isPinned: !note.isPinned }; // Toggle le status isPinned
      const response = await fetch(`http://localhost:4000/notes/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedNote)
      });
      if (!response.ok) {
        throw new Error('Impossible d\'épingler la note');
      }

      setNotes(prevNotes => {
      const newNotes = prevNotes.map(note => note.id === id ? updatedNote : note);
      return newNotes.sort((a, b) => {
        if (b.isPinned === a.isPinned) {
          return a.id - b.id;
        }
        return b.isPinned - a.isPinned;
      });
      });
    }
    catch (error) {
      alert("Erreur : " + error.message);
    }
  };  

  const deleteNote = async (id) => {
    try {
      if (window.confirm("Êtes-vous sûr de vouloir supprimer cette note ?")) {
        const response = await fetch(`http://localhost:4000/notes/${id}`, {
          method: "DELETE",
        });
        if (!response.ok) {
          throw new Error('Impossible de supprimer la note');
        }

        setNotes(prevNotes => prevNotes.filter(note => note.id !== id));
        if (selectedNoteId === id) {
          setSelectedNoteId(null);  // Réinitialise l'ID de la note sélectionnée
        }
      }
    }
    catch (error) {
      alert("Erreur : " + error.message);
    }
  };

  const toggleCheckNote = async (id) => {
    try {
      const note = notes.find(note => note.id === id);
      const updatedNote = { ...note, isChecked: !note.isChecked }; // Toggle le status isChecked
      const response = await fetch(`http://localhost:4000/notes/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedNote)
      });
      if (!response.ok) {
        throw new Error('Impossible de valider la note');
      }
      setNotes(prevNotes => {
        const newNotes = prevNotes.map(note => note.id === id ? updatedNote : note);
        return newNotes.sort((a, b) => b.isPinned - a.isPinned); // Maintenir l'ordre de tri
      });
    }
    catch (error) {
      alert("Erreur : " + error.message);
    }
  };

  const filteredNotes = notes && searchTerm.length > 0
    ? notes.filter(note =>
        note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (note.content && note.content.toString().toLowerCase().includes(searchTerm.toLowerCase()))
      )
    : notes;

  const sortedNotes = notes.sort((a, b) => b.isPinned - a.isPinned);

  return (
    <>
      <div className="theme-switch-wrapper">
        <Button onClick={() => setIsNightMode(!isNightMode)}>
          {isNightMode ? 'Mode Jour 🌞' : 'Mode Nuit 🌙'}
        </Button>
      </div>
      <aside className="Side">
        <div className="User-wrapper">
          <h3>🧑‍💼 {username}</h3>
        </div>
        <div className="Create-note-wrapper">
          <Button onClick={createNote}>+ Create new note</Button>
        </div>
        <input
          type="text"
          placeholder="Rechercher..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="Search-input"
        />
        {isLoading ? (
          <Loading />
        ) : (
          sortedNotes.map((note) => (
            <div key={note.id} className="note-item">
              <button
                className={`Note-button ${selectedNoteId === note.id ? "Note-button-selected" : ""}`}
                onClick={() => setSelectedNoteId(note.id)}
              >
                {note.title}
              </button>
              <button
                className={`Pin-button ${note.isPinned ? "is-pinned" : ""}`}
                onClick={(e) => {
                  e.stopPropagation();
                  togglePinNote(note.id);
                }}
              >
                {note.isPinned ? "📌" : "📍"}
              </button>
              <button
                className="Delete-button"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteNote(note.id);
                }}
              >
                🗑️
              </button>
              <button
                className={`Check-button ${note.isChecked ? "is-checked" : ""}`}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleCheckNote(note.id);
                }}
              >
                {note.isChecked ? "✅" : "⬜"}
              </button>
            </div>
          ))
        )}
      </aside>
      <main className="Main">
        {selectedNoteId && (
          <Note
            id={selectedNoteId}
            title={sortedNotes.find(note => note.id === selectedNoteId)?.title}
            content={sortedNotes.find(note => note.id === selectedNoteId)?.content}
            onSubmit={(id, updatedNote) => {
              setNotes(notes.map(note => note.id === id ? updatedNote : note));
            }}
          />
        )}
      </main>
    </>
  );
}

export default App;