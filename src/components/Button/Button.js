import styles from "./Button.module.css";

export function Button({ onClick, children }) {
  return (
    <button onClick={onClick} className={styles.Button}>
      {children}
    </button>
  );
}
