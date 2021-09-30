/* global io */


$(function() {
  var FADE_TIME = 150; // ms
  var TYPING_TIMER_LENGTH = 400; // ms
  var COLORS = [
    "#e21400",
    "#91580f",
    "#f8a700",
    "#f78b00",
    "#58dc00",
    "#287b00",
    "#a8f07a",
    "#4ae8c4",
    "#3b88eb",
    "#3824aa",
    "#a700ff",
    "#d300e7",
    "#C0C0C0",
    "#808080",
    "#FF0000",
    "#800000",
    "#FFFF00",
    "#808000",
    "#00FF00",
    "#008000",
    "#00FFFF",
    "#008080",
    "#0000FF",
    "#000080",
    "#FF00FF",
    "#800080"
  ];

  // Initialize variables
  var $window = $(window);
  var $usernameInput = $(".usernameInput"); // Input for username
  var $messages = $(".messages"); // Messages area
  var $inputMessage = $(".inputMessage"); // Input message input box

  var $loginPage = $(".login.page"); // The login page
  var $chatPage = $(".chat.page"); // The chatroom page

  // Prompt for setting a username
  var username;
  var connected = false;
  var typing = false;
  var lastTypingTime;
  var $currentInput = $usernameInput.focus();

  var socket = io();

  // Sets the client's username
  function setUsername() {
    username = cleanInput($usernameInput.val().trim());

    // If the username is valid
    if (username) {
      $loginPage.fadeOut();
      $chatPage.show();
      $loginPage.off("click");
      $currentInput = $inputMessage.focus();

      // Tell the server your username
      socket.emit("add user", username);
    }
    if (username == "shit") {
      $loginPage.fadeOut();
      username  = "whyyyyy";
      $chatPage.show();
      $loginPage.off("click");
      $currentInput = $inputMessage.focus();

      // Tell the server your username
      socket.emit("add user", username);
    }
    if (username == "fuck") {
      username = "E"; //                                                                                            WOW SAMY GOOD JOB / THANKS
      $loginPage.fadeOut();
      $chatPage.show();
      $loginPage.off("click");
      $currentInput = $inputMessage.focus();

      // Tell the server your username
      socket.emit("add user", username);
    }
    if (username == "fade") {
      FADE_TIME = 10000;
      $loginPage.fadeOut();
      $chatPage.show();
      $loginPage.off("click");
      $currentInput = $inputMessage.focus();

      // Tell the server your username
      socket.emit("add user", username);
    }
  }

  // Sends a chat message
  function sendMessage() {
    var message = $inputMessage.val();
    // Prevent markup from being injected into the message
    message = cleanInput(message);
    // if there is a non-empty message and a socket connection
    var ArrayOfMessages = message.split(" ");

    if (ArrayOfMessages.includes("/log")) {
      var newMessage = message.replace("/log", "");
      log(newMessage);
      message = "";
      $inputMessage.val("");
    }

    if (message && connected) {
      $inputMessage.val("");
      $('<span class="messageBody">').css("fount-weight", "normal");
      addChatMessage({
        username: username + ":",
        message: message
      });
      // tell server to execute 'new message' and send along one parameter

      socket.emit("new message", message);
    }
  }

  // Log a message
  function log(message, options) {
    var $el = $("<li>")
      .addClass("log")
      .text(message);
    addMessageElement($el, options);
  }

  // Adds the visual chat message to the message list
  function addChatMessage(data, options) {
    // Don't fade the message in if there is an 'X was typing'
    var $typingMessages = getTypingMessages(data);
    options = options || {};
    if ($typingMessages.length !== 0) {
      options.fade = false;
      $typingMessages.remove();
    }

    if (data.username.length > 25) {
      data.username = "shame on you";
    }
    
    // 
    if (data.message.length > 300) {
      var contunie = confirm(
        "This message is really long are you sure you would like to send it"
      );
      if (contunie == true) {
      } else {
        data.message = null;
      }
    }

    var ArrayOfMessages = data.message.split(" ");
    var ArrayOfChars = Array.from(data.message);
    var message = data.message;

    if (ArrayOfMessages.includes("/red")) {
      var message = message.replace("/red", "");
      data.message = message;
      var $messageBodyDiv = $('<span class="messageBody">')
        .css("color", "red")
        .text(data.message);
    }

    if (ArrayOfMessages.includes("/green")) {
      var message = message.replace("/green", "");
      data.message = message;
      var $messageBodyDiv = $('<span class="messageBody">')
        .css("color", "green")
        .text(data.message);
    }

    if (ArrayOfMessages.includes("/blue")) {
      var message = message.replace("/blue", "");
      data.message = message;
      var $messageBodyDiv = $('<span class="messageBody">')
        .css("color", "blue")
        .text(data.message);
    }

    if (
      ArrayOfChars.includes("(") &&
      ArrayOfChars.includes(")") &&
      ArrayOfChars.includes("#")
    ) {
      var newMessage = message.replace("(", "");
      newMessage = newMessage.replace(")", "");

      var newMessage0 = newMessage.split(" ");
      var colorForBody = newMessage0[0];

      var message = message.replace("(" + colorForBody + ")", "");
      data.message = message;

      console.log(data.message);
      console.log(colorForBody);
      var $messageBodyDiv = $('<span class="messageBody">')
        .css("color", colorForBody)
        .text(data.message);
    }

    if (
      !ArrayOfMessages.includes("/red") &&
      !ArrayOfMessages.includes("/green") &&
      !ArrayOfMessages.includes("/blue") &&
      !ArrayOfChars.includes("(") &&
      !ArrayOfChars.includes(")") &&
      !ArrayOfChars.includes("#")
    ) {
      var $messageBodyDiv = $('<span class="messageBody">').text(data.message);
    }

    var $usernameDiv = $('<span class="username"/>')
      .text(data.username)
      .css("color", getUsernameColor(data.username));

    var typingClass = data.typing ? "typing" : "";
    var $messageDiv = $('<li class="message"/>')
      .data("username", data.username)
      .addClass(typingClass)
      .append($usernameDiv, $messageBodyDiv);

    addMessageElement($messageDiv, options);
  }

  // Adds the visual chat typing message
  function addChatTyping(data) {
    data.typing = true;
    data.message = "is typing...";
    addChatMessage(data);
  }

  // Removes the visual chat typing message
  function removeChatTyping(data) {
    getTypingMessages(data).fadeOut(function() {
      $(this).remove();
    });
  }

  // Adds a message element to the messages and scrolls to the bottom
  // el - The element to add as a message
  // options.fade - If the element should fade-in (default = true)
  // options.prepend - If the element should prepend
  //   all other messages (default = false)
  function addMessageElement(el, options) {
    var $el = $(el);

    // Setup default options
    if (!options) {
      options = {};
    }
    if (typeof options.fade === "undefined") {
      options.fade = true;
    }
    if (typeof options.prepend === "undefined") {
      options.prepend = false;
    }

    // Apply options
    if (options.fade) {
      $el.hide().fadeIn(FADE_TIME);
    }
    if (options.prepend) {
      $messages.prepend($el);
    } else {
      $messages.append($el);
    }
    $messages[0].scrollTop = $messages[0].scrollHeight;
  }

  // Prevents input from having injected markup
  function cleanInput(input) {
    return $("<div/>")
      .text(input)
      .text();
  }

  // Updates the typing event
  function updateTyping() {
    if (connected) {
      if (!typing) {
        typing = true;
        socket.emit("typing");
      }
      lastTypingTime = new Date().getTime();

      setTimeout(function() {
        var typingTimer = new Date().getTime();
        var timeDiff = typingTimer - lastTypingTime;
        if (timeDiff >= TYPING_TIMER_LENGTH && typing) {
          socket.emit("stop typing");
          typing = false;
        }
      }, TYPING_TIMER_LENGTH);
    }
  }

  // Gets the 'X is typing' messages of a user
  function getTypingMessages(data) {
    return $(".typing.message").filter(function(i) {
      return $(this).data("username") === data.username;
    });
  }

  // Gets the color of a username through our hash function
  function getUsernameColor(username) {
    // Compute hash code
    var hash = 7;
    for (var i = 0; i < username.length; i++) {
      hash = username.charCodeAt(i) + (hash << 5) - hash;
    }

    var index = Math.abs(hash % COLORS.length);
    return COLORS[index];

    // Calculate color
  }

  // Keyboard events

  $window.keydown(function(event) {
    // Auto-focus the current input when a key is typed
    if (!(event.ctrlKey || event.metaKey || event.altKey)) {
      $currentInput.focus();
    }
    // When the client hits ENTER on their keyboard
    if (event.which === 13) {
      if (username) {
        sendMessage();
        socket.emit("geez stop typing");
        typing = false;
      } else {
        setUsername();
      }
    }
  });

  $inputMessage.on("input", function() {
    updateTyping();
  });

  // Click events

  // Focus input when clicking anywhere on login page
  $loginPage.click(function() {
    $currentInput.focus();
  });

  // Focus input when clicking on the message input's border
  $inputMessage.click(function() {
    $inputMessage.focus();
  });

  // Socket events

  // Whenever the server emits 'login', log the login message
  socket.on("login", function(data) {
    connected = true;
    // Display the welcome message
    var message = "Chat Room";
    log(message, {
      prepend: true
    });
    addParticipantsMessage(data);
  });

  // Whenever the server emits 'new message', update the chat body
  socket.on("new message", function(data) {
    addChatMessage(data);
  });

  // Whenever the server emits 'user joined', log it in the chat body
  socket.on("user joined", function(data) {
    log(data.username + " joined, yay");
    addParticipantsMessage(data);
  });

  // Whenever the server emits 'user left', log it in the chat body
  socket.on("user left", function(data) {
    log(data.username + " left :(");
    addParticipantsMessage(data);
    removeChatTyping(data);
  });

  // Whenever the server emits 'typing', show the typing message
  socket.on("typing", function(data) {
    addChatTyping(data);
  });

  // Whenever the server emits 'stop typing', kill the typing message
  socket.on("stop typing", function(data) {
    removeChatTyping(data);
  });
});

function openNav() {
  document.getElementById("myNav").style.width = "100%";
  
}

/* Close when someone clicks on the "x" symbol inside the overlay */
function closeNav() {
  document.getElementById("myNav").style.width = "0%";
}

function TermsFunction() {
  var x = document.getElementById("Credit");
  if (x.style.display === "none") {
    x.style.display = "block";
  } else {
    x.style.display = "none";
  }
}




