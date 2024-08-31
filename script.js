const typingForm = document.querySelector(".typing-form");
const chatList = document.querySelector(".chat-list");
const toogleThemeButton = document.querySelector("#toogle-theme-button");
const chatHistory = document.querySelector(".chatHistory");
const history = document.querySelector(".history");
const header = document.querySelector(".header");
const input = document.querySelector(".user-q");

let userMessage = null;

// user input focus then hide the header section

input.addEventListener("focus", () => {
  header.style.display = "none";
  history.style.display = "block";
});

// toggle theme button

// api config
const API_KEY = "AIzaSyA8BkBGJHr5cgogQFWyHXUtyvXWaZ5SmYg";
const API_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${API_KEY}`;

const createMessageElement = (content, ...classes) => {
  const messageElement = document.createElement("div");
  messageElement.classList.add("message", ...classes);
  messageElement.innerHTML = content;
  return messageElement;
};

const generateAPIresponse = async (incomingMessageDiv) => {
  const copymsg = document.querySelector(".copy-alert");
  const textElement = incomingMessageDiv.querySelector(".text"); //
  // send a post request to the api with the user
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [
              {
                text: userMessage,
              },
            ],
          },
        ],
      }),
    });
    const data = await response.json();
    const apiResponse = data?.candidates[0].content.parts[0].text;
    const apiResponseElement = createMessageElement(
      apiResponse,
      "api-response"
    );
    incomingMessageDiv.appendChild(apiResponseElement);

    //  api response for usermessage are save n local storage
    localStorage.setItem(
      "apiresponse",
      JSON.stringify([
        ...(JSON.parse(localStorage.getItem("apiresponse")) || []),
        { api: apiResponse, timestamp: new Date() },
      ])
    );

    // remove the loading- bar
    incomingMessageDiv.querySelector(".loading-indicator").remove();
    incomingMessageDiv.classList.remove(".loadingg");

    // copy icon
    const copyIcon = incomingMessageDiv.querySelector(
      ".material-symbols-outlined"
    );
    copyIcon.addEventListener("click", () => {
      navigator.clipboard.writeText(apiResponse);
      //    copymsg.innerHTML = "coppied"
      copymsg.style.display = "block";
      setTimeout(() => {
        copymsg.style.display = "none";
      }, 2000);
    });
  } catch (error) {
    console.log("Error generating api response: ", error);
  } finally {
    incomingMessageDiv.classList.remove(".loadingg");
  }
};

// show the loading animationwhile waiting for the api response
const showLoadingAnimation = () => {
  const htmll = `
        <div class="message-content">
                <img src="./ai.png" alt="user" class="avtar">
                <p class="text"></p>
    
            <div class="loading-indicator">
                <div class="loading-bar"></div>
                <div class="loading-bar"></div>
                <div class="loading-bar"></div>
                <div class="loading-bar"></div>
            </div>
        </div>
         <span class="icon material-symbols-outlined">content_copy</span>
       

`;

  const incomingMessageDiv = createMessageElement(
    htmll,
    "incoming",
    "loadingg"
  );
  chatList.appendChild(incomingMessageDiv);

  // generateaspiresponse
  generateAPIresponse(incomingMessageDiv);

  // copy data
};

function handleOutgoingChat() {
  userMessage = typingForm.querySelector("#user-input").value.trim();
  if (!userMessage) return; // exist if there is no message

  const html = `
      <div class="message-content">
       
            <img src="./user.png" alt="user" class="avtar">
            <p class="text">Lorem ipsum dolor, sit amet consectetur adipisicing elit. Nam sunt dignissimos quis est! Quia officia ex sunt earum delectus, voluptate vitae ducimus itaque similique praesentium nobis rem laboriosam, atque voluptatem.vhsdusdosdo</p>
        </div>
        `;
  const messageOutgoingDic = createMessageElement(html, "outgoing");
  messageOutgoingDic.querySelector(".text").innerText = userMessage;
  chatList.appendChild(messageOutgoingDic);

  //   save in local storage
  localStorage.setItem(
    "usermsg",
    JSON.stringify([
      ...(JSON.parse(localStorage.getItem("usermsg")) || []),
      { user: userMessage, timestamp: new Date() },
    ])
  );

  typingForm.reset(); // clear the input field

  //   automatically scroll
  chatList.scrollTo({ top: chatList.scrollHeight, behavior: "smooth" });

  setTimeout(() => {
    showLoadingAnimation();
  }, 2000); // simulate delay for incoming message
}

typingForm.addEventListener("submit", function (event) {
  event.preventDefault();

  handleOutgoingChat();
});

// hide the header class when user send the prompt

const sendBtn = document.querySelector("#send");

sendBtn.addEventListener("click", () => {
  document.querySelector(".header").classList.remove("hide");
});

// delet class list and display the header block
const deletBtn = document.querySelector("#delete");

deletBtn.addEventListener("click", () => {
  document.querySelector(".chat-list").innerHTML = " ";
  document.querySelector(".header").style.display = "block";
});

// toogleThemeButton

toogleThemeButton.addEventListener("click", () => {
  const isLightMode = document.body.classList.toggle("light_mode");
  localStorage.setItem("themecolor", isLightMode ? "light_mode" : "dark_mode");
  toogleThemeButton.innerText = isLightMode ? "dark_mode" : "light_mode";
});

// set theme color from local storage

const savedThemeColor = localStorage.getItem("themecolor");
if (savedThemeColor) {
  document.body.classList.add(savedThemeColor);
  toogleThemeButton.innerText =
    savedThemeColor === "light_mode" ? "dark_mode" : "light_mode";
}

// show the user and api history form the local storage

const userHistory = JSON.parse(localStorage.getItem("usermsg")) || [];
const apiHistory = JSON.parse(localStorage.getItem("apiresponse")) || [];

// display the userhistory and api history both index value are same in localstorage then is dispay

userHistory.forEach((msg, i) => {
  const html = `
        <br>
        <div class="message-contents outgng" style="display:flex;>
            <img src="./user.png" alt="user" class="avtar">
            <p class="text"> ${msg.user}</p>
          
        </div>
        `;
  const messageOutgoingDic = createMessageElement(html, "outgoing");
  messageOutgoingDic.querySelector(".text").innerText = msg.user;
  chatHistory.appendChild(messageOutgoingDic);

  if (apiHistory[i]) {
    const html = `
            <details>
          <Summary>answer</summary>
            <div class="message-content incomgng">
                <img src="./ai.png" alt="user" class="avtar">
                
                <p class="text">${apiHistory[i].api}</p>
            </div>
            
            </details<br>
            `;
    const messageIncomingDic = createMessageElement(html, "incoming");
    messageIncomingDic.querySelector(".text").innerText = apiHistory[i].api;
    chatHistory.appendChild(messageIncomingDic);
  }
});

// clear history

const clearHistoryBtn = document.querySelector(".delete");

// check if chat history is empty or not, if empty then hide the clear history button
if (chatHistory.children.length === 0) {
  let msg = document.querySelector(".msg");
  msg.innerText = "No chat history ";
  clearHistoryBtn.style.display = "none";
} else {
  clearHistoryBtn.style.display = "block";
}

// clear history from local storage

clearHistoryBtn.addEventListener("click", () => {
  localStorage.removeItem("usermsg");
  localStorage.removeItem("apiresponse");
  chatHistory.innerHTML = " ";
});

// pageload and hide history of page

window.addEventListener("DOMContentLoaded", () => {
  history.style.display = "none";
});
