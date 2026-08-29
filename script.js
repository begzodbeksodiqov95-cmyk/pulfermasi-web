alert("SCRIPT ISHLADI");
let current = 0;
let startY = 0;

const feed = document.getElementById("feed");
const picker = document.getElementById("videoPicker");

// SUPABASE
const SUPABASE_URL = https://bbgruqvwkygjwqdocnsb.supabase.co/rest/v1/
const SUPABASE_KEY = sb_publishable_Aa5uSwt_KndueGLGEhGRSA_Z2qfJGat


// Videolar
function getVideos() {
    return document.querySelectorAll(".video");
}


// Videoni ko‘rsatish
function showVideo(index) {

    const videos = getVideos();

    if (index < 0 || index >= videos.length) return;

    videos.forEach(function(item) {

        item.classList.remove("active");

        const video = item.querySelector("video");

        if (video) {
            video.pause();
        }

    });

    current = index;

    const box = videos[current];

    box.classList.add("active");

    const video = box.querySelector("video");

    if (video) {
        video.currentTime = 0;
        video.play().catch(function() {});
    }
}


// Swipe
document.addEventListener("touchstart", function(event) {
    startY = event.touches[0].clientY;
});


document.addEventListener("touchend", function(event) {

    const endY = event.changedTouches[0].clientY;

    const distance = startY - endY;

    if (Math.abs(distance) < 60) return;

    if (distance > 0) {
        showVideo(current + 1);
    } else {
        showVideo(current - 1);
    }

});


// Yangi videoni Reelsga chiqarish
function addVideoToFeed(videoURL) {

    const box = document.createElement("div");

    box.className = "video";

    box.innerHTML = `

        <video
            src="${videoURL}"
            muted
            loop
            playsinline>
        </video>

        <div class="info">

            <div class="username">
                @video_uz
            </div>

            <div class="caption">
                Yangi video 🎬
            </div>

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

    feed.appendChild(box);

    const videos = getVideos();

    showVideo(videos.length - 1);
}


// VIDEO YUKLASH
picker.addEventListener("change", function() {

    const file = this.files[0];

    if (!file) return;

    if (!file.type.startsWith("video/")) {

        alert("Faqat video tanlang!");

        return;
    }


    // Fayl nomini noyob qilamiz
    const fileName =
        Date.now() + "_" +
        Math.random().toString(36).substring(2) +
        "_" +
        file.name.replace(/[^a-zA-Z0-9._-]/g, "_");


    const uploadURL =
        SUPABASE_URL +
        "/storage/v1/object/videos/" +
        fileName;


    // Yuklanish oynasi
    const progress = document.createElement("div");

    progress.style.position = "fixed";
    progress.style.top = "50%";
    progress.style.left = "50%";
    progress.style.transform = "translate(-50%,-50%)";
    progress.style.background = "rgba(0,0,0,.9)";
    progress.style.color = "white";
    progress.style.padding = "20px 30px";
    progress.style.borderRadius = "15px";
    progress.style.zIndex = "9999";
    progress.style.fontSize = "18px";

    progress.innerHTML = "Yuklanmoqda: 0%";

    document.body.appendChild(progress);


    const xhr = new XMLHttpRequest();

    xhr.open("POST", uploadURL, true);

    xhr.setRequestHeader(
        "Authorization",
        "Bearer " + SUPABASE_KEY
    );

    xhr.setRequestHeader(
        "apikey",
        SUPABASE_KEY
    );

    xhr.setRequestHeader(
        "Content-Type",
        file.type
    );

    xhr.upload.onprogress = function(event) {

        if (event.lengthComputable) {

            const percent =
                Math.round(
                    (event.loaded / event.total) * 100
                );

            progress.innerHTML =
                "Yuklanmoqda: " + percent + "%";
        }
    };


    xhr.onload = function() {

        if (xhr.status >= 200 && xhr.status < 300) {

            progress.innerHTML =
                "Yuklandi! ✅";

            const publicURL =
                SUPABASE_URL +
                "/storage/v1/object/public/videos/" +
                fileName;

            setTimeout(function() {

                progress.remove();

                addVideoToFeed(publicURL);

            }, 700);

        } else {

            progress.innerHTML =
                "Xatolik ❌";

            console.log(xhr.responseText);

            setTimeout(function() {
                progress.remove();
            }, 2000);
        }
    };


    xhr.onerror = function() {

        progress.innerHTML =
            "Internet yoki server xatosi ❌";

        setTimeout(function() {
            progress.remove();
        }, 2000);

    };


    xhr.send(file);

    picker.value = "";

});
