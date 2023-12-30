"use client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState, useEffect, useCallback, Fragment } from "react";
import { Menu, Popover, Transition  } from "@headlessui/react";
import {botInteract, botUpdate, botDelete} from "./voiceflowController";
import useSpeechRecognition from "./speech";


//=============================Messaging======================================
export default function Landing() {

  const [inputValue, setInputValue] = useState("");
  const [chatMessages, setChatMessages] = useState([]);

  const {
    text,
    isListening,
    startListening,
    stopListening,
    resetText,
    hasRecognitionSupport,
} = useSpeechRecognition();

const handleKeyDown = (event) => {
  if (event.key === 'Enter') {
    // Trigger the click event on the submit button
    document.getElementById('submitButton').click();
  }
};

  

  const router = useRouter()
  let count = 1

  useEffect(() => {
    // Initialize the interaction when the component mounts
    if (count) {

      initializeInteraction();
    } 
    count--;
    
  }, []);

  const initializeInteraction = async () => {
    try {
      const initialMessages = await botInteract();
      console.log(initialMessages);
      // Use Promise.all to wait for all promises to resolve
      await Promise.all(initialMessages.map(async (message) => {
        // Process each message and add it to chatMessages
        setChatMessages((prevMessages) => [
          ...prevMessages,
          { type: "bot", text: message }
        ]);
      }));
    } catch (error) {
      console.error("Error initializing interaction:", error);
    }
  };

  const handleSendMessage = async () => {
    if (text.trim() !== ""){
      setChatMessages((prevChatMessages) => [
        ...prevChatMessages,
        { type: "user", text: text },
      ]) 
      try {
        // Send user input and get the bot's response
        const {list, intent} = await botUpdate(text);

        // Update state based on previous state using the functional form
        if (list){
          setChatMessages((prevChatMessages) => [
            ...prevChatMessages,
            ...list.map((message) => ({ type: "bot", text: message })),
          ]);
        }
        handleIntent(intent);
      } catch (error) {
        console.error("Error updating interaction:", error);
      }
      resetText();
  } else if (inputValue.trim() !== ""){
        setChatMessages((prevChatMessages) => [
          ...prevChatMessages,
          { type: "user", text: inputValue },
        ]) 
        try {
          // Send user input and get the bot's response
          const {list, intent} = await botUpdate(inputValue);
  
          // Update state based on previous state using the functional form
          if (list){
            setChatMessages((prevChatMessages) => [
              ...prevChatMessages,
              ...list.map((message) => ({ type: "bot", text: message })),
            ]);
          }
          handleIntent(intent);
        } catch (error) {
          console.error("Error updating interaction:", error);
        }
        setInputValue("");
    }


  };

  const handleIntent = (intent) => {
    switch (intent) {
      case 1:
        // Handle intent 1
        // wait for after upload button appears and successfully uploaded
        break;
      case 2:
        // Handle intent 2
        // wait for after public ID is input
        break;
      default:
        // Handle default intent
        break;
    }
    
  }  

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  }

  
  return (
      // <div>Hello from landing!</div>
      <>
      <div className="min-h-full bg-gray-50">
        <Popover as="header" className="bg-[#132143] pb-24">
          {({ open }) => (
            <>
              <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:max-w-7xl lg:px-8">
                <div className="relative flex items-center justify-center py-5 lg:justify-between">      
                  {/* Right section on desktop */}
                  <div className="hidden lg:ml-4 lg:flex lg:items-center lg:pr-0.5">
                    {/* Profile dropdown */}
                    <Menu as="div" className="relative ml-4 flex-shrink-0">
                      <div>
                        <Menu.Button className="relative flex rounded-full bg-white text-sm ring-2 ring-white ring-opacity-20 focus:outline-none focus:ring-opacity-100">
                          <span className="absolute -inset-1.5" />
                          <span className="sr-only">Open user menu</span>
                          <img className="h-12 w-12 rounded-full" src="/user.jpg" />
                        </Menu.Button>
                      </div>
                      <Transition
                        as={Fragment}
                        enter="transition ease-out duration-100"
                        enterFrom="transform opacity-0 scale-95"
                        enterTo="transform opacity-100 scale-100"
                        leave="transition ease-in duration-75"
                        leaveFrom="transform opacity-100 scale-100"
                        leaveTo="transform opacity-0 scale-95"
                      >
                        <Menu.Items className="absolute right-[-13px] z-10 mt-2 w-20 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none text-center">
                          <div className="py-1">
                            <form method="POST" action="#">
                              <Menu.Item>
                                {({ active }) => (
                                  <button
                                    type="submit"
                                    className="text-[#132143]">
                                    <Link href="/">Sign out</Link>
                                  </button>
                                )}
                              </Menu.Item>
                            </form>
                          </div>
                        </Menu.Items>
                      </Transition>
                    </Menu>
                  </div>
                </div>
                <div className="hidden border-t border-white border-opacity-20 py-5 lg:block">
                  <div className="grid grid-cols-3 items-center gap-8">
                    <div className="col-span-2">
                      <nav className="flex space-x-4"></nav>
                    </div>
                    <div>
                      <div className="mx-auto w-full max-w-md"></div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </Popover>
        <main className="-mt-24 pb-8">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:max-w-7xl lg:px-8">
            <h1 className="sr-only">Page title</h1>
            {/* Main 3 column grid */}
            <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-3 lg:gap-8">
              {/* Left column */}
              <div className="grid grid-cols-1 gap-4 lg:col-span-2">
                
              <div className="grid grid-cols-1 gap-4 lg:col-span-2">
                <section aria-labelledby="section-1-title">
                  <div className="overflow-hidden rounded-lg bg-white shadow">
                  <div className="p-6">
                  {/* Chatbot Interface */}
                  <div className="relative h-[67.72vh] w-full text-[#132143] no-scrollbar  overflow-y-auto">
                    {/* Chat messages */}
                    <div className="flex flex-col items-start space-y-2 ">
                      {chatMessages.map((message, index) => (
                        <div
                          key = {index} className={`flex items-start ${message.type === "user" ? "bg-gray-300 self-end" : "bg-blue-700"} p-2 rounded-lg max-w-full`}>
                            <p className={`${
                                  message.type === "bot"
                                    ? "text-white"
                                    : "text-black"
                                }`}>{message.text}</p>
                        </div>))
                      }
                      {/* Your "View NFT" button */}
                      <button className="rounded-full border border-blue-700 text-blue-700 p-1 mt-2">
                        Mint NFT
                      </button>
                      <button className="rounded-full border border-blue-700 text-blue-700 p-1 mt-2">
                        Sell NFT
                      </button>
                      <button className="rounded-full border border-blue-700 text-blue-700 p-1 mt-2">
                        View NFT
                      </button>
                    </div>
                  </div>

                  {/* Input bar and submit button */}
                      <div className="flex mt-4 relative">
                        <div className="relative flex-1">
                          <input
                            type="text"
                            value={inputValue || text}
                            onChange={handleInputChange}
                            onKeyDown={handleKeyDown}
                            className="border border-gray-300 p-2 rounded-l-lg focus:outline-none w-full"
                            placeholder="Type your message..."
                          />

                          <div className="absolute top-1/2 transform -translate-y-1/2 right-2">
                                                        
                            <img
                              onClick={startListening}
                              src="/mic.png"
                              alt="Start Listening"
                              className="cursor-pointer"
                              width={25}
                              style={{ padding: '5px' }}
                            />
                            
                          </div>
                        </div>

                        <button
                          id="submitButton"
                          type="button"
                          onClick={handleSendMessage}
                          className="bg-blue-700 text-white p-2 rounded-r-lg ml-2"
                        >
                          Submit
                        </button>
                      </div>
                    </div>
                  </div>

                </section>
              </div>
              </div>

              {/* Right column */}
              <div className="grid grid-cols-1 gap-4">
                <section aria-labelledby="section-2-title">
                  <div className="overflow-hidden rounded-lg bg-white shadow">
                    <div className="p-6">
                      <div className="h-[75vh] no-scrollbar">

                      <div className="flex w-full h-screen items-center justify-center bg-grey-lighter transform translate-y-[-15%]">
                        <label className="w-64 flex flex-col items-center px-4 py-6 bg-white text-blue rounded-lg shadow-lg tracking-wide uppercase border border-blue cursor-pointer hover:bg-blue hover:text-white">
                            <svg className="w-8 h-8" fill="#132143" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                <path d="M16.88 9.1A4 4 0 0 1 16 17H5a5 5 0 0 1-1-9.9V7a3 3 0 0 1 4.52-2.59A4.98 4.98 0 0 1 17 8c0 .38-.04.74-.12 1.1zM11 11h3l-4-4-4 4h3v3h2v-3z" />
                            </svg>
                            <span className="mt-2 text-base leading-normal text-[#132143]">Upload an Image</span>
                            <input type='file' className="hidden" />
                        </label>
                      </div>

                      </div>
                    </div>
                  </div>
                </section>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}