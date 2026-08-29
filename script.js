const videos = document.querySelectorAll(".video");

let current = 0;
let startY = 0;
let endY = 0;

function showVideo(index) {
    if (index < 0 || index >= videos.length) return;

    const oldVideo = videos[current].querySelector("video");
    if (oldVideo) oldVideo.pause();

    videos[current].classList.remove("active");

    current = index;

    videos[current].classList.add("active");

    const newVideo = videos[current].querySelector("video");
    if (newVideo) {
        newVideo.currentTime = 0;
        newVideo.play().catch(() => {});
    }
}

document.addEventListener("touchstart", function(e) {
    startY = e.touches[0].clientY;
});

document.addEventListener("touchend", function(e) {
    endY = e.changedTouches[0].clientY;

    const distance = startY - endY;

    if (Math.abs(distance) < 60) return;

    if (distance > 0) {
        // Yuqoriga surish
        showVideo(current + 1);
    } else {
        // Pastga surish
        showVideo(current - 1);
    }
});
