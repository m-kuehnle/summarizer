import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import CustomAlert from "./customAlert";
import { fetchOctoAI } from "../api";
import { useState } from "react";
import { BentoGrid, BentoGridItem } from "../components/ui/bento-grid";
import { text_examples } from "@/utils/constants";
import { Clipboard, ClipboardCheckIcon, Loader2 } from "lucide-react";
import { countWords } from "../lib/utils";
import { WORD_LIMIT_MAX, WORD_LIMIT_MIN } from "../utils/constants";

const { VITE_OCTOAI_TOKEN } = import.meta.env;

interface TextInputProps {
  example?: string;
}

const TextInput = ({ example }: TextInputProps) => {
  const [inputText, setInputText] = useState(example);
  const [showAlert, setShowAlert] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [outputText, setOutputText] = useState("");
  const [copyClipboardSuccess, setCopyClipboardSuccess] = useState(false);
  const [errorMessage, seterrorMessage] = useState("");

  const handleClick = async (text: string) => {
    if (!text) {
      setShowAlert(true);
      setOutputText("");
      seterrorMessage("Please enter a text to summarize.");
      return;
    }

    const wordCount = countWords(text);
    if (wordCount > WORD_LIMIT_MAX || wordCount < WORD_LIMIT_MIN) {
      setShowAlert(true);
      setOutputText("");
      seterrorMessage(
        `Please make sure the Text contains ${
          wordCount > WORD_LIMIT_MAX ? "at most" : "at least"
        } ${
          wordCount > WORD_LIMIT_MAX ? WORD_LIMIT_MAX : WORD_LIMIT_MIN
        } words.`
      );
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
      <div className=" hidden sm:block">
        <div>
          <h3 className="font-bold text-indigo-600 text-center mb-4">
            Try some examples
          </h3>
          <BentoGrid className="max-w-4xl mx-auto">
            {text_examples.map((item, i) => (
              <div key={i}>
                <BentoGridItem
                  title={item.title}
                  description={item.description}
                  header={
                    <img
                      src={item.header}
                      alt={item.title}
                      className="w-full h-32 object-cover rounded-xl"
                    />
                  }
                  className={i === 3 || i === 6 ? "md:col-span-2" : ""}
                  onClick={() => setInputText(item.example_text)}
                />
              </div>
            ))}
          </BentoGrid>
        </div>
      </div>

      <Textarea
        placeholder="Insert your text here..."
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        className="mt-4 text-gray-600 text-sm"
      />

      <Button
        disabled={isFetching}
        className="max-w-fit mt-4 bg-indigo-600 hover:bg-indigo-700 text-white"
        onClick={() => handleClick(inputText || "")}
      >
        {isFetching ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Summarizing ...
          </>
        ) : (
          "Summarize Text"
        )}
      </Button>

      {showAlert && (
        <div className="mt-[10px]">
          <CustomAlert message={errorMessage} />
        </div>
      )}

      {outputText && (
        <div className="bg-white dark:bg-background rounded-md p-4 mt-4">
          <h2 className="text-xl font-bold mb-2 text-gray-600 dark:text-white">
            Summary:
          </h2>
          <p className="text-gray-600 text-sl dark:text-white my-4">
            {outputText}
          </p>
          <Button
            variant="secondary"
            onClick={() => {
              navigator.clipboard.writeText(outputText);
              setCopyClipboardSuccess(true);
            }}
          >
            {!copyClipboardSuccess && (
              <>
                <Clipboard className="mr-2 h-4 w-4" />
                Copy to Clipboard
              </>
            )}
            {copyClipboardSuccess && (
              <>
                <ClipboardCheckIcon className="mr-2 h-4 w-4 text-emerald-500" />
                Successfully Copied
              </>
            )}
          </Button>
        </div>
      )}

      <div className="mt-8 block sm:hidden">
        <div>
          <h3 className="font-bold text-indigo-600 text-center mb-4">
            Try some examples
          </h3>
          <BentoGrid className="max-w-4xl mx-auto">
            {text_examples.map((item, i) => (
              <div key={i}>
                <BentoGridItem
                  title={item.title}
                  description={item.description}
                  header={
                    <img
                      src={item.header}
                      alt={item.title}
                      className="w-full h-32 object-cover rounded-xl"
                    />
                  }
                  className={i === 3 || i === 6 ? "md:col-span-2" : ""}
                  onClick={() => setInputText(item.example_text)}
                />
              </div>
            ))}
          </BentoGrid>
        </div>
      </div>
    </>
  );
};
export default TextInput;
