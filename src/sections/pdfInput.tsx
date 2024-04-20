import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import CustomAlert from "./customAlert";
import { ChangeEvent, useState } from "react";
import { fetchOctoAI } from "../api";
import { countWords } from "../lib/utils";

// @ts-ignore
import pdfToText from "react-pdftotext";
import { Loader2 } from "lucide-react";

// AI API-Key
const { VITE_OCTOAI_TOKEN } = import.meta.env;

const PdfInput = () => {
  const [outputText, setOutputText] = useState("");
  const [isFetching, setIsFetching] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [pdfText, setPdfText] = useState("");

  const extractText = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) {
      console.error("No file selected");
      return;
    }

    const file = files[0];
    pdfToText(file)
      .then((text: string) => setPdfText(text))
      .catch(() => console.error("Failed to extract text from pdf"));
  };

  const handleClick = async (text: string) => {
    if (countWords(text) > 10000 || countWords(text) < 15) {
      setShowAlert(true);
      setOutputText("");
      return;
    }
    try {
      setIsFetching(true);
      setShowAlert(false);

      let summaryText = await fetchOctoAI(text, VITE_OCTOAI_TOKEN);
      setOutputText(summaryText);
    } catch (error) {
      console.error("Error fetching data:", error);
      setOutputText("Error occurred while fetching data.");
    } finally {
      setIsFetching(false);
    }
  };

  return (
    <>
      <Input
        type="file"
        className="sm:max-w-fit mt-4"
        accept="application/pdf"
        onChange={extractText}
      />
      <Button
        disabled={isFetching}
        className="max-w-fit mt-4 bg-indigo-600 hover:bg-indigo-700 text-white"
        onClick={() => handleClick(pdfText)}
      >
        {isFetching ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Summarizing ...
          </>
        ) : (
          "Summarize Text"
        )}
      </Button>

      {showAlert && <CustomAlert message="Please upload a PDF to summarize." />}

      {outputText && (
        <div className="bg-gray-100 rounded-md p-4 mt-4">
          <h2 className="text-xl font-bold mb-2 text-gray-600 ">Summary:</h2>
          <p className="text-gray-600 text-sl">{outputText}</p>
        </div>
      )}
    </>
  );
};

export default PdfInput;
