import { useState, useEffect } from "react"
import { sendToContentScript } from "@plasmohq/messaging"

import "./style.css"

function IndexPopup() {
  const [process, setProcess] = useState({ loading: false, result: undefined })
  const [currentTab, setCurrentTab] = useState("");

  useEffect(() =>
    chrome.tabs.query({
      active: true,
      currentWindow: true,
    }, function (tabs) {
      const tab = tabs[0];
      if (tab.url) {
        setCurrentTab(tab.url);
      }
    }),
    [chrome],
  );

  console.log(currentTab)

  const download = async () => {
    setProcess({ loading: true, result: undefined })
    const r = await sendToContentScript({ name: "generate-canvas" })
    setProcess({ loading: false, result: r });
  }

  return (
    <div className="flex flex-col justify-between items-center" style={{ padding: 16, width: 300, height: 200 }}>
      <p>Open Pitch.com slides and ensure you're on the first slide, then click "Download PDF." Avoid leaving the tab or performing any actions while the script operates.</p>
      <button
        className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 border-gray-900 bg-gray-900 text-gray-50 shadow-md"
        onClick={download}
        disabled={process.loading || !currentTab.includes('pitch.com')}
      >
          { process.loading ? 'Loading...' : 'Download PDF' }
      </button>
      <a href="https://github.com/ilyamkin/pitchcom-pdf-downloader" target="_blank">
        View Github / Submit Issue
      </a>
    </div>
  )
}

export default IndexPopup
