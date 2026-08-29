const videos = document.querySelectorAll(".video");

let current = 0;
let startY = 0;

function showVideo(index) {
    const allVideos = document.querySelectorAll(".video");

    if (index < 0 || index >= allVideos.length) return;

    allVideos.forEach(v => {
        v.classList.remove("active");

        const video = v.querySelector("video");
        if (video) video.pause();
    });

    current = index;

    const currentBox = allVideos[current];
    currentBox.classList.add("active");

    const video = currentBox.querySelector("video");

    if (video) {
        video.currentTime = 0;
        video.play().catch(() => {});
    }
}


// SWIPE

document.addEventListener("touchstart", function(e) {
    startY = e.touches[0].clientY;
});

document.addEventListener("touchend", function(e) {

    const endY = e.changedTouches[0].clientY;
    const distance = startY - endY;

    if (Math.abs(distance) < 60) return;

    if (distance > 0) {
        showVideo(current + 1);
    } else {
        showVideo(current - 1);
    }

});


// VIDEO YUKLASH

const picker = document.getElementById("videoPicker");

if (picker) {

    picker.addEventListener("change", function() {

        const file = this.files[0];

        if (!file) return;

        if (!file.type.startsWith("video/")) {
            alert("Faqat video tanlang!");
            return;
        }

        const url = URL.createObjectURL(file);

        const newVideo = document.createElement("div");

        newVideo.className = "video";

        newVideo.innerHTML = `
            <video
                src="${url}"
                muted
                loop
                playsinline>
            </video>

            <div class="info">
                <div class="username">@video_uz</div>
                <div class="caption">Yangi video 🎬</div>
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

        document.getElementById("feed").appendChild(newVideo);

        const allVideos = document.querySelectorAll(".video");

        showVideo(allVideos.length - 1);

        picker.value = "";

    });

            }
