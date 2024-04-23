import { useEffect, useState, useRef } from "react";
import { Button } from "../Button/Button";
import "./Note.css";

export function Note({
  id,
  title: initialTitle,
  content: initialContent,
  onSubmit,
}) {
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [lastSavedTime, setLastSavedTime] = useState(null);
  const [contentSavedLabel, setContentSavedLabel] = useState(null); // Déclaration de la variable d'état pour le label de sauvegarde
  const contentRef = useRef(null);

  useEffect(() => {
    const fetchLastSavedTime = async () => {
      try {
        const response = await fetch(`http://localhost:4000/notes/${id}`);
        const note = await response.json();
        const lastSavedTime = new Date(note.lastUpdatedAt);
        setLastSavedTime(lastSavedTime);
      } catch (error) {
        console.error("Error fetching last saved time:", error);
      }
    };

    setTitle(initialTitle);
    setContent(initialContent);
    fetchLastSavedTime();
  }, [id, initialTitle, initialContent]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      if (lastSavedTime) {
        const currentTime = new Date();
        const elapsedSeconds = Math.floor((currentTime - lastSavedTime) / 1000);

        if (elapsedSeconds > 2 && elapsedSeconds < 6) {
          setContentSavedLabel(`🎉 Modifications sauvegardées !`);
        }
        else if (elapsedSeconds > 60) {
          const elapsedMinutes = Math.round(elapsedSeconds / 60);
          setContentSavedLabel(`⌛ Dernière sauvegarde il y a ${elapsedMinutes} minute` + (elapsedMinutes > 1 ? `s` : ``));
        }
        else {
          setContentSavedLabel(`💾 Sauvegarde automatique activtée`);
        }
        
      }
    }, 1000);

    return () => clearInterval(intervalId);
  }, [lastSavedTime]);

  const updateNote = async (title, content) => {
    const response = await fetch(`http://localhost:4000/notes/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title,
        content,
        lastUpdatedAt: new Date(),
      }),
    });

    const updatedNote = await response.json();
    onSubmit(id, updatedNote);
    setLastSavedTime(new Date());
  };

  return (
    <form className="Form">
      <input
        className="Note-editable Note-title"
        type="text"
        value={title}
        onChange={(event) => {
          setTitle(event.target.value);
          updateNote(event.target.value, content);
        }}
      />
      <textarea
        ref={contentRef}
        className="Note-editable Note-content"
        value={content}
        onChange={(event) => {
          setContent(event.target.value);
          updateNote(title, event.target.value);
        }}
      />
      <div className="Note-actions">
        {contentSavedLabel && <label>{contentSavedLabel}</label>}
      </div>
    </form>
  );
}
