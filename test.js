const axios = require("axios");

const test = async () => {
  const options = {
    method: "GET",
    url: "https://images.ctfassets.net",
  };

  try {
    const response = await axios.request(options);
    console.log(response.data);
  } catch (error) {
    console.error(error);
  }
};

test();
