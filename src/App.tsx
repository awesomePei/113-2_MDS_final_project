import React, { useState } from 'react';
import './App.css';
import DataVisualization from './tabs/data_visualization';
import DelayPrediction from './tabs/delay_prediction';
import BestDeliveryArrangement from './tabs/best_delivery_arrangement';

const App = () => {
  const [activeTab, setActiveTab] = useState('data_visualize');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'data_visualize':
        return <DataVisualization />;
      case 'delay_predict':
        return <DelayPrediction />;
      case 'best_delivery':
        return <BestDeliveryArrangement />;
      default:
        return null;
    }
  };

  return (
    <div className="App">
      <nav className="tab-container">
        <button
          className={`tab-button ${activeTab === 'data_visualize' ? 'active-tab' : ''}`}
          onClick={() => setActiveTab('data_visualize')}
        >
          Data Visualization
        </button>
        <button
          className={`tab-button ${activeTab === 'delay_predict' ? 'active-tab' : ''}`}
          onClick={() => setActiveTab('delay_predict')}
        >
          Delay Prediction
        </button>
        <button
          className={`tab-button ${activeTab === 'best_delivery' ? 'active-tab' : ''}`}
          onClick={() => setActiveTab('best_delivery')}
        >
          Best Delivery Arrangement
        </button>
      </nav>
      <main className="tab-content">{renderTabContent()}</main>
    </div>
  );
};

export default App;
