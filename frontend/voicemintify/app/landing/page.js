"use client"
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState, useEffect, Fragment } from "react";
import { Menu, Popover, Transition  } from "@headlessui/react";
import {botInteract, botUpdate} from "./voiceflowController";
import useSpeechRecognition from "./speech";
export default function Landing() {
  
  const [inputValue, setInputValue] = useState("");
  const [chatMessages, setChatMessages] = useState([]);
  const [intent, setIntent] = useState(0);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [sellerID, setSellerID] = useState("");
  const [privateKey, setPrivateKey] = useState("");
  const [buyerID, setBuyerID] = useState("");
  // const [tokenID, setTokenID] = useState("");

  

  const handleFileChange = async (event) => {

    const file = event.target.files[0];
    // Display a preview of the selected image
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
      console.log("Uploading file:", selectedFile);

      // Example data for the mintNFT request
      const mintNFTData = {
        id: 'QmSPr4ZSibpZqvx7KGdjEMZszMZVb4mHXqNB2GsmHeMk3B',
        sellerId: sellerID,
        privateKey: privateKey
      };
      let tokenID = '';
      // Making the POST request
      await fetch("http://localhost:3500/mintNFT", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(mintNFTData),
      })
        .then(response => response.json())
        .then(result => {
          tokenID = result;
        })
        .catch(error => {
          console.error('Error making POST request:', error);
        });
      handleAll("yes")
      setChatMessages((prevMessages) => [
        ...prevMessages,
        { type: "bot", text: "Your TOKEN ID: "+ tokenID },]
        );
    } else {
      setPreviewImage(null);
      console.log("No file selected");
    }
    setSelectedFile(file);
  };

  const handleUpload = async () => {}
  //   // Add your file upload logic here
  //   if (selectedFile) {
  //     console.log("Uploading file:", selectedFile);

  //     // Call Marshal's botUpdate2 and pass in the CID
  //     console.log("===========================================")
  //     // api call

  //     // Example data for the mintNFT request
  //     const mintNFTData = {
  //       id: 'QmUQd912vbHPrzZhurf7P3Q6NPZZnnxo5gGDg5yimYGjwz',
  //       sellerId: '0.0.6861612',
  //       privateKey: '302e020100300506032b6570042204204b7a717128838c016055c65ea5edcdbe60a09dfc5dff1b2e552f34492940baea'
  //     };
  //     let tokenID = '';
  //     // Making the POST request
  //     await fetch("http://localhost:3500/mintNFT", {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify(mintNFTData),
  //     })
  //       .then(response => response.json())
  //       .then(result => {
  //         tokenID = result.tokenId;
  //       })
  //       .catch(error => {
  //         console.error('Error making POST request:', error);
  //       });
  //       console.log("===========================================")
  //       console.log(tokenID)
  //       console.log("===========================================")
  //     handleAll("yes")
  //     setChatMessages((prevMessages) => [
  //       ...prevMessages,
  //       { type: "bot", text: "Your TOKEN ID: "+ tokenID },]
  //       );
  //     // Reset selected file and preview after upload (if needed)
  //     setSelectedFile(null);
  //     setPreviewImage(null);
  //   } else {
  //     console.log("No file selected");
  //   }
  // };

  
  
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
      // Use Promise.all to wait for all promises to resolve
      await Promise.all(initialMessages.map(async (message) => {
        // Process each message and add it to chatMessages
        setChatMessages((prevMessages) => [
          ...prevMessages,
          { type: "bot", text: message.slice(0,-1) }
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
        const list = await botUpdate(text);

        // Update state based on previous state using the functional form
        if (list){
          setChatMessages((prevChatMessages) => [
            ...prevChatMessages,
            ...list.map((message) => ({ type: "bot", text: message.slice(0,-1) })),
          ]);
        }
      } catch (error) {
        console.error("Error updating interaction:", error);
      }
      resetText();
  } else if (inputValue.trim() !== ""){
        setChatMessages((prevChatMessages) => [
          ...prevChatMessages,
          { type: "user", text: inputValue },
        ]) 
        if (intent === 4){
          setBuyerID(inputValue)
          // Example data for the mintNFT request
          const sellNFTData = {
            sellerId: sellerID,
            sellerKey: privateKey,
            buyerId: buyerID
          };
          // Making the POST request
          await fetch("http://localhost:3500/sellNFT", {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(sellNFTData),
          });
          handleAll("yes")
            } else if (intent === 3){
              console.log("provide link")
              handleAll("yes")
            } else if (intent === 0){
              const newInputValue = await handleVerifyWalletId(intent, inputValue);
              handleAll(newInputValue)
            }
            setInputValue("");
          }
  };

  const handleInputChange = (e) => {

    setInputValue(e.target.value);
  }

  //===============================================================================================================================
  const handleVerifyWalletId = async (intent, inputValue) => {
    if (intent === 0){
      setSellerID(inputValue.slice(0,11));
      setPrivateKey(inputValue.slice(12,inputValue.length));
      return "yes";
    }
    return inputValue
  }

  useEffect(() => {
    console.log("Seller ID:", sellerID);
    console.log("Private Key:", privateKey);
    console.log("Buyer ID:", buyerID);
  }, [sellerID, privateKey, buyerID]);

  const handleViewWallet = async () => {
    window.open("https://wallet.hashpack.app/");
    handleAll("yes");
  }

  const handleFacialRecognition = async () => {
    // Open the new window
    window.open("http://127.0.0.1:4000/video_feed", "_blank");
    handleAll("yes");
  }
  
  const handleMint = async () => {
    handleAll("I want to mint my art.");
  }

  const handleWallet = async () => {
    handleAll("I want to see my wallet.");
  }

  const handleSell = async () => {
    handleAll("I want to sell this work to someone!")
  }
  
  const handleBye = async () => {
    handleAll("Bye bye")
  }

  const handleAll = async (input) => {
    try {
      // Send user input and get the bot's response
      const list = await botUpdate(input);
      // Update state based on previous state using the functional form
      if (list){
        setChatMessages((prevChatMessages) => [
          ...prevChatMessages,
          ...list.map((message) => ({ type: "bot", text: message.slice(0,-1) })),
        ]);
      }
      setIntent(parseInt(list[list.length - 1].charAt(list[list.length - 1].length - 1)));
    } catch (error) {
      console.error("Error updating interaction:", error);
    }
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
                          <img className="h-12 w-12 rounded-full" src="/user.png" />
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
                          key = {index} className={`flex items-start ${message.type === "user" ? "bg-gray-300 self-end" : "bg-blue-700"} p-2 rounded-lg max-w-[350px]`}>
                            <p
                              className={`${
                              message.type === "bot" ? "text-white" : "text-black"
                              } overflow-hidden break-words max-w-full`}
                              >
                              {message.text}
                            </p>
                        </div>))
                      }
                      {/* Conditional rendering of buttons */}
                      {(intent === 5 || intent === 1 || intent == 3) && (
                        <div className="mt-2">
                          {intent === 1 && 
                            <button onClick={handleFacialRecognition} className="text-xs rounded-full border border-blue-700 text-blue-700 p-1">
                              Face Recognition
                            </button>}
                          {intent === 3 && 
                            <button onClick={handleViewWallet} className="text-xs rounded-full border border-blue-700 text-blue-700 p-1 flex items-center">
                              Link to Wallet!
                            <img src="exLink.png" alt="Icon" className="ml-1" width={12} style={{ padding: '1px' }} />
                          </button>
                          
                          }

                          {intent === 5 &&
                            <>
                            <button onClick={handleMint} className="text-xs rounded-full border border-blue-700 text-blue-700 p-1 mr-1">
                              Mint NFT
                            </button>
                            <button onClick={handleWallet} className="text-xs rounded-full border border-blue-700 text-blue-700 p-1 mr-1">
                              View Wallet
                            </button>
                            <button onClick={handleSell} className="text-xs rounded-full border border-blue-700 text-blue-700 p-1 mr-1">
                              Sell NFT
                            </button>
                            <button onClick={handleBye} className="text-xs rounded-full border border-blue-700 text-blue-700 p-1 mr-1">
                              Nope
                            </button>
                            </>
                          }
                          
                          
                        </div>
                      )}

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
                        {previewImage && (
                          <div className="absolute z-3 w-50 h-50">
                            <img src={previewImage} alt="Selected Preview" style={{ maxWidth: '100%', maxHeight: '200px', position: 'relative', left: '50%' }} />
                          </div>
                        )}

                        <div className="flex w-full h-screen items-center justify-center bg-grey-lighter transform translate-y-[15%]" onClick={handleUpload}>
                          <label className="w-64 flex flex-col items-center px-4 py-6 bg-white text-blue rounded-lg shadow-lg tracking-wide uppercase border border-blue cursor-pointer hover:bg-blue hover:text-white">
                              <svg className="w-8 h-8" fill="#132143" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                  <path d="M16.88 9.1A4 4 0 0 1 16 17H5a5 5 0 0 1-1-9.9V7a3 3 0 0 1 4.52-2.59A4.98 4.98 0 0 1 17 8c0 .38-.04.74-.12 1.1zM11 11h3l-4-4-4 4h3v3h2v-3z" />
                              </svg>
                              <span className="mt-2 text-base leading-normal text-[#132143]">Upload a File</span>
                              <input type='file' className="hidden" onChange={handleFileChange}/>
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

