let playlistId = "";
let playlistUrl = "";
const apiKey = "AIzaSyCKHytj5BTTR324N9R4NXnud41v1vhYwiw";
const table = document.getElementById("dynamicTable");
const videoCountElement = document.querySelector(".videoCount");
let isPrivateOrDeleted = false;
videoCountElement.style.display = "none";
let videos = [];

function fetchData(url) {
  fetch(url)
    .then((res) => res.json())
    .then((data) => {
      videos.push(...data.items);
      if (data.nextPageToken) {
        fetchData(`${playlistUrl}&pageToken=${data.nextPageToken}`);
      } else {
        renderVideos(videos);
        setVideoCount(videos.length);
      }
    });
}

function setVideoCount(n) {
  videoCountElement.innerHTML = `TOTAL VIDEOS: ${n}`;
}

function formatDateTime(dateTimeString) {
  const options = {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  };
  const date = new Date(dateTimeString);
  return date.toLocaleString("en-US", options);
}

function removeChildExceptClass(parent, className) {
  const children = Array.from(parent.children);
  for (const child of children) {
    if (!child.classList.contains(className)) {
      parent.removeChild(child);
    }
  }
}

function renderVideos(videos) {
  const dynamicTable = document.getElementById("dynamicTable");
  removeChildExceptClass(dynamicTable, "header-row");

  const rowsContainer = document.createElement("div");

  videos.forEach((video, index) => {
    isPrivateOrDeleted =
      video?.snippet?.title === "Private video" ||
      video?.snippet?.title === "Deleted video";

    const newRow = document.createElement("div");
    newRow.classList.add("table-row");

    newRow.classList.toggle("unavailable-video", isPrivateOrDeleted);

    newRow.innerHTML = `
    <div class="table-cell table-number dynamic-cell">${index + 1}</div>
    <div class="table-cell dynamic-cell table-title">${
      video.snippet.title
    }</div>
    <div class="table-cell dynamic-cell">
  <div class="description-text">${video.snippet.description}</div>
  ${
    video.snippet.description.length > 50
      ? `<a href="#" class="show-more-link">Show more</a>`
      : ""
  }
    </div>
    <div class="table-cell">
    <a href="https://www.youtube.com/watch?v=${
      video.snippet.resourceId.videoId
    }" target="_blank">
    <img src=${video.snippet.thumbnails?.medium?.url} />
    </a>
    </div>
    <div class="table-cell dynamic-cell table-date">${formatDateTime(
      video.snippet.publishedAt
    )}</div>
      <div class="table-cell dynamic-cell table-date">${
        video.contentDetails?.videoPublishedAt
          ? formatDateTime(video.contentDetails.videoPublishedAt)
          : ""
      }</div>
      `;
    rowsContainer.appendChild(newRow);

    const showMoreLink = newRow.querySelector(".show-more-link");
    if (showMoreLink) {
      showMoreLink.addEventListener("click", toggleDescription);
    }
  });

  dynamicTable.appendChild(rowsContainer);
}

function searchPlaylist() {
  const playlistIdInput = document.getElementById("playlistIdInput").value;
  if (playlistIdInput) {
    const dynamicTable = document.getElementById("dynamicTable");
    removeChildExceptClass(dynamicTable, "header-row");

    videos = [];

    playlistUrl = `https://youtube.googleapis.com/youtube/v3/playlistItems?key=${apiKey}&playlistId=${playlistIdInput}&part=snippet%2CcontentDetails&maxResults=1000&fields=nextPageToken,items(snippet(title,position,description,resourceId(videoId),thumbnails(medium(url)),publishedAt),contentDetails(videoPublishedAt))`;

    fetchData(playlistUrl);
    document.getElementById("playlistIdInput").value = "";
    videoCountElement.style.display = "block";
  }
}

function toggleDescription(e) {
  e.preventDefault();
  const showMoreLink = e.target;
  const descriptionText =
    showMoreLink.parentElement.querySelector(".description-text");
  const isActive = descriptionText.classList.contains("active");

  if (!isActive) {
    descriptionText.classList.add("active");
    showMoreLink.textContent = "Show less";
  } else {
    descriptionText.classList.remove("active");
    showMoreLink.textContent = "Show more";
  }
}

document
  .getElementById("searchButton")
  .addEventListener("click", searchPlaylist);

document
  .getElementById("playlistIdInput")
  .addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
      searchPlaylist();
    }
  });
