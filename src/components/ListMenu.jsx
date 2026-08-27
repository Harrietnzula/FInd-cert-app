import { useState, useRef, useEffect } from "react";
import { useCollections } from "../context/CollectionsContext";
import "./ListMenu.css";

function ListMenu({ event }) {
  const { collections, createCollection, addToCollection, isInCollection } = useCollections();
  const [open, setOpen] = useState(false);
  const [newListName, setNewListName] = useState("");
  const menuRef = useRef(null);

  // Close the dropdown if the user clicks anywhere outside it
  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function toggleMenu(e) {
    e.preventDefault();
    e.stopPropagation();
    setOpen((prev) => !prev);
  }

  function handleAddToList(e, collectionId) {
    e.preventDefault();
    e.stopPropagation();
    addToCollection(collectionId, event);
    setOpen(false);
  }

  function handleCreateList(e) {
    e.preventDefault();
    e.stopPropagation();
    if (!newListName.trim()) return;
    const id = createCollection(newListName.trim());
    addToCollection(id, event);
    setNewListName("");
    setOpen(false);
  }

  return (
    <div className="list-menu" ref={menuRef}>
      <button
        className="list-menu-trigger"
        onClick={toggleMenu}
        aria-label="Save to a list"
      >
        +
      </button>

      {open && (
        <div className="list-menu-dropdown" onClick={(e) => e.stopPropagation()}>
          <p className="list-menu-title">Save to list</p>

          {collections.map((c) => (
            <button
              key={c.id}
              className="list-menu-item"
              onClick={(e) => handleAddToList(e, c.id)}
            >
              {c.name}
              {isInCollection(c.id, event.id) && <span className="list-menu-check">✓</span>}
            </button>
          ))}

          <form className="list-menu-new" onSubmit={handleCreateList}>
            <input
              type="text"
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              placeholder="New list name..."
              onClick={(e) => e.stopPropagation()}
            />
            <button type="submit">Add</button>
          </form>
        </div>
      )}
    </div>
  );
}

export default ListMenu;