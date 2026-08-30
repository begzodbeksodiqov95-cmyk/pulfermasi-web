let current = 0;
let startY = 0;

const feed = document.getElementById("feed");
const picker = document.getElementById("videoPicker");

const SUPABASE_URL =
    "https://bbgruqvwkygjwqdocnsb.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_Aa5uSwt_KndueGLGEhGRSA_Z2qfJGat";


function getVideos() {
    return document.querySelectorAll(".video");
}


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
    `;

    feed.appendChild(box);
}


async function loadVideos() {

    try {

        const response = await fetch(
            SUPABASE_URL +
            "/rest/v1/videos?select=videos_url"
            {
                headers: {
                    "apikey": SUPABASE_KEY,
                    "Authorization":
                        "Bearer " + SUPABASE_KEY
                }
            }
        );

        if (!response.ok) {
    alert(
        "Database xatosi: " +
        response.status +
        "\n" +
        await response.text()
    );
    return;
        }
        }

        const data = await response.json();

        data.forEach(function(item) {

            if (item.videos_url) {
                addVideoToFeed(item.videos_url);
            }

        });

        if (getVideos().length > 0) {
            showVideo(0);
        }

    } catch (error) {

        console.log("Xato:", error);

    }
}


function showVideo(index) {

    const videos = getVideos();

    if (index < 0 || index >= videos.length) {
        return;
    }

    videos.forEach(function(box) {

        box.classList.remove("active");

        const video =
            box.querySelector("video");

        if (video) {
            video.pause();
        }

    });

    current = index;

    const box = videos[current];

    box.classList.add("active");

    const video =
        box.querySelector("video");

    if (video) {
        video.currentTime = 0;

        video.play().catch(function() {});
    }
}


document.addEventListener(
    "touchstart",
    function(event) {

        startY =
            event.touches[0].clientY;

    }
);


document.addEventListener(
    "touchend",
    function(event) {

        const endY =
            event.changedTouches[0].clientY;

        const distance =
            startY - endY;

        if (Math.abs(distance) < 60) {
            return;
        }

        if (distance > 0) {
            showVideo(current + 1);
        } else {
            showVideo(current - 1);
        }

    }
);


picker.addEventListener(
    "change",
    function() {

        const file = picker.files[0];

        if (!file) {
            return;
        }


        if (!file.type.startsWith("video/")) {

            alert("Faqat video tanlang!");

            picker.value = "";

            return;
        }


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


        const uploadURL =
            SUPABASE_URL +
            "/storage/v1/object/Videos/" +
            fileName;


        const progress =
            document.createElement("div");

        progress.style.position = "fixed";
        progress.style.top = "50%";
        progress.style.left = "50%";
        progress.style.transform =
            "translate(-50%, -50%)";
        progress.style.background = "#111";
        progress.style.color = "#fff";
        progress.style.padding = "20px 30px";
        progress.style.borderRadius = "15px";
        progress.style.zIndex = "99999";

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


        xhr.upload.onprogress =
            function(event) {

                if (event.lengthComputable) {

                    const percent =
                        Math.round(
                            event.loaded /
                            event.total *
                            100
                        );

                    progress.innerText =
                        "Yuklanmoqda: " +
                        percent +
                        "%";
                }
            };


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
                        "Saqlanmoqda...";


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

                        const error =
                            await dbResponse.text();

                        console.log(
                            "DB ERROR:",
                            dbResponse.status,
                            error
                        );

                        progress.innerText =
                            "Database xatosi: " +
                            dbResponse.status;

                        setTimeout(
                            function() {
                                progress.remove();
                            },
                            4000
                        );

                        return;
                    }


                    progress.innerText =
                        "Yuklandi! ✅";


                    addVideoToFeed(
                        publicURL
                    );


                    setTimeout(
                        function() {
                            progress.remove();
                        },
                        1000
                    );


                } else {

                    progress.innerText =
                        "Upload xatosi: " +
                        xhr.status;

                    setTimeout(
                        function() {
                            progress.remove();
                        },
                        4000
                    );
                }
            };


        xhr.onerror =
            function() {

                progress.innerText =
                    "Internet xatosi ❌";

                setTimeout(
                    function() {
                        progress.remove();
                    },
                    3000
                );
            };


        xhr.send(file);

        picker.value = "";

    }
);


// ILOVA OCHILGANDA
loadVideos();
