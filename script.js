const picker = document.createElement("input");
picker.type = "file";
picker.accept = "video/*";
picker.style.display = "none";
document.body.appendChild(picker);

const uploadButton = document.querySelector(".upload");

uploadButton.addEventListener("click", () => {
    picker.click();
});

picker.addEventListener("change", () => {

    const file = picker.files[0];

    if (!file) return;

    if (!file.type.startsWith("video/")) {
        alert("Faqat video tanlang!");
        return;
    }

    const videoURL = URL.createObjectURL(file);

    const videoBox = document.createElement("div");
    videoBox.className = "video";

    videoBox.innerHTML = `
        <video
            src="${videoURL}"
            autoplay
            muted
            loop
            playsinline>
        </video>

        <div class="info">
            <div class="username">@video_uz</div>
            <div class="caption">Mening yangi videom 🎬</div>
        </div>

        <div class="actions">
            <div class="action">
                ❤️
                <span>0</span>
            </div>

            <div class="action">
                💬
                <span>0</span>
            </div>

            <div class="action">
                ↗️
                <span>Ulashish</span>
            </div>
        </div>
    `;

    document.getElementById("feed").appendChild(videoBox);

    alert("Video qo‘shildi! 🎬");

});
