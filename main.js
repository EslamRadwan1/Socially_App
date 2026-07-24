import { showUserData, getUser } from "./profile.js";

export const baseUrl = "https://tarmeezacademy.com/api/v1";
let currentPage = 1;
const navBtns = document.getElementById("buttons");
let mainLoginBtn;
let createPostBtn;
const postsArea = document.getElementById("content-area");

setupUI();
if (!window.location.pathname.includes("profile.html")) {
  getPosts();
}

async function getPosts() {
  try {
    toggleLoader(true);
    const response = await fetch(
      `${baseUrl}/posts?limit=50&page=${currentPage}`,
    );
    if (!response.ok) {
      showAlert("Request Failed", "bg-red-500/80");
      throw new Error("Request Failed");
    }
    toggleLoader(false);
    const postsResponse = await response.json();
    const posts = postsResponse.data;
    for (let post of posts) {
      showPost(post);
    }
    const nextPage = postsResponse.links.next;
    if (nextPage !== null) {
      window.addEventListener("scroll", handleInfinityScroll);
    } else {
      window.removeEventListener("scroll", handleInfinityScroll);
    }
  } catch (err) {
    console.log(err);
  }
}
function showPost(postObj) {
  const post = document.createElement("div");
  post.className = "post";
  post.dataset.id = postObj.id;
  post.dataset.user = postObj.author.id;

  const header = document.createElement("div");
  header.className = "header";
  const userImg = document.createElement("img");
  userImg.className = "header-img";
  userImg.alt = "User Image";
  if (Object.keys(postObj.author.profile_image).length === 0) {
    userImg.src =
      "https://media.istockphoto.com/id/1495088043/vector/user-profile-icon-avatar-or-person-icon-profile-picture-portrait-symbol-default-portrait.jpg?s=612x612&w=0&k=20&c=dhV2p1JwmloBTOaGAtaA3AW1KSnjsdMt7-U_3EZElZ0=";
  } else {
    userImg.src = postObj.author.profile_image;
  }
  userImg.addEventListener("click", () => {
    userClicked(postObj.author.id);
  });
  const info = document.createElement("div");
  const userNameDiv = document.createElement("div");
  const userName = document.createTextNode(postObj.author.name);
  userNameDiv.className = "name";
  userNameDiv.append(userName);
  const postTimeDiv = document.createElement("div");
  const postTime = document.createTextNode(postObj.created_at);
  postTimeDiv.className = "time";
  postTimeDiv.append(postTime);
  info.append(userNameDiv, postTimeDiv);
  header.append(userImg, info);
  userNameDiv.addEventListener("click", () => {
    userClicked(postObj.author.id);
  });

  const body = document.createElement("div");
  body.className = "body";

  if (Object.keys(postObj.image).length !== 0) {
    const bodyImg = document.createElement("img");
    bodyImg.className = "body-img";
    bodyImg.src = postObj.image;
    bodyImg.alt = "Post Image";
    bodyImg.draggable = false;
    body.append(bodyImg);

    bodyImg.addEventListener("click", () => {
      showImage(postObj.image);
      // console.log(postObj.image.match(/([^\/]+)\.([a-zA-Z0-9]+)$/g)[0]);
    });
  }
  const bodyTitle = document.createElement("h5");
  bodyTitle.className = "body-title";
  const bodyTitleText = document.createTextNode(
    postObj.title === null ? "" : postObj.title,
  );
  bodyTitle.append(bodyTitleText);
  const bodyParagraph = document.createElement("p");
  bodyParagraph.className = "body-text";
  const bodyParagraphText = document.createTextNode(postObj.body);
  bodyParagraph.append(bodyParagraphText);
  body.append(bodyTitle, bodyParagraph);

  const footer = document.createElement("div");
  footer.className = "footer";

  const commentDiv = document.createElement("div");
  commentDiv.className = "comments";
  const cIcon = document.createElement("i");
  cIcon.classList.add("fa-light", "fa-comment");
  const commentSpan = document.createElement("span");
  const commentCount = document.createTextNode(postObj.comments_count);
  commentSpan.append(commentCount);
  commentDiv.append(cIcon, commentSpan, "Comments");
  commentDiv.addEventListener("click", function () {
    showComments(post.dataset.id);
  });

  const tagsDiv = document.createElement("div");
  tagsDiv.className = "tags";
  for (let i = 0; i < postObj.tags.length; i++) {
    const tag = document.createElement("span");
    const tagName = document.createTextNode(`#${postObj.tags[i].name}`);
    tag.append(tagName);
    tagsDiv.append(tag);
  }
  footer.append(commentDiv, tagsDiv);

  const commentsContainer = document.createElement("div");
  commentsContainer.classList.add("post-comments");
  commentsContainer.id = postObj.id;
  commentsContainer.dataset.comments = postObj.comments_count;

  post.append(header, body, footer, commentsContainer);
  postsArea.append(post);
}
function loginForm() {
  document.body.style.overflow = "hidden";
  const overlay = document.createElement("div");
  overlay.classList.add(
    "overlay",
    "fixed",
    "top-0",
    "left-0",
    "z-9999",
    "bg-black/70",
    "w-full",
    "h-full",
  );
  const form = document.createElement("div");
  form.className = "form";

  const closeBtn = document.createElement("button");
  closeBtn.className = "close-btn";
  const closeIcon = document.createElement("i");
  closeIcon.classList.add("fa-solid", "fa-xmark");
  closeBtn.append(closeIcon);
  closeBtn.addEventListener("click", () => {
    overlay.remove();
    document.body.style.overflow = "";
    mainLoginBtn.disabled = false;
  });

  const heading = document.createElement("h1");
  heading.textContent = "Sign-In";

  const userNameDiv = document.createElement("div");
  userNameDiv.className = "field";
  const userNameLabel = document.createElement("label");
  userNameLabel.textContent = "User Name";
  const userNameInput = document.createElement("input");
  userNameInput.type = "text";
  userNameDiv.append(userNameLabel, userNameInput);

  const passwordDiv = document.createElement("div");
  passwordDiv.className = "field";
  const passwordLabel = document.createElement("label");
  passwordLabel.textContent = "Password";
  const passwordInput = document.createElement("input");
  passwordInput.type = "password";
  passwordDiv.append(passwordLabel, passwordInput);

  const sendBtn = document.createElement("button");
  sendBtn.textContent = "Login";
  sendBtn.className = "send-btn";
  sendBtn.addEventListener("click", (e) => {
    sendBtn.disabled = true;
    const userName = userNameInput.value;
    const password = passwordInput.value;
    if (userName === "" || password === "") {
      showAlert("Please fill in all fields", "bg-orange-500/80");
      sendBtn.disabled = false;
      return;
    }
    checkUser(userName, password);
    sendBtn.disabled = false;
  });

  const createAcount = document.createElement("div");
  createAcount.className = "link-to-account";
  const createAcountText = document.createElement("p");
  createAcountText.textContent = "Don't Have Acount?";
  const createAcountSpan = document.createElement("span");
  createAcountSpan.textContent = "Create Acount";
  createAcountSpan.addEventListener("click", () => {
    overlay.remove();
    signUpForm();
  });
  createAcount.append(createAcountText, createAcountSpan);

  form.append(
    heading,
    closeBtn,
    userNameDiv,
    passwordDiv,
    sendBtn,
    createAcount,
  );
  overlay.append(form);
  document.body.append(overlay);
}
async function checkUser(userName, password) {
  try {
    const response = await fetch(`${baseUrl}/login`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: userName,
        password: password,
      }),
    });
    if (response.status === 422) {
      showAlert("Invalid username or password", "bg-red-500/80");
    }
    if (!response.ok) throw new Error("Request Failed");
    const userResponse = await response.json();
    const user = userResponse.user;
    const token = userResponse.token;
    document.querySelector(".overlay").remove();
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    setupUI();
    showAlert("Login Succussfully", "bg-green-500/80");
  } catch (err) {
    console.log(err);
  }
}
function signUpForm() {
  document.body.style.overflow = "hidden";
  const overlay = document.createElement("div");
  overlay.classList.add(
    "overlay",
    "fixed",
    "top-0",
    "left-0",
    "z-9999",
    "bg-black/70",
    "w-full",
    "h-full",
  );
  const form = document.createElement("div");
  form.className = "form";

  const closeBtn = document.createElement("button");
  closeBtn.className = "close-btn";
  const closeIcon = document.createElement("i");
  closeIcon.classList.add("fa-solid", "fa-xmark");
  closeBtn.append(closeIcon);
  closeBtn.addEventListener("click", () => {
    overlay.remove();
    document.body.style.overflow = "";
    mainLoginBtn.disabled = false;
  });

  const heading = document.createElement("h1");
  heading.textContent = "Sign-Up";

  const userNameDiv = document.createElement("div");
  userNameDiv.className = "field";
  const userNameLabel = document.createElement("label");
  userNameLabel.textContent = "User Name";
  const userNameInput = document.createElement("input");
  userNameInput.type = "text";
  userNameDiv.append(userNameLabel, userNameInput);

  const passwordDiv = document.createElement("div");
  passwordDiv.className = "field";
  const passwordLabel = document.createElement("label");
  passwordLabel.textContent = "Password";
  const passwordInput = document.createElement("input");
  passwordInput.type = "password";
  passwordDiv.append(passwordLabel, passwordInput);

  const nameDiv = document.createElement("div");
  nameDiv.className = "field";
  const nameLabel = document.createElement("label");
  nameLabel.textContent = "Name";
  const nameInput = document.createElement("input");
  nameInput.type = "text";
  nameDiv.append(nameLabel, nameInput);

  const emailDiv = document.createElement("div");
  emailDiv.className = "field";
  const emailLabel = document.createElement("label");
  emailLabel.textContent = "Email";
  const emailInput = document.createElement("input");
  emailInput.type = "email";
  emailDiv.append(emailLabel, emailInput);

  const imageDiv = document.createElement("div");
  imageDiv.className = "field";
  const imageLabel = document.createElement("label");
  imageLabel.textContent = "Image";
  const imageInput = document.createElement("input");
  imageInput.type = "file";
  imageInput.accept = "image/*";
  imageDiv.append(imageLabel, imageInput);

  const sendBtn = document.createElement("button");
  sendBtn.textContent = "Sign up";
  sendBtn.className = "send-btn";
  sendBtn.addEventListener("click", () => {
    const userName = userNameInput.value;
    const password = passwordInput.value;
    const name = nameInput.value;
    const email = emailInput.value;
    const image = imageInput.files[0];
    if (userName === "" || password === "" || name === "") {
      showAlert("Please fill in all fields", "bg-orange-500/80");
      return;
    }
    createUser(userName, password, name, email, image);
  });

  const logToAccount = document.createElement("div");
  logToAccount.className = "link-to-account";
  const logToAccountText = document.createElement("p");
  logToAccountText.textContent = "Already Have Acount?";
  const logToAccountSpan = document.createElement("span");
  logToAccountSpan.textContent = "Login";
  logToAccountSpan.addEventListener("click", () => {
    overlay.remove();
    loginForm();
  });
  logToAccount.append(logToAccountText, logToAccountSpan);

  form.append(
    heading,
    closeBtn,
    userNameDiv,
    passwordDiv,
    nameDiv,
    emailDiv,
    imageDiv,
    sendBtn,
    logToAccount,
  );
  overlay.append(form);
  document.body.append(overlay);
}
async function createUser(userName, password, name, email, image) {
  try {
    const formData = new FormData();

    formData.append("username", userName);
    formData.append("password", password);
    formData.append("name", name);
    formData.append("email", email);

    if (image) {
      formData.append("image", image);
    }

    const response = await fetch(`${baseUrl}/register`, {
      method: "POST",
      headers: {
        Accept: "application/json",
      },
      body: formData,
    });
    const userResponse = await response.json();
    if (response.status === 422) {
      showAlert(userResponse.message, "bg-red-500/80");
    }
    if (!response.ok) throw new Error("Request Failed");
    document.querySelector(".overlay").remove();
    loginForm();
    showAlert("Account Created Succussfully", "bg-green-500/80");
  } catch (err) {
    console.log(err);
  }
}
function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  showAlert("Logged Out Successfully", "bg-pink-500/80");
  window.location.href = "index.html";
  setupUI();
}
function createPostForm() {
  document.body.style.overflow = "hidden";
  const overlay = document.createElement("div");
  overlay.classList.add(
    "overlay",
    "fixed",
    "top-0",
    "left-0",
    "z-9999",
    "bg-black/70",
    "w-full",
    "h-full",
  );

  const form = document.createElement("div");
  form.className = "form";

  const closeBtn = document.createElement("button");
  closeBtn.className = "close-btn";
  const closeIcon = document.createElement("i");
  closeIcon.classList.add("fa-solid", "fa-xmark");
  closeBtn.append(closeIcon);
  closeBtn.addEventListener("click", () => {
    overlay.remove();
    document.body.style.overflow = "";
    createPostBtn.disabled = false;
  });

  const heading = document.createElement("h1");
  heading.textContent = "New Post";

  const titleDiv = document.createElement("div");
  titleDiv.className = "field";
  const titleLabel = document.createElement("label");
  titleLabel.textContent = "Title";
  const titleInput = document.createElement("input");
  titleInput.type = "text";
  titleDiv.append(titleLabel, titleInput);

  const bodyDiv = document.createElement("div");
  bodyDiv.className = "field";
  const bodyLabel = document.createElement("label");
  bodyLabel.textContent = "Body";
  const bodyInput = document.createElement("textarea");
  bodyDiv.append(bodyLabel, bodyInput);

  const imageDiv = document.createElement("div");
  imageDiv.className = "field";
  const imageLabel = document.createElement("label");
  imageLabel.textContent = "Image";
  const imageInput = document.createElement("input");
  imageInput.type = "file";
  imageInput.accept = "image/*";
  imageDiv.append(imageLabel, imageInput);

  const tagsDiv = document.createElement("div");
  tagsDiv.className = "field";
  const tagsLabel = document.createElement("label");
  tagsLabel.textContent = "Tags";
  const tags = document.createElement("div");
  tags.className = "tags";

  let tagsArray = [];
  let myTags = [];

  let tagsRequest = async () => {
    const response = await fetch(`${baseUrl}/tags`);
    if (!response.ok) {
      showAlert("Request Failed", "bg-red-500/80");
      throw new Error("Request Failed");
    }
    const tagsResponse = await response.json();
    const theTags = tagsResponse.data;

    for (let i = 0; i < theTags.length; i++) {
      const tag = document.createElement("div");
      const checkbox = document.createElement("input");
      checkbox.id = `tag${i + 1}`;
      checkbox.type = "checkbox";
      checkbox.name = "tags";
      const customCheckbox = document.createElement("label");
      customCheckbox.setAttribute("for", `tag${i + 1}`);
      customCheckbox.append(theTags[i].name);

      tag.append(checkbox, customCheckbox);
      tags.append(tag);

      tagsArray.push(theTags[i]);

      checkbox.addEventListener("change", () => {
        if (checkbox.checked) {
          if (!myTags.includes(theTags[i])) {
            myTags.push(theTags[i]);
          }
        } else {
          const index = myTags.indexOf(theTags[i]);
          if (index > -1) {
            myTags.splice(index, 1);
          }
        }
      });
    }
    tagsDiv.append(tagsLabel, tags);
  };
  tagsRequest();

  const sendBtn = document.createElement("button");
  sendBtn.textContent = "Create Post";
  sendBtn.className = "send-btn";
  sendBtn.addEventListener("click", (e) => {
    sendBtn.disabled = true;
    const title = titleInput.value;
    const body = bodyInput.value;
    const img = imageInput.files[0];
    const tags = myTags;
    if (title === "" && body === "" && img === "") {
      showAlert("Please fill in any field", "bg-orange-500/80");
      sendBtn.disabled = false;
      return;
    }
    createPost(title, body, img, tags);
    sendBtn.disabled = false;
  });

  form.append(heading, closeBtn, titleDiv, bodyDiv, imageDiv, tagsDiv, sendBtn);
  overlay.append(form);
  document.body.append(overlay);
}
async function createPost(title, body, img, tags) {
  try {
    const formData = new FormData();
    formData.append("title", title);
    formData.append("body", body);
    if (img) {
      formData.append("image", img);
    }
    formData.append("tags", JSON.stringify(tags));  // NOT Work Form Backend/////////////////

    const response = await fetch(`${baseUrl}/posts`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: formData,
    });
    const postResponse = await response.json();
    if (response.status === 422) {
      showAlert(postResponse.message, "bg-red-500/80");
    }
    if (!response.ok) throw new Error("Request Failed");
    document.querySelector(".overlay").remove();
    createPostBtn.disabled = false;
    showAlert("Post Created Succussfully", "bg-green-500/80");
    if (!window.location.pathname.includes("profile.html")) {
      postsArea.innerHTML = "";
      // getPosts();
    }
    if (window.location.pathname.includes("profile.html")) {
      document.querySelector(".profile-posts").innerHTML = "";
      const user = JSON.parse(localStorage.getItem("user"));
      window.location.reload();
    }
  } catch (err) {
    console.log(err);
  }
}
function showComments(postID) {
  document.querySelectorAll(".post-comments").forEach((pc) => {
    pc.innerHTML = "";
    pc.classList.remove("comments-show");
  });

  const postComments = document.getElementById(postID);
  postComments.classList.add("comments-show");

  const content = `
    <div class="top-0 flex items-center w-full border-b border-b-gray-600 pb-2 mb-4">
      <div id="closeComments" class="size-8 flex items-center justify-center cursor-pointer transition-all duration-300 hover:bg-black/20">
        <i class="fa-regular fa-arrow-left text-gray-400"></i>
      </div>
      <div class="text-center flex-1 text-white">
        <i class="fa-light fa-comment"></i>
        <span>${postComments.dataset.comments}</span>
        Comments
      </div>
    </div>

    <div class="write-comment">
      <input id="comment-input" type="text" placeholder="leave your comment">
      <div class="send-comment">
        <i class="fa-regular fa-paper-plane-top text-white"></i>
      </div>
    </div>

    <div id="commentsArea"></div>
  `;
  postComments.innerHTML = content;
  document.getElementById("closeComments").addEventListener("click", () => {
    postComments.innerHTML = "";
    document.getElementById(postID).classList.remove("comments-show");
  });
  document.querySelector(".send-comment").addEventListener("click", () => {
    createComment(postID);
  });
  showTheComment(postID);
}
async function showTheComment(postID) {
  try {
    const response = await fetch(`${baseUrl}/posts/${postID}`);
    if (!response.ok) {
      showAlert("Request Failed", "bg-red-500/80");
      throw new Error("Request Failed");
    }
    const postResponse = await response.json();
    const commentsResponse = postResponse.data.comments;

    for (let i = 0; i < commentsResponse.length; i++) {
      const comment = document.createElement("div");
      comment.className = "theComment";

      const userImg = document.createElement("img");
      userImg.className = "header-img";
      if (Object.keys(commentsResponse[i].author.profile_image).length === 0) {
        userImg.src =
          "https://media.istockphoto.com/id/1495088043/vector/user-profile-icon-avatar-or-person-icon-profile-picture-portrait-symbol-default-portrait.jpg?s=612x612&w=0&k=20&c=dhV2p1JwmloBTOaGAtaA3AW1KSnjsdMt7-U_3EZElZ0=";
      } else {
        userImg.src = commentsResponse[i].author.profile_image;
      }

      const userName = document.createElement("div");
      userName.className = "name";
      userName.append(commentsResponse[i].author.name);

      const userComment = document.createElement("p");
      userComment.className = "body-text";
      userComment.append(commentsResponse[i].body);

      const info = document.createElement("div");
      info.append(userName, userComment);

      comment.append(userImg, info);

      document.getElementById("commentsArea").append(comment);
    }
  } catch (err) {
    console.log(err);
  }
}
async function createComment(postID) {
  try {
    const theComment = document.getElementById("comment-input").value;
    const response = await fetch(`${baseUrl}/posts/${postID}/comments`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({
        body: theComment,
      }),
    });
    const commentResponse = await response.json();
    if (!response.ok) {
      showAlert(commentResponse.message, "bg-red-500/80");
      throw new Error("Request Failed");
    }
    showAlert("Comment Created Succussfully", "bg-green-500/80");
    showComments(postID);
  } catch (err) {
    console.log(err);
  }
}
export function setupUI() {
  const token = localStorage.getItem("token");
  if (token == null) {
    navBtns.innerHTML = `
            <button id="login-btn" class="bg-white px-4 py-1.5 rounded-full border border-sky-500 cursor-pointer hover:bg-sky-500 hover:border-sky-500 hover:text-white transition duration-300 flex items-center gap-0.5 disabled:bg-gray-400 disabled:border-gray-400 disabled:text-gray-600 disabled:cursor-not-allowed">
              Login
              <i class="fa-thin fa-right-to-bracket"></i>
            </button>`;
    mainLoginBtn = document.getElementById("login-btn");
    mainLoginBtn.addEventListener("click", () => {
      loginForm();
      mainLoginBtn.disabled = true;
    });
  } else {
    const user = JSON.parse(localStorage.getItem("user"));
    let profileImage;
    if (Object.keys(user.profile_image).length === 0) {
      profileImage =
        "https://media.istockphoto.com/id/1495088043/vector/user-profile-icon-avatar-or-person-icon-profile-picture-portrait-symbol-default-portrait.jpg?s=612x612&w=0&k=20&c=dhV2p1JwmloBTOaGAtaA3AW1KSnjsdMt7-U_3EZElZ0=";
    } else {
      profileImage = user.profile_image;
    }
    navBtns.innerHTML = `
          <div id="profile" class="cursor-pointer" data-user="${user.id}">
            <img
              class="size-11 rounded-full border-2 border-white"
              src="${profileImage}"
              alt="Profile Img"
            />
          </div>
          <button id="add-post-btn" class="text-white bg-sky-500 size-8 rounded-md cursor-pointer transition-all duration-300 hover:scale-105 disabled:bg-gray-400 disabled:border-gray-400 disabled:text-gray-600 disabled:cursor-not-allowed" title="New Post">
            <i class="fa-regular fa-plus"></i>
          </button>`;
    profilePopUp(user, profileImage);
    document.getElementById("profile").addEventListener("click", () => {
      document.getElementById("profile-popup").classList.remove("hidden");
    });
    createPostBtn = document.getElementById("add-post-btn");
    createPostBtn.addEventListener("click", () => {
      createPostForm();
      createPostBtn.disabled = true;
    });
  }
}
function profilePopUp(user, profileImage) {
  const popUp = `
      <ul id="profile-popup" class="absolute top-0 right-0 z-10 p-2 bg-gray-800 w-full h-screen divide-y divide-gray-400 transition-all duration-300 sm:w-fit sm:h-fit sm:top-21 sm:rounded-xl border border-gray-500 hidden">
        <li class="flex items-center gap-4 p-3">
          <img
            class="size-11 rounded-full border-2 border-white"
            src="${profileImage}"
            alt="profile Img">
          <div>
            <span class="block font-bold text-white">${user.username}</span>
            <span class="block text-gray-400 -mt-1.5">${user.name}</span>
          </div>
          <div id="close" class="ml-auto size-8 flex items-center justify-center cursor-pointer transition-all duration-300 hover:bg-black/20">
            <i class="fa-solid fa-xmark text-gray-400"></i>
          </div>
        </li>
        <li class="p-3 cursor-pointer transition-all duration-300 hover:bg-black/20">
          <a href="index.html" class="w-full block">
            <i class="fa-light fa-house text-gray-400"></i>
            <span class="ml-1 text-white">Home</span>
          </a>
        </li>
        <li id="profileLink" class="p-3 cursor-pointer transition-all duration-300 hover:bg-black/20">
          <i class="fa-light fa-user text-gray-400"></i>
          <span class="ml-1 text-white">Profile</span>
        </li>
        <li id="logout-btn" class="p-3 cursor-pointer transition-all duration-300 hover:bg-black/20">
            <i class="fa-thin fa-right-to-bracket text-gray-400"></i>
            <span class="ml-1 text-white">Logout</span>
        </li>
      </ul>`;
  navBtns.innerHTML += popUp;
  document.getElementById("close").addEventListener("click", () => {
    document.getElementById("profile-popup").classList.add("hidden");
  });
  document.getElementById("logout-btn").addEventListener("click", logout);
  document.getElementById("profileLink").addEventListener("click", () => {
    userClicked(user.id);
  });
}
function userClicked(userID) {
  window.location = `profile.html?userid=${userID}`;
}
export function showImage(imageUrl) {
  document.body.style.overflow = "hidden";
  const imageContainer = document.createElement("div");
  imageContainer.classList.add(
    "fixed",
    "top-0",
    "left-0",
    "z-9999",
    "bg-gray-800/90",
    "w-full",
    "h-full",
  );
  const closeIcon = document.createElement("i");
  closeIcon.classList.add(
    "fa-solid",
    "fa-xmark",
    "absolute",
    "top-5",
    "left-5",
    "text-3xl",
    "cursor-pointer",
    "text-gray-400",
    "transition-all",
    "duration-300",
    "hover:text-gray-400/70",
  );
  closeIcon.addEventListener("click", () => {
    imageContainer.remove();
    document.body.style.overflow = "";
  });
  const downloadIcon = document.createElement("i");
  downloadIcon.classList.add(
    "fa-regular",
    "fa-download",
    "absolute",
    "top-5",
    "right-5",
    "text-3xl",
    "cursor-pointer",
    "text-gray-400",
    "transition-all",
    "duration-300",
    "hover:text-gray-400/70",
  );
  downloadIcon.addEventListener("click", async () => {
    const response = await fetch(imageUrl);
    const blob = await response.blob();

    const fileName = imageUrl.match(/([^\/]+)\.([a-zA-Z0-9]+)$/g)[0];

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(link.href);
  });
  const imageHolder = document.createElement("div");
  imageHolder.classList.add(
    "w-full",
    "h-full",
    "p-15",
    "flex",
    "justify-center",
    "items-center",
  );
  const image = document.createElement("img");
  image.src = imageUrl;
  image.classList.add("max-w-full", "max-h-full", "object-cover");

  imageHolder.append(image);
  imageContainer.append(closeIcon, downloadIcon, imageHolder);
  document.body.append(imageContainer);
}
export function showAlert(message, style) {
  const div = document.createElement("div");
  div.classList.add("alert", style);
  const icon = document.createElement("i");
  icon.classList.add("fa-duotone", "fa-solid", "fa-circle-info");
  const msg = document.createElement("p");
  msg.textContent = message;
  div.append(icon, msg);
  document.querySelector("main").appendChild(div);

  setTimeout(() => {
    div.classList.add("opacity-0");
    setTimeout(() => {
      div.remove();
    }, 500);
  }, 2000);
}
function handleInfinityScroll() {
  const endOfPage =
    window.innerHeight + window.pageYOffset ===
    document.documentElement.scrollHeight;

  if (endOfPage) {
    currentPage++;
    getPosts();
  }
}
export function toggleLoader(show = true) {
  if (show) {
    document.getElementById("post-loading").classList.remove("invisible");
  } else {
    document.getElementById("post-loading").classList.add("invisible");
  }
}
