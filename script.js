let current = 0;
let startY = 0;

const feed = document.getElementById("feed");
const picker = document.getElementById("videoPicker");

// SUPABASE
const SUPABASE_URL = "https://bbgruqvwkygjwqdocnsb.supabase.co";
const SUPABASE_KEY = "sb_publishable_Aa5uSwt_KndueGLGEhGRSA_Z2qfJGat";


// VIDEOLAR
function getVideos() {
    return document.querySelectorAll(".video");
}


// VIDEONI KO‘RSATISH
function showVideo(index) {

    const videos = getVideos();

    if (index < 0 || index >= videos.length) return;

    videos.forEach(function(box) {

        box.classList.remove("active");

        const video = box.querySelector("video");

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


// SWIPE
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


// REELSGA VIDEO QO‘SHISH
function addVideoToFeed(videoURL) {

    const box = document.createElement("div");

    box.className = "video";

    box.innerHTML = `

        <video
            src="${videoURL}"
            controls
            playsinline
            preload="metadata">
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

    showVideo(getVideos().length - 1);
}


// SUPABASE'DAN VIDEOLAR
async function loadVideos() {

    try {

        const response = await fetch(
            SUPABASE_URL +
            "/rest/v1/videos?select=videos_url&order=timestamp.desc",
            {
                method: "GET",

                headers: {
                    "apikey": SUPABASE_KEY,
                    "Authorization": "Bearer " + SUPABASE_KEY
                }
            }
        );


        if (!response.ok) {

            console.log(
                "Videolarni olishda xato:",
                response.status,
                await response.text()
            );

            return;
        }


        const data = await response.json();


        data.forEach(function(item) {

            if (
                item.videos_url &&
                !document.querySelector(
                    'video[src="' + item.videos_url + '"]'
                )
            ) {

                addVideoToFeed(item.videos_url);

            }

        });


    } catch (error) {

        console.log(
            "Internet xatosi:",
            error
        );

    }

}


// VIDEO YUKLASH
picker.addEventListener("change", function() {

    const file = picker.files[0];

    if (!file) return;


    if (!file.type.startsWith("video/")) {

        alert("Faqat video tanlang!");

        picker.value = "";

        return;
    }


    // NOYOB FAYL NOMI
    const fileName =
        Date.now() +
        "_" +
        Math.random()
            .toString(36)
            .substring(2) +
        "_" +
        file.name.replace(
            /[^a-zA-Z0-9._-]/g,
            "_"
        );


    // STORAGE UPLOAD URL
    const uploadURL =
        SUPABASE_URL +
        "/storage/v1/object/Videos/" +
        fileName;


    // PROGRESS OYNASI
    const progress =
        document.createElement("div");


    progress.style.position = "fixed";
    progress.style.top = "50%";
    progress.style.left = "50%";
    progress.style.transform =
        "translate(-50%, -50%)";
    progress.style.background = "#111";
    progress.style.color = "#fff";
    progress.style.padding =
        "20px 30px";
    progress.style.borderRadius =
        "15px";
    progress.style.zIndex =
        "99999";
    progress.style.fontSize =
        "18px";
    progress.style.textAlign =
        "center";


    progress.innerText =
        "Yuklanmoqda: 0%";


    document.body.appendChild(progress);


    const xhr =
        new XMLHttpRequest();


    xhr.open(
        "POST",
        uploadURL,
        true
    );


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


    xhr.setRequestHeader(
        "x-upsert",
        "false"
    );


    // YUKLANISH FOIZI
    xhr.upload.onprogress =
        function(event) {

            if (
                event.lengthComputable
            ) {

                const percent =
                    Math.round(
                        (event.loaded /
                            event.total) *
                        100
                    );


                progress.innerText =
                    "Yuklanmoqda: " +
                    percent +
                    "%";
            }

        };


    // UPLOAD NATIJASI
    xhr.onload =
        async function() {

            if (
                xhr.status >= 200 &&
                xhr.status < 300
            ) {

                const publicURL =
                    SUPABASE_URL +
                    "/storage/v1/object/public/Videos/" +
                    fileName;


                progress.innerText =
                    "Yuklandi! ✅";


                // DATABASEGA URL YOZISH
                try {

                    const dbResponse =
                        await fetch(
                            SUPABASE_URL +
                            "/rest/v1/videos",
                            {

                                method: "POST",

                                headers: {

                                    "apikey":
                                        SUPABASE_KEY,

                                    "Authorization":
                                        "Bearer " +
                                        SUPABASE_KEY,

                                    "Content-Type":
                                        "application/json",

                                    "Prefer":
                                        "return=minimal"

                                },


                                body: JSON.stringify({

                                    videos_url:
                                        publicURL

                                })

                            }
                        );


                    if (!dbResponse.ok) {

                        const errorText =
                            await dbResponse.text();


                        console.log(
                            "Database xatosi:",
                            dbResponse.status,
                            errorText
                        );


                        progress.innerText =
                            "Video yuklandi, " +
                            "lekin saqlashda xato ❌";


                        setTimeout(
                            function() {

                                progress.remove();

                            },
                            3000
                        );


                        return;
                    }


                    // REELSDA KO‘RSATISH
                    setTimeout(
                        function() {

                            progress.remove();

                            addVideoToFeed(
                                publicURL
                            );

                        },
                        500
                    );


                } catch (error) {

                    console.log(
                        "Database internet xatosi:",
                        error
                    );


                    progress.innerText =
                        "Video yuklandi, " +
                        "lekin saqlashda xato ❌";


                    setTimeout(
                        function() {

                            progress.remove();

                        },
                        3000
                    );

                }


            } else {

                progress.innerText =
                    "XATO " +
                    xhr.status +
                    ": " +
                    xhr.responseText;


                console.log(
                    "Storage xatosi:",
                    xhr.status,
                    xhr.responseText
                );


                setTimeout(
                    function() {

                        progress.remove();

                    },
                    4000
                );

            }

        };


    // INTERNET XATOSI
    xhr.onerror =
        function() {

            progress.innerText =
                "Internet/server xatosi ❌";


            setTimeout(
                function() {

                    progress.remove();

                },
                3000
            );

        };


    xhr.send(file);


    picker.value = "";

});


// ILOVA OCHILGANDA VIDEOLARNI OLISH
loadVideos();
