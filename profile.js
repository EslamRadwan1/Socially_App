import {
  baseUrl,
  setupUI,
  showAlert,
  toggleLoader,
  showImage,
} from "./main.js";

const urlParams = new URLSearchParams(window.location.search);
const userId = urlParams.get("userid");

if (window.location.pathname.includes("profile.html")) {
  setupUI();
  getUser(userId);
}
export async function getUser(userID) {
  try {
    toggleLoader(true);
    const response = await fetch(`${baseUrl}/users/${userID}`);
    if (!response.ok) {
      showAlert("Request Failed", "bg-red-500/80");
      throw new Error("Request Failed");
    }
    toggleLoader(false);
    const userResponse = await response.json();
    const theUser = userResponse.data;

    if (window.location.pathname.includes("profile.html")) {
      showUserData(theUser);
    }
  } catch (err) {
    console.log(err);
  }
}
export function showUserData(userObj) {
  document.title += ` | ${userObj.name}'s Profile`;
  document.getElementById("theName").textContent = userObj.name;
  document.getElementById("theUserName").textContent = `@${userObj.username}`;
  document.getElementById("postsCount").textContent = userObj.posts_count;
  document.getElementById("commentsCount").textContent = userObj.comments_count;
  if (Object.keys(userObj.profile_image).length === 0) {
    document.getElementById("userImg").src =
      "https://media.istockphoto.com/id/1495088043/vector/user-profile-icon-avatar-or-person-icon-profile-picture-portrait-symbol-default-portrait.jpg?s=612x612&w=0&k=20&c=dhV2p1JwmloBTOaGAtaA3AW1KSnjsdMt7-U_3EZElZ0=";
  } else {
    document.getElementById("userImg").src = userObj.profile_image;
  }
  document.getElementById("userImg").addEventListener("click", () => {
    showImage(document.getElementById("userImg").src);
  });
  getUserPosts(userId);
}
async function getUserPosts(userID) {
  try {
    toggleLoader(true);
    const response = await fetch(`${baseUrl}/users/${userID}/posts`);
    if (!response.ok) {
      showAlert("Request Failed", "bg-red-500/80");
      throw new Error("Request Failed");
    }
    toggleLoader(false);
    const postsResponse = await response.json();
    const userPosts = postsResponse.data;
    userPosts.reverse().forEach((post) => {
      showPost(post);
    });
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

  if (localStorage.getItem("user")) {
    if (Number(userId) === JSON.parse(localStorage.getItem("user")).id) {
      const icons = document.createElement("div");
      icons.className = "editsIcons";

      const editDiv = document.createElement("button");
      editDiv.className = "icon";
      const editIcon = document.createElement("i");
      editIcon.classList.add("fa-light", "fa-pen-to-square");
      editDiv.append(editIcon);

      const deletionDiv = document.createElement("button");
      deletionDiv.className = "icon";
      const deleteIcon = document.createElement("i");
      deleteIcon.classList.add("fa-light", "fa-trash");
      deletionDiv.append(deleteIcon);

      icons.append(editDiv, deletionDiv);

      header.append(userImg, info, icons);

      editDiv.addEventListener("click", function (e) {
        updatePostForm(post.dataset.id);
      });

      deletionDiv.addEventListener("click", function (e) {
        deletePostConfirm(post.dataset.id);
      });
    } else {
      header.append(userImg, info);
    }
  } else {
    header.append(userImg, info);
  }

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
  document.querySelector(".profile-posts").append(post);
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
async function updatePostForm(postID) {
  document.querySelectorAll(".icon").forEach((btn) => (btn.disabled = true));

  const response = await fetch(`${baseUrl}/posts/${postID}`);
  if (!response.ok) {
    showAlert("Request Failed", "bg-red-500/80");
    throw new Error("Request Failed");
  }
  const postResponse = await response.json();
  const postData = postResponse.data;

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
    document.querySelectorAll(".icon").forEach((btn) => (btn.disabled = false));
  });

  const heading = document.createElement("h1");
  heading.textContent = "Update Post";

  const titleDiv = document.createElement("div");
  titleDiv.className = "field";
  const titleLabel = document.createElement("label");
  titleLabel.textContent = "Title";
  const titleInput = document.createElement("input");
  titleInput.type = "text";
  titleInput.value = postData.title;
  titleDiv.append(titleLabel, titleInput);

  const bodyDiv = document.createElement("div");
  bodyDiv.className = "field";
  const bodyLabel = document.createElement("label");
  bodyLabel.textContent = "Body";
  const bodyInput = document.createElement("textarea");
  bodyInput.value = postData.body;
  bodyDiv.append(bodyLabel, bodyInput);

  const imageDiv = document.createElement("div");
  imageDiv.className = "field";
  const imageLabel = document.createElement("label");
  imageLabel.textContent = "Image";
  const theImage = document.createElement("div");
  const imageHolder = document.createElement("img");
  imageHolder.className = "image-holder";
  if (Object.keys(postData.image).length === 0) {
    imageHolder.src = "";
  } else {
    imageHolder.src = postData.image;
    theImage.append(imageHolder);
  }
  imageDiv.append(imageLabel, theImage);
  console.log(imageHolder);

  const sendBtn = document.createElement("button");
  sendBtn.textContent = "Update Post";
  sendBtn.className = "send-btn";
  sendBtn.addEventListener("click", (e) => {
    sendBtn.disabled = true;
    const title = titleInput.value;
    const body = bodyInput.value;
    if (title === "" && body === "") {
      showAlert("Please fill in any field", "bg-orange-500/80");
      sendBtn.disabled = false;
      return;
    }
    updatePost(postID, title, body);
    sendBtn.disabled = false;
  });

  form.append(heading, closeBtn, titleDiv, bodyDiv, imageDiv, sendBtn);
  overlay.append(form);
  document.body.append(overlay);
}
async function updatePost(postID, title, body) {
  try {
    const response = await fetch(`${baseUrl}/posts/${postID}`, {
      method: "PUT",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({
        title: title,
        body: body,
      }),
    });
    const postResponse = await response.json();
    if (!response.ok) {
      showAlert(postResponse.error_message, "bg-red-500/80");
      throw new Error("Request Failed");
    }
    document.querySelector(".overlay").remove();
    document.querySelectorAll(".icon").forEach((btn) => (btn.disabled = false));
    showAlert("Post Updated Succussfully", "bg-green-500/80");
    setTimeout(() => {
      window.location.reload();
    }, 500);
  } catch (err) {
    console.log(err);
  }
}
function deletePostConfirm(postID) {
  document.querySelectorAll(".icon").forEach((btn) => (btn.disabled = true));

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
    document.querySelectorAll(".icon").forEach((btn) => (btn.disabled = false));
  });

  const heading = document.createElement("h1");
  heading.textContent = "Delete Post";
  heading.classList.add("text-red-400");

  const bodyDiv = document.createElement("div");
  bodyDiv.classList.add("field", "w-70", "mt-10");
  const bodyLabel = document.createElement("label");
  bodyLabel.textContent = "Are You Sure To Delete this post";
  bodyDiv.append(bodyLabel);

  const sendBtn = document.createElement("button");
  sendBtn.textContent = "Delete Post";
  sendBtn.classList.add("send-btn", "bg-red-400/70", "hover:bg-red-400");
  sendBtn.addEventListener("click", (e) => {
    sendBtn.disabled = true;
    deletePost(postID);
    sendBtn.disabled = false;
  });

  form.append(heading, closeBtn, bodyDiv, sendBtn);
  overlay.append(form);
  document.body.append(overlay);
}
async function deletePost(postID) {
  try {
    const response = await fetch(`${baseUrl}/posts/${postID}`, {
      method: "DELETE",
      headers: {
        authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    const deleteResponse = await response.json();
    if (!response.ok) {
      showAlert(deleteResponse.error_message, "bg-red-500/80");
      throw new Error("Request Failed");
    }
    document.querySelector(".overlay").remove();
    document.querySelectorAll(".icon").forEach((btn) => (btn.disabled = false));
    showAlert("Post Deleted Succussfully", "bg-green-500/80");
    setTimeout(() => {
      window.location.reload();
    }, 500);
  } catch (err) {
    console.log(err);
  }
}
