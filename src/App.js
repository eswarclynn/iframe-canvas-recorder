import React, { useEffect, useRef, useState } from "react";
import RecordRTC from "recordrtc";
import html2canvas from "html2canvas";

const RecordElement = React.forwardRef((_, ref) => {
  const [date, setDate] = useState(new Date().toISOString());
  const [random, setRandom] = useState(
    (Math.random() * 100).toString().replace(".", "")
  );

  useEffect(() => {
    const timer = setInterval(function () {
      setDate(new Date().toISOString());
      setRandom((Math.random() * 100).toString().replace(".", ""));
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  return (
    <div
      ref={ref}
      style={{
        border: "5px solid gray",
        borderRadius: "5px",
        padding: "20px",
        margin: "20px",
        width: "480px",
        height: "360px",
      }}
    >
      <input
        defaultValue="type something"
        style={{ width: "80%", fontSize: "16px" }}
      />
      <br />
      <br />
      <span id="timer">{date}</span>
      <br />
      <br />
      <span id="counter">{random}</span>
      <br />
      <br />
    </div>
  );
});

function App() {
  const [recStarted, setRecStarted] = useState(false);
  const [recStopped, setRecStopped] = useState(false);
  const [recorder, setRecorder] = useState(null);
  const canvasRef = useRef(null);
  const elementRef = useRef(null);
  const videoRef = useRef(null);
  const requestRef = useRef(null);

  useEffect(() => {
    const newRecorder = new RecordRTC(canvasRef.current, { type: "canvas" });
    setRecorder(newRecorder);
  }, []);

  const handleStart = () => {
    setRecStarted(true);
    setRecStopped(false);
    recorder.startRecording();
  };

  const handleStop = () => {
    recorder.stopRecording(() => {
      setRecStarted(false);
      setRecStopped(true);
      const blob = recorder.getBlob();
      const video = videoRef.current;
      const videoSrc = URL.createObjectURL(blob);
      console.log(videoSrc);
      video.src = videoSrc;
      video.parentNode.classList.remove("d-none");
      video.parentNode.classList.add("d-block");
    });
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const ele = elementRef.current;
    const ctx = canvas.getContext("2d");

    canvas.width = ele.clientWidth;
    canvas.height = ele.clientHeight;

    function looper() {
      if (!recStarted) {
        return setTimeout(looper, 500);
      }

      html2canvas(elementRef.current).then((newCanvas) => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(newCanvas, 0, 0, canvas.width, canvas.height);
        console.log("H2C");
        if (recStopped) {
          return;
        }

        requestRef.current = requestAnimationFrame(looper);
      });
    }

    if (recStarted) {
      requestRef.current = requestAnimationFrame(looper);
    }

    return () => {
      console.log("cancel frame", requestRef.current);
      cancelAnimationFrame(requestRef.current);
    };
  }, [recStarted, recStopped]);

  return (
    <div className="my-4">
      <div className="px-4">
        <button
          onClick={handleStart}
          disabled={recStarted}
          className="btn btn-primary"
        >
          Start
        </button>
        <button
          onClick={handleStop}
          disabled={!recStarted}
          className="btn btn-danger ms-3"
        >
          Stop
        </button>
      </div>
      <div className="m-3 p-3 border">
        <iframe
          ref={elementRef}
          src="http://localhost:8080/"
          style={{ width: "100%", height: "600px" }}
        ></iframe>
      </div>
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          bottom: "999999999999px",
          right: "9999999999999px",
        }}
      ></canvas>
      <hr />
      <div>
        <video controls autoPlay playsInline ref={videoRef}></video>
      </div>
    </div>
  );
}

export default App;
