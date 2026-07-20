const baseUrl = "https://tarmeezacademy.com/api/v1";
const navBtns = document.getElementById("buttons");
let mainLoginBtn;
const postsArea = document.getElementById("content-area");

setupUI();
getPosts();

async function getPosts() {
  try {
    const response = await fetch(`${baseUrl}/posts?limit=50`);
    if (!response.ok) {
      showAlert("Request Failed", "bg-red-500/80");
      throw new Error("Request Failed");
    }
    const postsResponse = await response.json();
    const posts = postsResponse.data;
    for (let post of posts) {
      showPost(post);
    }
  } catch (err) {
    console.log(err);
  }
}
function showPost(postObj) {
  const post = document.createElement("div");
  post.className = "post";

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

  const body = document.createElement("div");
  body.className = "body";

  if (Object.keys(postObj.image).length !== 0) {
    const bodyImg = document.createElement("img");
    bodyImg.className = "body-img";
    bodyImg.src = postObj.image;
    bodyImg.alt = "Post Image";
    body.append(bodyImg);
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
  const cIcon = document.createElement("i");
  cIcon.classList.add("fa-light", "fa-comment");
  const commentSpan = document.createElement("span");
  const commentCount = document.createTextNode(postObj.comments_count);
  commentSpan.append(commentCount);
  const tagsDiv = document.createElement("div");
  tagsDiv.className = "tags";
  for (let i = 0; i < postObj.tags.length; i++) {
    const tag = document.createElement("span");
    const tagName = document.createTextNode(`#${postObj.tags[i].name}`);
    tag.append(tagName);
    tagsDiv.append(tag);
  }
  footer.append(cIcon, commentSpan, "Comments", tagsDiv);

  post.append(header, body, footer);
  postsArea.append(post);
}
function loginForm() {
  const form = document.createElement("div");
  form.className = "form";

  const closeBtn = document.createElement("button");
  closeBtn.className = "close-btn";
  const closeIcon = document.createElement("i");
  closeIcon.classList.add("fa-solid", "fa-xmark");
  closeBtn.append(closeIcon);
  closeBtn.addEventListener("click", () => {
    form.remove();
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
    form.remove();
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
  document.body.append(form);
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
    document.querySelector(".form").remove();
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    setupUI();
    showAlert("Login Succussfully", "bg-green-500/80");
  } catch (err) {
    console.log(err);
  }
}
function signUpForm() {
  const form = document.createElement("div");
  form.className = "form";

  const closeBtn = document.createElement("button");
  closeBtn.className = "close-btn";
  const closeIcon = document.createElement("i");
  closeIcon.classList.add("fa-solid", "fa-xmark");
  closeBtn.append(closeIcon);
  closeBtn.addEventListener("click", () => {
    form.remove();
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
    form.remove();
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
  document.body.append(form);
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
    document.querySelector(".form").remove();
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
  setupUI();
}
function setupUI() {
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
    const user = localStorage.getItem("user");
    let profileImage;
    if (Object.keys(JSON.parse(user).profile_image).length === 0) {
      profileImage =
        "https://media.istockphoto.com/id/1495088043/vector/user-profile-icon-avatar-or-person-icon-profile-picture-portrait-symbol-default-portrait.jpg?s=612x612&w=0&k=20&c=dhV2p1JwmloBTOaGAtaA3AW1KSnjsdMt7-U_3EZElZ0=";
    } else {
      profileImage = JSON.parse(user).profile_image;
    }
    navBtns.innerHTML = `
          <div id="profile">
            <img
              class="size-11 rounded-full border-2 border-white"
              src="${profileImage}"
              alt="Profile Img"
            />
          </div>
          <button id="logout-btn" class="bg-white text-sm  px-2 py-1 rounded-full border border-red-500 cursor-pointer hover:bg-red-500 hover:border-red-500 hover:text-white transition duration-300 flex items-center gap-0.5 disabled:bg-gray-400 disabled:border-gray-400 disabled:text-gray-600 disabled:cursor-not-allowed">
              Logout
              <i class="fa-thin fa-right-to-bracket"></i>
            </button>`;
    const logoutBtn = document.getElementById("logout-btn");
    logoutBtn.addEventListener("click", logout);
  }
}
function showAlert(message, style) {
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
