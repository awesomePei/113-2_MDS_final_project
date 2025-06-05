import React, { useEffect } from 'react';

const DataVisualization = () => {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://public.tableau.com/javascripts/api/viz_v1.js';
    script.async = true;
    const vizContainer = document.getElementById('viz1749144453955');
    if (vizContainer) {
      vizContainer.appendChild(script);
    }
  }, []);

  return (
    <div style={{ width: '100%', height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div
        className="tableauPlaceholder"
        id="viz1749144453955"
        style={{ position: 'relative', width: '100%', height: '100%' }}
      >
        <noscript>
          <a href="#">
            <img
              alt="運輸方式各個國家的影響"
              src="https://public.tableau.com/static/images/M4/M4422M3F6/1_rss.png"
              style={{ border: 'none' }}
            />
          </a>
        </noscript>
        <object className="tableauViz" style={{ width: '100%', height: '100%' }}>
          <param name="host_url" value="https%3A%2F%2Fpublic.tableau.com%2F" />
          <param name="embed_code_version" value="3" />
          <param name="path" value="shared/M4422M3F6" />
          <param name="toolbar" value="yes" />
          <param name="static_image" value="https://public.tableau.com/static/images/M4/M4422M3F6/1.png" />
          <param name="animate_transition" value="yes" />
          <param name="display_static_image" value="yes" />
          <param name="display_spinner" value="yes" />
          <param name="display_overlay" value="yes" />
          <param name="display_count" value="yes" />
          <param name="language" value="zh-TW" />
        </object>
      </div>
    </div>
  );
};

export default DataVisualization;