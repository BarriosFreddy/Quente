import React, { useEffect, useRef, useState } from "react";
import * as Quagga from "quagga";

const BarcodeScanner = ({ onDetected }) => {
  const scannerRef = useRef(null);
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    if (!scanning || !scannerRef.current) return;

    if (scanning) {
      Quagga.init(
        {
          inputStream: {
            name: "Live",
            type: "LiveStream",
            target: scannerRef.current,
            constraints: {
              facingMode: "environment",
            },
          },
          decoder: {
            readers: [
              "code_128_reader",
              "ean_reader",
              "ean_8_reader",
              "upc_reader",
            ],
          },
          locate: true, // Helps Quagga find the barcode faster
          numOfWorkers: navigator.hardwareConcurrency || 4, // Use multiple CPU threads
          frequency: 10, // Scan every 10ms (reduces lag)
          locator: {
            patchSize: "medium", // Options: "x-small", "small", "medium", "large", "x-large"
            halfSample: true,
          },
        },
        function (err) {
          if (err) {
            console.error("Error initializing Quagga:", err);
            return;
          }
          Quagga.start();
        }
      );

      let lastScannedCodes = [];

      Quagga.onDetected((result) => {
        const scannedCode = result.codeResult.code;

        lastScannedCodes.push(scannedCode);

        // Keep only the last 5 scanned results
        if (lastScannedCodes.length > 5) {
          lastScannedCodes.shift();
        }

        // Check if 3 of the last 5 results are the same (to confirm accuracy)
        const mostCommonCode = lastScannedCodes
          .sort(
            (a, b) =>
              lastScannedCodes.filter((v) => v === a).length -
              lastScannedCodes.filter((v) => v === b).length
          )
          .pop();

        if (mostCommonCode === scannedCode) {
          console.log("Final Barcode:", scannedCode);
          onDetected(scannedCode);
          Quagga.stop();
        }
      });
    }

    return () => {
      Quagga.stop();
    };
  }, [scanning]);

  return (
    <div>
      {scanning && (
        <div ref={scannerRef} style={{ width: "100%", height: "500px" }}></div>
      )}
      <button onClick={() => setScanning(true)} disabled={scanning}>
        {scanning ? "Scanning..." : "Start"}
      </button>
      <button onClick={() => setScanning(false)} disabled={!scanning}>
        Stop
      </button>
    </div>
  );
};

export default BarcodeScanner;
