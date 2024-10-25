import React, { useState } from "react";
import { Editor, OnChange } from "@monaco-editor/react";
import "./jsonConfig.css";
import ImageButton from "../buttons/ImageButton";
import Load from "../../assets/load.svg";
import Save from "../../assets/save.svg";
import Format from "../../assets/format.svg";
import { validateJsonConfig } from "../../logic/jsonConfig/parser";
import Warning from "../../assets/warning.svg";
import { useSimulationConfig } from "../../context/simulationConfig";

const JsonConfig: React.FC = () => {
  const jsonConfig = useSimulationConfig();

  const [jsonContent, setJsonContent] = useState<string>(JSON.stringify(jsonConfig.jsonConfig, null, 2));
  const [error, setError] = useState<string | null>(null);

  const handleEditorChange: OnChange = (value: string | undefined, _) => {
    if (value === undefined) return;
    setJsonContent(value);
    try {
      validateJsonConfig(value);
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
      var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(jsonContent));
      var downloadAnchorNode = document.createElement("a");
      downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute("download", "trust-simulation-config.json");
      document.body.appendChild(downloadAnchorNode);
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
      alert("JSON content downloaded successfully!");
    } else {
      alert("Please fix JSON errors before saving.");
    }
  };

  const handleLoad = () => {
    jsonConfig.updateSimulationConfig(jsonContent);
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
      {error && (
        <div className="error-message">
          <img src={Warning} alt="Error Icon"></img>
          <div>JSON Error: {error}</div>
        </div>
      )}
    </div>
  );
};

export default JsonConfig;
