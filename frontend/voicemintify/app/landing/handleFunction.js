const handleFunction = async (intent, inputValue) => {
    switch (intent) {
      case 0:
        return inputValue === "walletid" ? "yes" : "no";
      case 2:
          console.log("Opening link in new tab");
        // Open the link in a new tab
        window.open("https://google.com", "_blank");
        return "yes";
      case 3:
        return;
      default:
        return inputValue;
    }
  };
  
  export default handleFunction;
  