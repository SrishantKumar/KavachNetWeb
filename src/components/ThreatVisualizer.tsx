import React, { useEffect, useRef } from 'react';
import { ThreatAnalysis } from '../utils/threatAnalysis';

interface ThreatVisualizerProps {
  analysis: ThreatAnalysis;
}

const ThreatVisualizer: React.FC<ThreatVisualizerProps> = ({ analysis }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Color schemes for different threat levels
  const threatColors = {
    low: '#4CAF50',
    medium: '#FFC107',
    high: '#FF5722',
    critical: '#F44336'
  };

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw threat meter
    const drawThreatMeter = () => {
      const centerX = canvas.width / 2;
      const centerY = canvas.height - 40;
      const radius = Math.min(canvas.width, canvas.height) / 3;

      // Draw arc background
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, Math.PI, 0);
      ctx.lineWidth = 20;
      ctx.strokeStyle = '#333';
      ctx.stroke();

      // Draw threat level indicator
      const normalizedScore = analysis.score / 10;
      const startAngle = Math.PI;
      const endAngle = Math.PI - (Math.PI * normalizedScore);

      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, startAngle, endAngle, true);
      ctx.strokeStyle = threatColors[analysis.threatLevel];
      ctx.stroke();

      // Draw score text
      ctx.font = 'bold 24px Arial';
      ctx.fillStyle = threatColors[analysis.threatLevel];
      ctx.textAlign = 'center';
      ctx.fillText(
        `Threat Level: ${analysis.threatLevel.toUpperCase()}`,
        centerX,
        centerY - 20
      );
      ctx.fillText(
        `Score: ${analysis.score.toFixed(1)}/10`,
        centerX,
        centerY + 10
      );
    };

    drawThreatMeter();
  }, [analysis]);

  return (
    <div className="w-full space-y-6 p-4">
      {/* Threat Meter Canvas */}
      <canvas
        ref={canvasRef}
        width={400}
        height={250}
        className="w-full max-w-md mx-auto"
      />

      {/* Threat Indicators */}
      <div className="space-y-4">
        {/* Danger Words */}
        {analysis.indicators.length > 0 && (
          <div className="bg-black/30 p-4 rounded-lg border border-red-500/20">
            <h3 className="text-lg font-semibold text-red-500 mb-2">
              Detected Threats
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {analysis.indicators.map((indicator, index) => (
                <div
                  key={index}
                  className="bg-black/40 p-3 rounded border border-red-500/10"
                >
                  <span className="text-red-400 font-medium">
                    {indicator.category.toUpperCase()}:
                  </span>
                  <p className="text-gray-300 mt-1">
                    <span className="font-medium text-red-300">
                      {indicator.word}
                    </span>
                    <span className="text-sm ml-2">
                      (Severity: {indicator.severity.toFixed(1)})
                    </span>
                  </p>
                  <p className="text-gray-400 text-sm mt-1">
                    Context: "{indicator.context}"
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Locations */}
        {analysis.locations.length > 0 && (
          <div className="bg-black/30 p-4 rounded-lg border border-blue-500/20">
            <h3 className="text-lg font-semibold text-blue-500 mb-2">
              Detected Locations
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {analysis.locations.map((location, index) => (
                <div
                  key={index}
                  className="bg-black/40 p-3 rounded border border-blue-500/10"
                >
                  <span className="text-blue-400 font-medium">
                    {location.city}
                  </span>
                  <p className="text-gray-400 text-sm mt-1">
                    Context: "{location.context}"
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Time Indicators */}
        {analysis.timeIndicators.length > 0 && (
          <div className="bg-black/30 p-4 rounded-lg border border-purple-500/20">
            <h3 className="text-lg font-semibold text-purple-500 mb-2">
              Detected Time References
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {analysis.timeIndicators.map((time, index) => (
                <div
                  key={index}
                  className="bg-black/40 p-3 rounded border border-purple-500/10"
                >
                  <span className="text-purple-400 font-medium">
                    {time.raw}
                  </span>
                  <p className="text-gray-400 text-sm mt-1">
                    Context: "{time.context}"
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="bg-black/30 p-4 rounded-lg border border-gray-500/20">
        <h3 className="text-lg font-semibold text-gray-300 mb-2">
          Analysis Summary
        </h3>
        <p className="text-gray-400">{analysis.summary}</p>
      </div>
    </div>
  );
};

export default ThreatVisualizer;
