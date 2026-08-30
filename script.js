let current = 0;
let startY = 0;

const feed = document.getElementById("feed");
const picker = document.getElementById("videoPicker");

const SUPABASE_URL =
"https://bbgruqvwkygjwqdocnsb.supabase.co";

const SUPABASE_KEY =
"sb_publishable_Aa5uSwt_KndueGLGEhGRSA_Z2qfJGat";

async function getVideos() {

    try {

        const response = await fetch(
            SUPABASE_URL +
            "/rest/v1/videos?select=*",
            {
                headers: {
                    "apikey": SUPABASE_KEY,
                    "Authorization":
                    "Bearer " + SUPABASE_KEY
                }
            }
        );

        if (!response.ok) {
            throw new Error("Video olishda xato");
        }

        const videos = await response.json();

        feed.innerHTML = "";

        if (videos.length === 0) {
            return;
        }

        videos.forEach((item, index) => {

            const div = document.createElement("div");

            div.className =
                "video" +
                (index === 0 ? " active" : "");

            div.innerHTML = `
                <video
                    src="${item.video_url}"
                    loop
                    playsinline
                    ${index === 0 ? "autoplay" : ""}
                ></video>

                <div class="info">
                    <div class="username">
                        @${item.username || "user"}
                    </div>

                    <div class="caption">
                        ${item.caption || ""}
                    </div>
                </div>

                <div class="actions">

                    <div class="action">
                        ❤️
                        <span>${item.likes || 0}</span>
                    </div>

                    <div class="action">
                        💬
                        <span>${item.comments || 0}</span>
                    </div>

                    <div class="action">
                        ↗️
                        <span>Ulashish</span>
                    </div>

                </div>
            `;

            feed.appendChild(div);
        });

        current = 0;

        playCurrent();

    } catch (error) {

        console.error(error);

    }
}


function getVideoElements() {
    return document.querySelectorAll(".video");
}


function playCurrent() {

    const videos = getVideoElements();

    videos.forEach((item, index) => {

        const video =
            item.querySelector("video");

        if (index === current) {

            item.classList.add("active");

            video.currentTime = 0;

            video.play().catch(() => {});

        } else {

            item.classList.remove("active");

            video.pause();

        }

    });
}


function nextVideo() {

    const videos = getVideoElements();

    if (!videos.length) return;

    if (current < videos.length - 1) {

        current++;

        playCurrent();

    }

}


function previousVideo() {

    const videos = getVideoElements();

    if (!videos.length) return;

    if (current > 0) {

        current--;

        playCurrent();

    }

}


feed.addEventListener(
    "touchstart",
    function (e) {

        startY =
            e.touches[0].clientY;

    },
    { passive: true }
);


feed.addEventListener(
    "touchend",
    function (e) {

        const endY =
            e.changedTouches[0].clientY;

        const difference =
            startY - endY;

        if (Math.abs(difference) < 50) {
            return;
        }

        if (difference > 0) {

            nextVideo();

        } else {

            previousVideo();

        }

    },
    { passive: true }
);


picker.addEventListener(
    "change",
    async function () {

        const file = this.files[0];

        if (!file) return;

        alert(
            "Video tanlandi. Yuklash funksiyasini keyingi bosqichda ulaymiz."
        );

    }
);


getVideos();
