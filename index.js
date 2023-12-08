const apiKey = "AIzaSyCKHytj5BTTR324N9R4NXnud41v1vhYwiw";
const table = document.getElementById("dynamicTable");
const videoCountElement = document.querySelector(".videoCount");

async function fetchData(url) {
  const response = await fetch(url);
  const data = await response.json();
  loopThroughData(data.items);

  if (data.nextPageToken) {
    const nextPageUrl = `${url}&pageToken=${data.nextPageToken}`;
    await fetchData(nextPageUrl);
  }
}

function loopThroughData(videos) {
  let videoCount = 0;
  videos.forEach((video, index) => {
    const newRow = document.createElement("div");
    newRow.classList.add("table-row");
    if (
      video?.snippet?.title === "Private video" ||
      video?.snippet?.title === "Deleted video"
    ) {
      newRow.classList.add("unavailable-video");
    }
    const cellDataArray = [
      index + 1,
      video.snippet.title,
      video.snippet.description,
      `<a href="https://www.youtube.com/watch?v=${video.snippet.resourceId.videoId}" target="_blank"><img src=${video.snippet.thumbnails?.medium?.url} /></a>`,
      video.snippet.publishedAt,
      video.contentDetails.videoPublishedAt,
    ];
    cellDataArray.forEach((cellData) => {
      const cell = document.createElement("div");
      cell.classList.add("table-cell");
      cell.innerHTML = cellData;
      newRow.appendChild(cell);
    });
    table.appendChild(newRow);
    videoCount++;
    console.log(videoCount);
  });
  videoCountElement.textContent = `Total Videos: ${videoCount}`;
  table.appendChild(videoCountElement);
}

function searchPlaylist() {
  const playlistIdInput = document.getElementById("playlistIdInput").value;
  if (playlistIdInput) {
    const newUrl = `https://youtube.googleapis.com/youtube/v3/playlistItems?key=${apiKey}&playlistId=${playlistIdInput}&part=snippet%2CcontentDetails&maxResults=1000&fields=nextPageToken,items(snippet(title,position,description,resourceId(videoId),thumbnails(medium(url)),publishedAt),contentDetails(videoPublishedAt))`;

    table.innerHTML = "";
    fetchData(newUrl);
    document.getElementById("playlistIdInput").value = "";
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
