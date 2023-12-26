let playlistId = "";
const apiKey = "AIzaSyCKHytj5BTTR324N9R4NXnud41v1vhYwiw";
const table = document.getElementById("dynamicTable");
const videoCountElement = document.querySelector(".videoCount");
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

function renderVideos(videos) {
  const dynamicTable = document.getElementById("dynamicTable");
  removeChildExceptClass(dynamicTable, "header-row");
  videos.forEach((video, index) => {
    const newRow = document.createElement("div");
    newRow.classList.add("table-row");

    if (index % 2 === 1) {
      newRow.classList.add("alternate-row");
    }

    const numberCell = document.createElement("div");
    numberCell.classList.add("table-cell", "table-number", "dynamic-cell");
    numberCell.textContent = index + 1;
    newRow.appendChild(numberCell);

    const titleCell = document.createElement("div");
    titleCell.classList.add("table-cell", "dynamic-cell", "table-title");
    titleCell.textContent = video.snippet.title;

    if (
      video?.snippet?.title === "Private video" ||
      video?.snippet?.title === "Deleted video"
    ) {
      newRow.classList.add("unavailable-video");
    }

    newRow.appendChild(titleCell);

    const descriptionCell = document.createElement("div");
    descriptionCell.classList.add("table-cell", "dynamic-cell");

    if (
      video.snippet.description.length > 0 &&
      !(
        video?.snippet?.title === "Private video" ||
        video?.snippet?.title === "Deleted video"
      )
    ) {
      const descriptionText = document.createElement("div");
      descriptionText.classList.add("truncated-text");
      descriptionText.textContent = truncateText(video.snippet.description, 50);
      descriptionCell.appendChild(descriptionText);

      const showMoreLink = document.createElement("a");
      showMoreLink.textContent = "Show more";
      showMoreLink.href = "#";
      showMoreLink.classList.add("show-more-link");

      showMoreLink.addEventListener("click", function (e) {
        e.preventDefault();
        if (descriptionText.classList.contains("truncated-text")) {
          descriptionText.classList.remove("truncated-text");
          descriptionText.classList.add("expanded-text");
          descriptionText.textContent = video.snippet.description;
          showMoreLink.textContent = "Show less";
        } else {
          descriptionText.classList.remove("expanded-text");
          descriptionText.classList.add("truncated-text");
          descriptionText.textContent = truncateText(
            video.snippet.description,
            50
          );
          showMoreLink.textContent = "Show more";
        }
      });

      if (video.snippet.description.length > 50) {
        showMoreLink.style.display = "inline";
      } else {
        showMoreLink.style.display = "none";
      }

      descriptionCell.appendChild(showMoreLink);
    }

    newRow.appendChild(descriptionCell);

    const thumbnailCell = document.createElement("div");
    thumbnailCell.classList.add("table-cell");
    thumbnailCell.innerHTML = `<a href="https://www.youtube.com/watch?v=${video.snippet.resourceId.videoId}" target="_blank"><img src=${video.snippet.thumbnails?.medium?.url} /></a>`;
    newRow.appendChild(thumbnailCell);

    const dateCell = document.createElement("div");
    dateCell.classList.add("table-cell", "dynamic-cell", "table-date");
    dateCell.textContent = formatDateTime(video.snippet.publishedAt);
    newRow.appendChild(dateCell);

    const publishDateCell = document.createElement("div");
    publishDateCell.classList.add("table-cell", "dynamic-cell", "table-date");

    if (
      video.contentDetails &&
      video.contentDetails.videoPublishedAt &&
      new Date(video.contentDetails.videoPublishedAt).toString() !==
        "Invalid Date"
    ) {
      publishDateCell.textContent = formatDateTime(
        video.contentDetails.videoPublishedAt
      );
    } else {
      publishDateCell.textContent = "";
    }

    newRow.appendChild(publishDateCell);

    table.appendChild(newRow);

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

    function truncateText(text, maxLength) {
      if (text.length > maxLength) {
        return text.slice(0, maxLength) + "...";
      }
      return text;
    }
  });
}

function removeChildExceptClass(parent, className) {
  const children = Array.from(parent.children);
  for (const child of children) {
    if (!child.classList.contains(className)) {
      parent.removeChild(child);
    }
  }
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
