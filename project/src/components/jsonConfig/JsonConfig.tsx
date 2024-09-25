// JsonConfig.tsx
import React, { useState } from "react";
import { Editor, OnChange } from "@monaco-editor/react";
import "./jsonConfig.css";
import ImageButton from "../buttons/ImageButton";
import Load from "../../assets/load.svg";
import Save from "../../assets/save.svg";
import Format from "../../assets/format.svg";

const JsonConfig: React.FC = () => {
  const [jsonContent, setJsonContent] = useState<string>("{ \n\t\n}");
  const [error, setError] = useState<string | null>(null);

  const handleEditorChange: OnChange = (value: string | undefined, _) => {
    if (value === undefined) return;
    setJsonContent(value);

    try {
      JSON.parse(value);
      setError(null);
    } catch (e: unknown) {
      if (e instanceof Error) {
        setError(e.message);
      }
    }
  };

  const handleFormat = () => {
    try {
      const formatted = JSON.stringify(JSON.parse(jsonContent), null, 2);
      setJsonContent(formatted);
      setError(null);
    } catch (e: unknown) {
      if (e instanceof Error) {
        setError(e.message);
      }
    }
  };

  const handleSave = () => {
    if (!error) {
      localStorage.setItem("jsonConfig", jsonContent);
      alert("JSON content saved successfully!");
    } else {
      alert("Please fix JSON errors before saving.");
    }
  };

  const handleLoad = () => {
    const savedJson = localStorage.getItem("jsonConfig");
    if (savedJson) {
      setJsonContent(savedJson);
      setError(null);
    } else {
      alert("No saved configuration found.");
    }
  };

  return (
    <div className="json-config-container">
      <div className="editor-header">
        <h2>Simulation Config</h2>
        <div className="header-buttons">
          <ImageButton onClick={handleLoad} src={Load} alt="Load config" className="squre-button" />
          <ImageButton onClick={handleFormat} src={Format} alt="Format config" className="squre-button" />
          <ImageButton onClick={handleSave} disabled={!!error} src={Save} alt="Save config" className="squre-button" />
        </div>
      </div>
      <Editor
        height="100%"
        language="json"
        theme="light"
        value={jsonContent}
        onChange={handleEditorChange}
        options={{
          automaticLayout: true,
          minimap: { enabled: false },
          fontSize: 12,
          wordWrap: "on",
        }}
      />
      {error && <div className="error-message">JSON Error: {error}</div>}
    </div>
  );
};

export default JsonConfig;
