const apiKey = `VF.DM.658e044ad7bebc00071bbd11.IB2dwz97FYiDcAFH`; // Voiceflow API key
const userID = `11`; // Unique ID of the user interacting with the Voiceflow project
const versionID = `658df316ba0264c210ba3b7f`; // Unique ID of the Voiceflow project version to interact with


// POST: Interact
const botInteract = async () => {
    try {
      // clear userID to start
      await fetch(`https://general-runtime.voiceflow.com/state/${versionID}/user/${userID}`,
      {
        method: `DELETE`,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
          'Access-Control-Allow-Origin': '*',
      }});

      const response = await fetch(`https://general-runtime.voiceflow.com/state/${versionID}/user/${userID}/interact`,
      {
        method: `POST`,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
          'Access-Control-Allow-Origin': '*',
      }});
      const responseData = await response.json();
      let list = [];
      for (let i = 0; i < responseData.length; i++) {
        if (responseData[i].payload && responseData[i].payload.message) {
          list.push(responseData[i].payload.message)
        }
      }
      return list;
    } catch (error) {
      console.log(error)
    }
}
// PUT: Update 
const botUpdate = async (userInput) => {
  const requestBody = {
    action: {
      type: 'text',
      payload: userInput,
    },
  };
  try {
    const response = await fetch(`https://general-runtime.voiceflow.com/state/${versionID}/user/${userID}/interact`,
      {
        method: `POST`,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify(requestBody),
      });

    const responseData = await response.json();
    
    let list = [];
    for (let i = 0; i < responseData.length; i++) {
      if ( responseData[i].payload && responseData[i].payload.message) {
        list.push(responseData[i].payload.message)
      }
    }
    
    return list;
  } catch (error) {
    console.error('Error updating:', error.message || error);
  }
};


module.exports = {
  botInteract, 
  botUpdate
  }

;
