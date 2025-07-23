const testBtn = document.getElementById("test-btn");
const chooseBtn = document.getElementById("choose-btn");
const fileInput = document.getElementById("csv-file");
const dropZone = document.getElementById("drop-zone");
const modal = document.getElementById("loader-modal");
const loaderText = document.getElementById("loader-text");

// --- Show/Hide Loader ---
function showLoader(message) {
  loaderText.textContent = message;
  modal.classList.remove("hidden");
}
function hideLoader() {
  modal.classList.add("hidden");
}

// --- Test button click (stub) ---
testBtn.addEventListener("click", () => {
  showToast("Example data button will be implemented soon", "info");
});

// --- Choose file button triggers file input click ---
chooseBtn.addEventListener("click", () => fileInput.click());

// --- File input change handler ---
fileInput.addEventListener("change", () => {
  if (!fileInput.files.length) return;
  handleFile(fileInput.files[0]);
});

// --- Drag n drop hover effect and file handling ---
["dragenter", "dragover"].forEach((evt) =>
  document.addEventListener(evt, (e) => {
    e.preventDefault();
    dropZone.classList.add("hover");
  })
);
["dragleave", "drop"].forEach((evt) =>
  document.addEventListener(evt, (e) => {
    e.preventDefault();
    dropZone.classList.remove("hover");
    if (evt === "drop" && e.dataTransfer.files.length) {
      handleFile(e.dataTransfer.files[0]);
    }
  })
);

// --- Main file upload and SSE progress handler ---
function handleFile(file) {
  if (!/\.csv$/i.test(file.name)) {
    showToast("Please upload a .csv file", "error");
    return;
  }

  const formData = new FormData();
  formData.append("file", file);

  showLoader("Uploading file…");

  fetch("/upload", {
    method: "POST",
    body: formData,
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Upload failed with status " + response.status);
      }
      return response.json();
    })
    .then((data) => {
      if (!data.success) {
        throw new Error(data.message || "Upload failed");
      }

      showLoader("Waiting for processing…");

      const es = new EventSource(`/stream/${data.task_id}`);

      es.onmessage = (e) => {
        let eventData;
        try {
          eventData = JSON.parse(e.data);
        } catch (err) {
          console.error("Failed to parse SSE data", err);
          return;
        }

        const status = eventData.status;
        switch (status) {
          case "processing":
            loaderText.textContent = "Processing file…";
            break;
          case "calculating":
            loaderText.textContent = "Calculating statistics…";
            break;
          case "rendering":
            loaderText.textContent = "Rendering results…";
            break;
          case "done":
            loaderText.textContent = "Done!";
            es.close();
            hideLoader();
            // Redirect to plot page with task ID
            window.location.href = `/plot?task=${data.task_id}`;
            break;
          case "error":
            es.close();
            hideLoader();
            showToast(
              eventData.error || "An error occurred during processing",
              "error"
            );
            break;
          default:
            loaderText.textContent = `Status: ${status}`;
            break;
        }
      };

      es.onerror = () => {
        es.close();
        hideLoader();
        showToast("Lost connection to server", "error");
      };
    })
    .catch((error) => {
      hideLoader();
      showToast("Error uploading file: " + error.message, "error");
      console.error("Error uploading file:", error);
    });
}
