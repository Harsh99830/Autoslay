import { useState } from "react";
import "../styles/taginput.css";

export default function TagInput({ values, onChange, placeholder, type = "text" }) {
  const [input, setInput] = useState("");
  const [error, setError] = useState("");

  const validate = (val) => {
    if (type === "email") {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
    }
    if (type === "tel") {
      return /^[+\d\s\-().]{7,20}$/.test(val);
    }
    return val.trim().length > 0;
  };

  const add = () => {
    const val = input.trim();
    if (!val) return;
    if (!validate(val)) {
      setError(`Invalid ${type === "email" ? "email address" : "phone number"}`);
      return;
    }
    if (values.includes(val)) {
      setError("Already added");
      return;
    }
    onChange([...values, val]);
    setInput("");
    setError("");
  };

  const remove = (v) => onChange(values.filter((x) => x !== v));

  const onKey = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      add();
    }
    if (e.key === "Backspace" && input === "" && values.length) {
      remove(values[values.length - 1]);
    }
  };

  return (
    <div className="tag-input">
      <div className="tag-input__box">
        {values.map((v) => (
          <span className="tag" key={v}>
            {v}
            <button onClick={() => remove(v)} className="tag__remove">✕</button>
          </span>
        ))}
        <input
          type={type === "email" ? "email" : "text"}
          value={input}
          onChange={(e) => { setInput(e.target.value); setError(""); }}
          onKeyDown={onKey}
          onBlur={add}
          placeholder={values.length === 0 ? placeholder : ""}
        />
      </div>
      {error && <p className="tag-input__error">{error}</p>}
    </div>
  );
}
