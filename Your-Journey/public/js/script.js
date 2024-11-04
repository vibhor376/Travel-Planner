const sendButton = document.getElementById("submitButton");
const chatbox = document.getElementById("chatbox");

const travelModeToggle = document.getElementById("travelModeToggle");
const tripTypeToggle = document.getElementById("tripTypeToggle");
const companionTypeToggle = document.getElementById("companionTypeToggle");
const stayTypeToggle = document.getElementById("stayTypeToggle");
const restaurantTypeToggle = document.getElementById("restaurantTypeToggle");

const travelModeObj = document.getElementById("travelMode");
const tripTypeObj = document.getElementById("tripType");
const companionTypeObj = document.getElementById("companionType");
const stayTypeObj = document.getElementById("stayType");
const restaurantTypeObj = document.getElementById("restaurantType");

const addBtn = document.getElementById("addbtn");
const chatHistory = document.getElementById("chat-history");


/*****************************************  Options Toggle  *****************************************/



travelModeToggle.addEventListener("click", async () => {
   if (travelModeToggle.children[0].style.transform == "")
      travelModeToggle.children[0].style.transform = "rotate(90deg)";
   else
      travelModeToggle.children[0].style.transform = "";

   travelModeObj.style.display == 'none' ?
      travelModeObj.style.display = 'flex' : travelModeObj.style.display = 'none';

   const checkedElement = document.querySelector("input[name='transportation']:checked");
   if (checkedElement) checkedElement.checked = false;
});


tripTypeToggle.addEventListener("click", async () => {
   if (tripTypeToggle.children[0].style.transform == "")
      tripTypeToggle.children[0].style.transform = "rotate(90deg)";
   else
      tripTypeToggle.children[0].style.transform = "";

   tripTypeObj.style.display == 'none' ?
      tripTypeObj.style.display = 'flex' : tripTypeObj.style.display = 'none';

   const checkedElement = document.querySelector("input[name='typeOfTrip']:checked");
   if (checkedElement) checkedElement.checked = false;
});


companionTypeToggle.addEventListener("click", async () => {
   if (companionTypeToggle.children[0].style.transform == "")
      companionTypeToggle.children[0].style.transform = "rotate(90deg)";
   else
      companionTypeToggle.children[0].style.transform = "";

   companionTypeObj.style.display == 'none' ?
      companionTypeObj.style.display = 'flex' : companionTypeObj.style.display = 'none';

   const checkedElement = document.querySelector("input[name='typeOfCompanion']:checked");
   if (checkedElement) checkedElement.checked = false;
});


stayTypeToggle.addEventListener("click", async () => {
   if (stayTypeToggle.children[0].style.transform == "")
      stayTypeToggle.children[0].style.transform = "rotate(90deg)";
   else
      stayTypeToggle.children[0].style.transform = "";

   stayTypeObj.style.display == 'none' ?
      stayTypeObj.style.display = 'flex' : stayTypeObj.style.display = 'none';

   const checkedElement = document.querySelector("input[name='typeOfStay']:checked");
   if (checkedElement) checkedElement.checked = false;

});


restaurantTypeToggle.addEventListener("click", async () => {
   if (restaurantTypeToggle.children[0].style.transform == "")
      restaurantTypeToggle.children[0].style.transform = "rotate(90deg)";
   else
      restaurantTypeToggle.children[0].style.transform = "";

   restaurantTypeObj.style.display == 'none' ?
      restaurantTypeObj.style.display = 'flex' : restaurantTypeObj.style.display = 'none';

   const checkedElement = document.querySelector("input[name='typeOfRestaurant']:checked");
   if (checkedElement) checkedElement.checked = false;
});



/*******************************************   CAPTCHA   *******************************************/



submitRecaptchaForm = async () => {
   const captcha = document.querySelector('#g-recaptcha-response').value;
   let response;

   await fetch('/checkHuman', {
      method: 'POST',
      headers: { 'Content-type': 'application/json' },
      body: JSON.stringify({ captcha })
   }).then(res => res.json())
      .then(data => {
         response = data;
         if (!data.success) {
            grecaptcha.reset();
            alert("Captcha Failed.");
         }
      });

   return response;
};



/*******************************************  Send Button  *******************************************/



sendButton.addEventListener("click", async () => {
   let userInput = document.getElementById("userInput").value;

   const recaptchaResponse = grecaptcha.getResponse();

   if (recaptchaResponse === "") {
      alert("Please Complete the reCAPTCHA.");
      return;
   }

   const captchaResponse = await submitRecaptchaForm();
   console.log(captchaResponse);

   if (captchaResponse.success === false) {
      alert(captchaResponse.message);
      return;
   }

   // Checking for null input
   if (userInput === "") {
      // alert("Please provide some query!");
      // return;
      userInput = "Plan a trip from Sri lanka to South Hampton for 3 days";
   }

   // Disabling Buttons
   sendButton.disabled = true;
   addBtn.disabled = true;
   Array.from(document.getElementsByClassName("chats")).forEach(chat => {
      chat.disabled = true;
   });

   if (document.getElementById("close-suggestions")) {
      chatbox.lastElementChild.remove();
   }

   if (chat1.children[0].children[0].children[1].innerHTML.trim() === "New Chat")
      chat1.children[0].children[0].children[1].innerHTML = userInput;


   // Collecting all the values of options
   document.getElementById("userInput").value = "";

   let travelMode = document.querySelector("input[name='transportation']:checked");
   let tripType = document.querySelector("input[name='typeOfTrip']:checked");
   let companionType = document.querySelector("input[name='typeOfCompanion']:checked");
   let stayType = document.querySelector("input[name='typeOfStay']:checked");
   let restaurantType = document.querySelector("input[name='typeOfRestaurant']:checked");

   travelMode = travelMode ? travelMode.value : "";
   tripType = tripType ? tripType.value : "";
   companionType = companionType ? companionType.value : "";
   stayType = stayType ? stayType.value : "";
   restaurantType = restaurantType ? restaurantType.value : "";

   const options = {
      "travelMode": travelMode, "tripType": tripType, "companionType": companionType,
      "stayType": stayType, "restaurantType": restaurantType
   };

   // Inserting user query in chat box
   chatbox.insertAdjacentHTML('beforeend', createUserMessageTime(userInput));
   chatbox.insertAdjacentHTML('beforeend', createResponseMessageTime("Loading..."));

   chatbox.scrollTo({ top: chatbox.scrollHeight, left: 0, behavior: "smooth" });


   // Get the response and populate it!
   const result = await postData("/api", { "userInput": userInput, "chatNum": lastChat.id, options });

   chatbox.lastElementChild.remove();
   chatbox.insertAdjacentHTML('beforeend', createResponseMessageTime(result.response));


   // Adding Suggestions Box

   // if (restaurantType === "" || stayType !== "Hotel") {
   //    chatbox.insertAdjacentHTML('beforeend', createSuggestionsBox(result.response));

   //    document.getElementById("close-suggestions").addEventListener("click", () => {
   //       chatbox.lastElementChild.remove();
   //    });

   //    document.getElementById("restaurants-suggestions").addEventListener("click", () => {
   //       console.log("restaurants");
   //    });

   //    document.getElementById("hotels-suggestions").addEventListener("click", () => {
   //       console.log("hotels");
   //    });
   // }


   if (result.response === "The above query is not a travel related query!")
      chat1.children[0].children[0].children[1].innerHTML = "New Chat";

   console.log(result);

   // Enabling Buttons
   sendButton.disabled = false;
   addBtn.disabled = false;
   Array.from(document.getElementsByClassName("chats")).forEach(chat => { chat.disabled = false; });
   grecaptcha.reset();
   updatePopover();
});



/*********************************************  Change chats  *********************************************/


let lastChat = document.getElementById("chat1");

selectChat = (currentChat) => {
   if (lastChat == currentChat) return;
   lastChat.classList.remove("active", "text-white");
   lastChat.classList.add("list-group-item-light");
   currentChat.classList.remove("list-group-item-light");
   currentChat.classList.add("active", "text-white");
};


loadChats = async (currentChat) => {
   if (currentChat == lastChat) return;
   lastChat = currentChat;
   const reponse = await postData("/getChats", { "chatNum": currentChat.id });
   const chats = reponse["chats"];
   const welcome = reponse["welcome"];

   while (chatbox.childNodes.length > 3) {
      chatbox.removeChild(chatbox.lastChild);
   }

   if (welcome.length === 0) {
      chatbox.insertAdjacentHTML('beforeend', createResponseMessageTime(welcomeText));
      return;
   }

   chatbox.insertAdjacentHTML('beforeend', createResponseMessage(welcomeText, welcome[0], welcome[1]));

   chats.forEach((chat) => {
      chatbox.insertAdjacentHTML('beforeend', createUserMessage(chat[0], chat[2], chat[3]));
      chatbox.insertAdjacentHTML('beforeend', createResponseMessage(chat[1], chat[2], chat[3]));
   });

};


Array.from(document.getElementsByClassName("chats")).forEach(chat => {
   chat.addEventListener("click", async () => {
      selectChat(chat);
      loadChats(chat);
   });
});



/*******************************************  Add Button  *******************************************/



// POPOVER
let popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
let popoverList = [];

function updatePopover() {
   popoverList.forEach(function (popover) {
      popover.dispose(); // Remove existing popover
   });

   popoverList = popoverTriggerList.map(function (popoverTriggerEl) {
      let popoverOptions = {};

      // Add your conditions here
      if (chatbox.childElementCount === 1 && chatHistory.childElementCount <= 5) {
         popoverOptions = {
            trigger: 'focus',
            placement: 'bottom',
            content: 'Chat 1 is Empty'
         };
      } else {
         popoverOptions = {
            trigger: 'manual' // Disable popover trigger
         };
      }

      return new bootstrap.Popover(popoverTriggerEl, popoverOptions);
   });
}

updatePopover();


addBtn.addEventListener("click", async () => {
   if (document.getElementById("chat1").children[0].children[0].children[1].innerHTML.trim() === "New Chat") {
      return;
   }

   if (chatHistory.childElementCount == 5) {
      if (confirm("Adding new chat will result in removal of last chat. Do you wish to continue?"))
         chatHistory.children[chatHistory.childElementCount - 1].remove();
      else
         return;
   }

   addBtn.disabled = true;

   chatHistory.insertAdjacentHTML('afterbegin', createChatHistory());

   for (let i = 0; i < chatHistory.childElementCount; i++) {
      chatHistory.children[i].id = "chat" + String(i + 1);
      chatHistory.children[i].children[0].children[0].children[0].children[0].textContent = "Chat " + String(i + 1);
   }


   const chat1 = document.getElementById("chat1");
   selectChat(chat1);
   lastChat = chat1;
   chat1.addEventListener("click", async () => {
      selectChat(chat1);
      loadChats(chat1);
   });


   while (chatbox.childNodes.length > 3) {
      chatbox.removeChild(chatbox.lastChild);
   }

   chatbox.insertAdjacentHTML('beforeend', createResponseMessageTime(welcomeText));

   const response = await postData("/addChats", {});
   console.log(response);

   addBtn.disabled = false;
   updatePopover();

});



/******************************************  Send Mail  ******************************************/



const mailModal = document.getElementById('mailModal');
const mailInput = document.getElementById('mailInput');
const mailModalBody = document.getElementById('mailModalBody');

mailModal.addEventListener('shown.bs.modal', () => {
   mailInput.focus();
});

document.getElementById("mailIcon").addEventListener("click", async () => {
   const chats = '<div class="bg-white px-3 py-4 rounded-lg">' + chatbox.innerHTML + '</div>';

   mailModalBody.innerHTML = chats;

});

document.getElementById("sendMail").addEventListener("click", async () => {
   chatbox.classList.add("rounded-lg");

   const reponse = await postData("/sendMail", { "chatbox": (chatbox.outerHTML) });
   chatbox.classList.remove("rounded-lg");

   alert(reponse);

});



/*****************************************  Utility Functions  *****************************************/


getTime = () => {
   const now = new Date();
   const date = now.getDate();
   const time = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
   const month = now.toLocaleString("default", { month: "short" });

   return { date, time, month };
};


createUserMessageTime = (userInput) => {
   const { date, time, month } = getTime();

   return `<div class="media w-50 ms-auto mb-3">
            <div class="media-body">
              <div class="sendMessage rounded py-2 px-3 mb-2">
                <p class="mb-0 text-white">${userInput}</p>
              </div>
              <p class="date small text-muted">${time} | ${month} ${date}</p>
            </div>
          </div>`;
};


createUserMessage = (userInput, time, date) => {
   return `<div class="media w-50 ms-auto mb-3">
            <div class="media-body">
              <div class="sendMessage rounded py-2 px-3 mb-2">
                <p class="mb-0 text-white">${userInput}</p>
              </div>
              <p class="date small text-muted">${time} | ${date}</p>
            </div>
          </div>`;
};


createResponseMessageTime = (response) => {
   const { date, time, month } = getTime();

   return `<div class="media w-75 mb-3">
            <img src="images/chatbot.png" alt="user" width="50" class="rounded-circle">
            <div class="media-body ms-3">
              <div class="bg-light rounded py-2 px-3 mb-2">
                <p class="mb-0">${response}</p>
              </div>
              <p class="date small text-muted">${time} | ${month} ${date}</p>
            </div>
          </div>`;
};


createResponseMessage = (response, time, date) => {
   return `<div class="media w-75 mb-3">
            <img src="images/chatbot.png" alt="user" width="50" class="rounded-circle">
            <div class="media-body ms-3">
              <div class="bg-light rounded py-2 px-3 mb-2">
                <p class="mb-0">${response}</p>
              </div>
              <p class="date small text-muted">${time} | ${date}</p>
            </div>
          </div>`;
};


createChatHistory = () => {
   return `<a id="chat1"
            class="chats list-group-item list-group-item-action active text-white rounded-0">
            <div class="media">
              <div class="media-body ms-2">
                  <div class="d-flex align-items-center justify-content-between mb-1">
                    <h6 class="mb-0">Chat 1</h6><small
                        class="date small font-weight-bold">${"Just Now"}</small>
                  </div>
                  <p class="font-italic mb-0 text-small">${"New Chat"}</p>
              </div>
            </div>
          </a>`;
};


createSuggestionsBox = () => {

   return `<div id="suggestions-box" style="display:flex; justify-content:center;">
               <div class="rounded-lg pt-1 px-2 pb-3" style="border: solid lightgray; display: inline-block;">

                  <div style="display:flex;">
                     <p class="date small text-muted mt-3 mx-3">Do you also want to get some suggestions on?</p>
                     <div id="close-suggestions">
                        <i class="fi fi-rr-cross-small"></i>
                     </div>
                  </div>   
               
                  <div style="display:flex; justify-content:center;">
                     <button id="restaurants-suggestions" class="btn btn-primary m-1"> Restaurants </button>
                     <button id="hotels-suggestions" class="btn btn-primary m-1"> Hotels </button>
                  </div>
               </div>
            </div>
         `;

};


const welcomeText = `Hey There, I'm your AI Travel Planner, you can ask me any travel related query.
                      Also on your right you can see various options for which helps me to better
                      formulate my output (Minimize in case of not needed). Go Ahead, Ask me something!`;




/***********************************  POST method implementation  ***********************************/


async function postData(url = "", data = {}) {
   const response = await fetch(url, {
      method: "POST", headers: {
         "Content-Type": "application/json",
      }, body: JSON.stringify(data),
   });
   return response.json();
}
