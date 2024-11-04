const { Configuration, OpenAIApi } = require("openai");
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Access your API key as an environment variable
const genAI = new GoogleGenerativeAI(process.env.API_KEY);
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
const chat = model.startChat({
  history: [
    {
      role: "user",
      parts: [{ text: "Hello" }],
    },
    {
      role: "model",
      parts: [{ text: "Great to meet you. What would you like to know?" }],
    },
  ],
});
async function getResponse(query) {
  // const response = await openai.createChatCompletion({
  //   model: "gpt-3.5-turbo",
  //   messages: [
  //     { role: "user", content: query }
  //   ],
  // });

  // return response.data.choices[0].message.content;
  let result = await chat.sendMessage(query);
  // console.log(result.response.text());
  return result.response.text();
}

module.exports = getResponse;
