let playlistId = "";
const apiKey = "AIzaSyCKHytj5BTTR324N9R4NXnud41v1vhYwiw";
const table = document.getElementById("dynamicTable");
const videoCountElement = document.querySelector(".videoCount");
let isPrivateOrDeleted = false;
videoCountElement.style.display = "none";

function fetchData(url) {
  fetch(url)
    .then((res) => res.json())
    .then((data) => {
      const videos = data.items;
      renderVideos(videos);
      videoCountElement.innerHTML = `Total Videos: ${videos.length}`;
    });
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
    ${
      isPrivateOrDeleted
        ? video.snippet.description
        : `<div class="description-text">${
            video.snippet.description.length > 50
              ? video.snippet.description.substring(0, 50) + "..."
              : video.snippet.description
          }</div>`
    }
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
      showMoreLink.addEventListener("click", function (e) {
        e.preventDefault();
        const descriptionText = newRow.querySelector(".description-text");
        const isActive = descriptionText.classList.contains("active");
        descriptionText.classList.toggle("active", !isActive);
        showMoreLink.textContent = isActive ? "Show less" : "Show more";
      });
    }
  });

  dynamicTable.appendChild(rowsContainer);
}

function searchPlaylist() {
  const playlistIdInput = document.getElementById("playlistIdInput").value;
  if (playlistIdInput) {
    const dynamicTable = document.getElementById("dynamicTable");
    removeChildExceptClass(dynamicTable, "header-row");
    const newUrl = `https://youtube.googleapis.com/youtube/v3/playlistItems?key=${apiKey}&playlistId=${playlistIdInput}&part=snippet%2CcontentDetails&maxResults=1000&fields=nextPageToken,items(snippet(title,position,description,resourceId(videoId),thumbnails(medium(url)),publishedAt),contentDetails(videoPublishedAt))`;

    fetchData(newUrl);
    document.getElementById("playlistIdInput").value = "";
    videoCountElement.style.display = "block";
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
