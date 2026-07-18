const postsArea = document.getElementById("content-area");

async function getPosts() {
  try {
    const response = await fetch("https://tarmeezacademy.com/api/v1/posts?limit=50");
    if (!response.ok) throw new Error("Request Failed");
    const postsResponse = await response.json();
    const posts = postsResponse.data;
    // showPost(posts[0]);
    for (let post of posts) {
      showPost(post);
    }
  } catch (err) {
    console.log(err);
  }
}
getPosts();

function showPost(postObj) {
  const post = document.createElement("div");
  post.className = "post";

  const header = document.createElement("div");
  header.className = "header";
  const userImg = document.createElement("img");
  userImg.className = "header-img";
  userImg.src = postObj.author.profile_image;
  userImg.alt = "User Image";
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
