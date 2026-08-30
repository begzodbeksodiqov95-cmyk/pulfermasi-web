let current = 0;
let startY = 0;

const feed = document.getElementById("feed");

const SUPABASE_URL =
"https://bbgruqvwkygjwqdocnsb.supabase.co";

const SUPABASE_KEY =
"sb_publishable_Aa5uSwt_KndueGLGEhGRSA_Z2qfJGat";


async function getVideos() {

    try {

        const response = await fetch(
            SUPABASE_URL +
            "/rest/v1/videos?select=id,videos_url,likes&order=id.desc",
            {
                headers: {
                    "apikey": SUPABASE_KEY,
                    "Authorization":
                    "Bearer " + SUPABASE_KEY
                }
            }
        );

        if (!response.ok) {
            throw new Error(
                "Supabase xato: " + response.status
            );
        }

        const videos = await response.json();

        feed.innerHTML = "";

        if (!videos.length) {
            feed.innerHTML = `
                <div style="
                    color:white;
                    text-align:center;
                    padding-top:50%;
                    font-size:18px;
                ">
                    Video topilmadi
                </div>
            `;
            return;
        }


        videos.forEach((item, index) => {

            const div =
                document.createElement("div");

            div.className =
                "video" +
                (index === 0 ? " active" : "");


            div.innerHTML = `

                <video
                    src="${item.videos_url}"
                    loop
                    playsinline
                    preload="auto"
                    ${index === 0 ? "autoplay" : ""}
                ></video>


                <div class="actions">

                    <div class="action">
                        ❤️
                        <span>
                            ${item.likes || 0}
                        </span>
                    </div>


                    <div class="action">
                        💬
                        <span>
                            0
                        </span>
                    </div>


                    <div class="action">
                        ↗️
                        <span>
                            Ulashish
                        </span>
                    </div>

                </div>

            `;

            feed.appendChild(div);

        });


        current = 0;

        playCurrent();


    } catch (error) {

        console.error(error);

        feed.innerHTML = `
            <div style="
                color:white;
                text-align:center;
                padding:30px;
            ">
                Videolarni yuklashda xato
                <br><br>
                ${error.message}
            </div>
        `;

    }

}


function getVideoElements() {

    return document.querySelectorAll(".video");

}


function playCurrent() {

    const videos =
        getVideoElements();


    videos.forEach((item, index) => {

        const video =
            item.querySelector("video");


        if (index === current) {

            item.classList.add("active");

            video.play().catch(() => {});

        } else {

            item.classList.remove("active");

            video.pause();

        }

    });

}


function nextVideo() {

    const videos =
        getVideoElements();

    if (!videos.length) return;


    if (current < videos.length - 1) {

        current++;

        playCurrent();

    }

}


function previousVideo() {

    const videos =
        getVideoElements();

    if (!videos.length) return;


    if (current > 0) {

        current--;

        playCurrent();

    }

}


feed.addEventListener(
    "touchstart",
    function(e) {

        startY =
            e.touches[0].clientY;

    },
    { passive: true }
);


feed.addEventListener(
    "touchend",
    function(e) {

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


getVideos();
