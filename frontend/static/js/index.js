const testBtn = document.getElementById("test-btn");
const chooseBtn = document.getElementById("choose-btn");
const fileInput = document.getElementById("csv-file");
const dropZone = document.getElementById("drop-zone");
const errField = document.getElementById("upload-error");

// --- Test data button pass ---
// TODO: Implement actual test data loading
testBtn.addEventListener("click", () => {
  alert("Load example clicked (поки що без дій)");
});

// --- Choose file button listener ---
chooseBtn.addEventListener("click", () => fileInput.click());

// --- File input change listener ---
fileInput.addEventListener("change", () => {
  if (!fileInput.files.length) return;
  handleFile(fileInput.files[0]);
});

["dragenter", "dragover"].forEach((ev) =>
  document.addEventListener(ev, (e) => {
    e.preventDefault();
    dropZone.classList.add("hover");
  })
);
["dragleave", "drop"].forEach((ev) =>
  document.addEventListener(ev, (e) => {
    e.preventDefault();
    dropZone.classList.remove("hover");
    if (ev === "drop" && e.dataTransfer.files.length) {
      handleFile(e.dataTransfer.files[0]);
    }
  })
);

// --- Handle file upload ---
function handleFile(file) {
  errField.textContent = "";

  if (!/\.csv$/i.test(file.name)) {
    errField.textContent = "Please upload a .csv file";
    return;
  }

  const formData = new FormData();
  formData.append("file", file);
  console.log(formData);

  fetch("/upload", {
    method: "POST",
    body: formData,
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Upload failed");
      }
      return response.json();
    })
    .then((data) => {
      if (data.success) {
        errField.textContent = "Файл успішно завантажено!";
      } else {
        errField.textContent =
          data.message || "Сталася помилка при завантаженні";
      }
      console.log("Server response:", data);
    })
    .catch((error) => {
      errField.textContent = "Помилка завантаження файлу";
      console.error("Error uploading file:", error);
    });
}
