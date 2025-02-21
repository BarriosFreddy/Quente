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
        },
        function (err) {
          if (err) {
            console.error("Error initializing Quagga:", err);
            return;
          }
          Quagga.start();
        }
      );

      Quagga.onDetected((result) => {
        console.log("Barcode detected:", result.codeResult.code);
        onDetected(result.codeResult.code);
        Quagga.stop(); // Stop scanning after detection
        setScanning(false);
      });
    }

    return () => {
      Quagga.stop();
    };
  }, [scanning]);

  return (
    <div>
      {scanning && (
        <div
          ref={scannerRef}
          style={{ width: "100%", height: "500px"}}
        ></div>
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
