import React, { useState, useEffect, useRef } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";

function App() {
  const [markdown, setMarkdown] = useState("# Hello Markdown\n");
  const [htmlPreview, setHtmlPreview] = useState("");

  // Refs for textarea and preview
  const textareaRef = useRef(null);
  const previewRef = useRef(null);

  useEffect(() => {
    const fetchHtml = async () => {
      try {
        const response = await fetch("http://52.90.59.248:4000/convert", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ markdown }),
        });

        const data = await response.json();
        setHtmlPreview(data.html || "Error processing markdown");
      } catch (error) {
        console.error("Error fetching HTML", error);
        setHtmlPreview("Failed to load preview");
      }
    };

    fetchHtml();
  }, [markdown]);

  // Sync scrolling between textarea and preview
  const syncScroll = () => {
    const textarea = textareaRef.current;
    const preview = previewRef.current;

    if (textarea && preview) {
      const scrollRatio = textarea.scrollTop / (textarea.scrollHeight - textarea.clientHeight);
      preview.scrollTop = scrollRatio * (preview.scrollHeight - preview.clientHeight);
    }
  };

  // Insert Markdown at cursor position
  const insertMarkdown = (syntax) => {
    const textarea = textareaRef.current;
    const startPos = textarea.selectionStart;
    const endPos = textarea.selectionEnd;

    let selectedText = textarea.value.substring(startPos, endPos);
    if (!selectedText) {
      selectedText =
        syntax === "bold" ? "Bold text" :
          syntax === "italic" ? "Italic text" :
            syntax === "code" ? "Code" :
              syntax === "quote" ? "Quote" :
                syntax === "list" ? "List item" :
                  syntax === "link" ? "Title" :
                    syntax === "image" ? "Alt text" :
                      "";
    }

    const newText =
      syntax === "h1" ? `# ${selectedText}` :
        syntax === "h2" ? `## ${selectedText}` :
          syntax === "h3" ? `### ${selectedText}` :
            syntax === "bold" ? `**${selectedText}**` :
              syntax === "italic" ? `*${selectedText}*` :
                syntax === "code" ? `\`${selectedText}\`` :
                  syntax === "quote" ? `> ${selectedText}` :
                    syntax === "list" ? `- ${selectedText}` :
                      syntax === "link" ? `[${selectedText}](https://example.com)` :
                        syntax === "image" ? `![${selectedText}](image-url)` :
                          "";

    const updatedText =
      markdown.substring(0, startPos) + newText + markdown.substring(endPos);

    setMarkdown(updatedText);

    setTimeout(() => {
      textarea.selectionStart = startPos + newText.length;
      textarea.selectionEnd = startPos + newText.length;
      textarea.focus();
    }, 0);
  };

  return (
    <div className="container-fluid p-3">
      {/* Navbar */}
      <nav className="navbar navbar-light bg-secondary p-3 mb-3">
        <span className="navbar-brand text-dark font-weight-bold">Markdown Editor</span>
      </nav>

      {/* Editor and Preview Layout */}
      <div className="row">
        {/* Markdown Editor */}
        <div className="col-md-6 editor-container">
          {/* Toolbar */}
          <div className="toolbar bg-secondary text-white p-2 d-flex">
            <h5 className="m-2"> Toolbar </h5>
            <div className="btn-group ml-auto">
              <button className="btn btn-outline-light" onClick={() => insertMarkdown("h1")}>H1</button>
              <button className="btn btn-outline-light" onClick={() => insertMarkdown("h2")}>H2</button>
              <button className="btn btn-outline-light" onClick={() => insertMarkdown("h3")}>H3</button>
              <button className="btn btn-outline-light" onClick={() => insertMarkdown("bold")}>Bold</button>
              <button className="btn btn-outline-light" onClick={() => insertMarkdown("italic")}>Italic</button>
              <button className="btn btn-outline-light" onClick={() => insertMarkdown("code")}>Code</button>
              <button className="btn btn-outline-light" onClick={() => insertMarkdown("quote")}>Quote</button>
              <button className="btn btn-outline-light" onClick={() => insertMarkdown("list")}>List</button>
              <button className="btn btn-outline-light" onClick={() => insertMarkdown("link")}>Link</button>
              <button className="btn btn-outline-light" onClick={() => insertMarkdown("image")}>Image</button>
            </div>
          </div>

          {/* Textarea */}
          <textarea
            ref={textareaRef}
            id="editor"
            className="form-control p-3 editor-textarea"
            rows="20"
            value={markdown}
            onChange={(e) => setMarkdown(e.target.value)}
            onScroll={syncScroll}
            placeholder="Type Markdown here..."
          />
        </div>

        {/* Live Preview */}
        <div className="col-md-6 preview-container">
          <div className="preview-header bg-secondary text-white p-2">
            <h5 className="m-0">Live Preview</h5>
          </div>
          <div ref={previewRef} className="preview-content border p-3 bg-light">
            <div dangerouslySetInnerHTML={{ __html: htmlPreview }} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;